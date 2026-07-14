"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logActivity, logError } from "@/lib/activity"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const mainGoalSchema = z.object({
    name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    description: z.string().optional(),
})

const mainGoalWithYearSchema = mainGoalSchema.extend({
    yearId: z.string().min(1, "سنة التخطيط مطلوبة"),
})

export async function getMainGoals() {
    const session = await getSession()
    if (!session) return { error: "Not authenticated", data: [] }

    try {
        const mainGoals = await prisma.mainGoal.findMany({
            where: {
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            include: {
                year: { select: { id: true, name: true, year: true } },
                subGoals: {
                    include: {
                        _count: { select: { indicators: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { indicators: true } },
            },
            orderBy: { createdAt: "desc" },
        })
        return { success: true, data: mainGoals }
    } catch (error) {
        logError("getMainGoals", error)
        return { error: "فشل في جلب الأهداف العامة", data: [] }
    }
}

export async function createMainGoal(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        yearId: formData.get("yearId"),
    }

    const result = mainGoalWithYearSchema.safeParse(rawData)
    if (!result.success) {
        return { error: "Validation failed", errors: result.error.flatten().fieldErrors }
    }

    try {
        await prisma.mainGoal.create({
            data: {
                name: result.data.name,
                description: result.data.description || "",
                yearId: result.data.yearId,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        await logActivity(session.userId, session.userName, "Create", "Main Goal", result.data.name)
        revalidatePath("/main-goals")
        return { success: true }
    } catch (error) {
        logError("createMainGoal", error)
        return { error: "فشل في إنشاء الهدف العام" }
    }
}

export async function updateMainGoal(id: string, formData: { name: string; description?: string; yearId?: string }) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const result = mainGoalSchema.safeParse(formData)
    if (!result.success) {
        return { error: "Validation failed", errors: result.error.flatten().fieldErrors }
    }

    try {
        // ✅ Ownership check ensures users can only update their dept/org goals
        const goal = await prisma.mainGoal.update({
            where: {
                id,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            data: {
                name: result.data.name,
                description: result.data.description || "",
                ...(formData.yearId ? { yearId: formData.yearId } : {}),
            },
        })
        await logActivity(session.userId, session.userName, "Update", "Main Goal", goal.name)
        revalidatePath("/main-goals")
        return { success: true }
    } catch (error) {
        logError("updateMainGoal", error)
        return { error: "فشل في تحديث الهدف العام" }
    }
}

export async function deleteMainGoal(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        // ✅ Ownership check
        const goal = await prisma.mainGoal.delete({
            where: {
                id,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
        })
        await logActivity(session.userId, session.userName, "Delete", "Main Goal", goal.name)
        revalidatePath("/main-goals")
        return { success: true }
    } catch (error) {
        logError("deleteMainGoal", error)
        return { error: "فشل في حذف الهدف العام" }
    }
}
