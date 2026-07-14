"use server";

import { createSession, deleteSession } from "@/lib/auth";
import { verifyPassword, createPasswordResetToken, verifyResetToken, markTokenAsUsed, hashPassword, validatePasswordStrength } from "@/lib/password";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
    password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
    organizationId: z.string().min(1, { message: "المنظمة مطلوبة" }),
    departmentId: z.string().min(1, { message: "القسم مطلوب" }),
});

export async function login(prevState: unknown, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const { email, password, organizationId, departmentId } = result.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !(await verifyPassword(password, user.password))) {
            return {
                errors: {
                    email: ["البريد الإلكتروني أو كلمة المرور غير صحيحة"],
                },
            };
        }

        // Check Organization and Department Match
        if (user.organizationId !== organizationId || user.departmentId !== departmentId) {
            return {
                errors: {
                    organizationId: ["البيانات المدخلة لا تتطابق مع سجلات المستخدم"],
                },
            };
        }

        // ✅ Now includes userName so activity logs are complete
        await createSession(
            user.id,
            user.name,
            user.role,
            user.organizationId,
            user.departmentId,
            user.organizationName,
            user.departmentName
        );
    } catch (error) {
        console.error("Login error:", error);
        return {
            errors: {
                email: ["حدث خطأ في الخادم أثناء تسجيل الدخول"],
            },
        };
    }

    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
}

export async function getUser() {
    const session = await import("@/lib/auth").then((m) => m.getSession());
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
    });
    return user;
}

export async function getOrganizations() {
    const users = await prisma.user.findMany({
        select: {
            organizationId: true,
            organizationName: true,
        },
        distinct: ["organizationId"],
    });
    return users.map((u) => ({ id: u.organizationId, name: u.organizationName }));
}

export async function getDepartments(organizationId: string) {
    const users = await prisma.user.findMany({
        where: { organizationId },
        select: {
            departmentId: true,
            departmentName: true,
        },
        distinct: ["departmentId"],
    });
    return users.map((u) => ({ id: u.departmentId, name: u.departmentName }));
}

export async function requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });

    if (!user) {
        return { success: true, message: "إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين" };
    }

    const { token, expires } = await createPasswordResetToken(user.id);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    console.log(`
╔════════════════════════════════════════════════════════════╗
║            🔐 PASSWORD RESET EMAIL (DEV)                 ║
╠════════════════════════════════════════════════════════════╣
║  To: ${user.email.padEnd(50)} ║
║  User: ${user.name.padEnd(50)} ║
║  ──────────────────────────────────────────────────── ║
║  Reset Link: ${resetUrl}                                  ║
║  Expires: ${expires.toISOString().padEnd(45)} ║
╚════════════════════════════════════════════════════════════╝
    `);

    return { success: true, message: "إذا كان البريد الإلكتروني مسجلاً، سيتم إرسال رابط إعادة التعيين" };
}

export async function resetPassword(token: string, newPassword: string) {
    const validation = validatePasswordStrength(newPassword);
    if (!validation.valid) {
        return { success: false, errors: validation.errors };
    }

    const tokenResult = await verifyResetToken(token);
    if (!tokenResult.valid) {
        return { success: false, error: tokenResult.error };
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: tokenResult.userId },
        data: { password: hashedPassword },
    });

    await markTokenAsUsed(token);

    return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
}
