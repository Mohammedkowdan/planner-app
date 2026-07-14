"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function getOrganizationSettings() {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك" };

    try {
        const settings = await prisma.organizationSettings.findUnique({
            where: {
                organizationId_departmentId: {
                    organizationId: session.orgId,
                    departmentId: session.deptId,
                }
            }
        });
        
        return { success: true, data: settings };
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return { success: false, error: "فشل جلب الإعدادات" };
    }
}

export async function updateReportSettings(data: {
    reportHeaderText?: string;
    reportFooterText?: string;
    reportHeaderImage?: string;
    reportFooterImage?: string;
}) {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك" };

    try {
        const settings = await prisma.organizationSettings.upsert({
            where: {
                organizationId_departmentId: {
                    organizationId: session.orgId,
                    departmentId: session.deptId,
                }
            },
            update: {
                reportHeaderText: data.reportHeaderText,
                reportFooterText: data.reportFooterText,
                ...(data.reportHeaderImage !== undefined && { reportHeaderImage: data.reportHeaderImage }),
                ...(data.reportFooterImage !== undefined && { reportFooterImage: data.reportFooterImage }),
            },
            create: {
                organizationId: session.orgId,
                departmentId: session.deptId,
                reportHeaderText: data.reportHeaderText,
                reportFooterText: data.reportFooterText,
                reportHeaderImage: data.reportHeaderImage,
                reportFooterImage: data.reportFooterImage,
            }
        });

        revalidatePath("/settings");
        return { success: true, data: settings };
    } catch (error) {
        console.error("Failed to update report settings:", error);
        return { success: false, error: "فشل حفظ إعدادات التقارير" };
    }
}

export async function updateProfile(data: { name?: string; currentPassword?: string; newPassword?: string }) {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك" };

    try {
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (!user) return { success: false, error: "المستخدم غير موجود" };

        let updateData: any = {};
        if (data.name) updateData.name = data.name;

        if (data.newPassword && data.currentPassword) {
            const isValid = await verifyPassword(data.currentPassword, user.password);
            if (!isValid) return { success: false, error: "كلمة المرور الحالية غير صحيحة" };
            updateData.password = await hashPassword(data.newPassword);
        } else if (data.newPassword && !data.currentPassword) {
            return { success: false, error: "يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور" };
        }

        await prisma.user.update({
            where: { id: session.userId },
            data: updateData
        });

        revalidatePath("/settings");
        return { success: true, message: "تم تحديث الملف الشخصي بنجاح" };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: "فشل تحديث الملف الشخصي" };
    }
}
