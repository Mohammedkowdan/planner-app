"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { hashPassword, validatePasswordStrength } from "@/lib/password";

const userSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    name: z.string().min(2),
    role: z.enum(["ADMIN", "MANAGER", "USER", "SUPER_ADMIN"]),
    organizationId: z.string(),
    organizationName: z.string(),
    departmentId: z.string(),
    departmentName: z.string(),
});

type UserInput = z.infer<typeof userSchema>;

export async function getUsers() {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: "فشل في جلب قائمة المستخدمين" };
    }
}

export async function createUser(data: UserInput) {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
        return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };
    }

    const result = userSchema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            error: "بيانات غير صالحة",
            errors: result.error.flatten().fieldErrors,
        };
    }

    const passwordValidation = validatePasswordStrength(result.data.password);
    if (!passwordValidation.valid) {
        return {
            success: false,
            error: "كلمة المرور لا تستوفي المتطلبات",
            errors: passwordValidation.errors,
        };
    }

    if (result.data.role === "MANAGER") {
        const existingManager = await prisma.user.findFirst({
            where: {
                departmentId: result.data.departmentId,
                role: "MANAGER"
            }
        });
        if (existingManager) {
            return { success: false, error: "يوجد مدير بالفعل لهذا القسم. لا يمكن تعيين أكثر من مدير واحد لنفس القسم." };
        }
    }

    if (result.data.role === "SUPER_ADMIN") {
        const superAdminsCount = await prisma.user.count({
            where: { role: "SUPER_ADMIN" }
        });
        if (superAdminsCount >= 3) {
            return { success: false, error: "تم الوصول للحد الأقصى للمدراء الرئيسيين (3). لا يمكن إضافة المزيد." };
        }
    }

    try {
        await prisma.user.create({
            data: {
                email: result.data.email,
                name: result.data.name,
                role: result.data.role,
                organizationId: result.data.organizationId,
                organizationName: result.data.organizationName,
                departmentId: result.data.departmentId,
                departmentName: result.data.departmentName,
                password: await hashPassword(result.data.password),
            },
        });
        revalidatePath("/settings/users");
        return { success: true };
    } catch (e) {
        return { success: false, error: "فشل في إنشاء المستخدم. قد يكون البريد الإلكتروني مستخدماً بالفعل." };
    }
}

export async function deleteUser(userId: string) {
    const session = await getSession();
    if (session?.role !== "ADMIN") return { error: "غير مصرح لك بالقيام بهذا الإجراء" };

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/settings/users");
}

export async function updateUser(userId: string, data: Partial<UserInput>) {
    const session = await getSession();
    if (session?.role !== "ADMIN") return { success: false, error: "غير مصرح لك بالقيام بهذا الإجراء" };

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) return { success: false, error: "المستخدم غير موجود" };

        const targetRole = data.role ?? existingUser.role;
        const targetDeptId = data.departmentId ?? existingUser.departmentId;

        if (targetRole === "MANAGER") {
            const existingManager = await prisma.user.findFirst({
                where: {
                    departmentId: targetDeptId,
                    role: "MANAGER",
                    id: { not: userId }
                }
            });
            if (existingManager) {
                return { success: false, error: "يوجد مدير بالفعل لهذا القسم. لا يمكن تعيين أكثر من مدير واحد لنفس القسم." };
            }
        }

        if (targetRole === "SUPER_ADMIN" && existingUser.role !== "SUPER_ADMIN") {
            const superAdminsCount = await prisma.user.count({
                where: { role: "SUPER_ADMIN" }
            });
            if (superAdminsCount >= 3) {
                return { success: false, error: "تم الوصول للحد الأقصى للمدراء الرئيسيين (3). لا يمكن تعيين المزيد." };
            }
        }
        await prisma.user.update({
            where: { id: userId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        revalidatePath("/settings/users");
        return { success: true };
    } catch (e) {
        return { success: false, error: "فشل في تحديث بيانات المستخدم" };
    }
}
