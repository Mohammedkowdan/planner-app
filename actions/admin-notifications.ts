"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logError } from "@/lib/activity"
import { createNotification } from "./notifications"

function isAdminOrAbove(role: string) {
    return role === "ADMIN" || role === "SUPER_ADMIN"
}

function isSuperAdmin(role: string) {
    return role === "SUPER_ADMIN"
}

export async function getAdminUsersForNotification(orgId?: string, deptId?: string) {
    const session = await getSession()
    if (!session || !isAdminOrAbove(session.role)) {
        return { error: "غير مصرح لك", data: [] }
    }

    // ADMIN is locked to their own org
    const targetOrg = isSuperAdmin(session.role) ? orgId : session.orgId

    if (!targetOrg) {
        return { success: true, data: [] }
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                organizationId: targetOrg,
                ...(deptId ? { departmentId: deptId } : {})
            },
            select: { id: true, name: true, departmentName: true }
        })
        return { success: true, data: users }
    } catch (e) {
        logError("getAdminUsersForNotification", e)
        return { error: "فشل في جلب المستخدمين", data: [] }
    }
}

export async function broadcastNotification(data: {
    title: string;
    message: string;
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    link?: string;
    targetOrgId?: string;
    targetDeptId?: string;
    targetUserId?: string;
}) {
    const session = await getSession()
    if (!session || !isAdminOrAbove(session.role)) {
        return { error: "غير مصرح لك" }
    }

    const targetOrg = isSuperAdmin(session.role) ? data.targetOrgId : session.orgId

    if (!targetOrg) {
        return { error: "يرجى تحديد المنظمة" }
    }

    try {
        // Find matching users based on scope
        const users = await prisma.user.findMany({
            where: {
                organizationId: targetOrg,
                ...(data.targetDeptId ? { departmentId: data.targetDeptId } : {}),
                ...(data.targetUserId ? { id: data.targetUserId } : {})
            },
            select: { id: true }
        })

        if (users.length === 0) {
            return { error: "لم يتم العثور على مستخدمين بهذا النطاق" }
        }

        // Broadcast notification to all matched users
        // Note: Using individual creates because Prisma SQLite/PG createMany might not trigger middleware if any
        // But for bulk, createMany is better. We will just map over them and use createNotification from existing actions
        // to maintain consistency.
        const promises = users.map(u => 
            createNotification({
                userId: u.id,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link
            })
        )

        await Promise.all(promises)

        return { success: true, message: `تم إرسال التنبيه إلى ${users.length} مستخدم` }
    } catch (e) {
        logError("broadcastNotification", e)
        return { error: "فشل في إرسال التنبيه" }
    }
}
