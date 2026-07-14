"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logActivity, logError } from "@/lib/activity"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const subGoalSchema = z.object({
    name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    description: z.string().optional(),
    mainGoalId: z.string().min(1, "الهدف العام مطلوب"),
})

const subGoalUpdateSchema = z.object({
    name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
    description: z.string().optional(),
})

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getSubGoals(mainGoalId: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated", data: [] }

    try {
        const subGoals = await prisma.subGoal.findMany({
            where: {
                mainGoalId,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            include: {
                _count: { select: { indicators: true } },
            },
            orderBy: { createdAt: "asc" },
        })
        return { success: true, data: subGoals }
    } catch (error) {
        logError("getSubGoals", error)
        return { error: "فشل في جلب الأهداف الفرعية", data: [] }
    }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSubGoal(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        mainGoalId: formData.get("mainGoalId"),
    }

    const result = subGoalSchema.safeParse(rawData)
    if (!result.success) {
        return { error: "Validation failed", errors: result.error.flatten().fieldErrors }
    }

    try {
        // Verify the parent MainGoal belongs to this tenant
        const parentGoal = await prisma.mainGoal.findFirst({
            where: {
                id: result.data.mainGoalId,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            select: { id: true, yearId: true },
        })
        if (!parentGoal) return { error: "الهدف العام غير موجود أو غير مصرح لك" }

        const subGoal = await prisma.subGoal.create({
            data: {
                name: result.data.name,
                description: result.data.description || "",
                mainGoalId: result.data.mainGoalId,
                yearId: parentGoal.yearId,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        await logActivity(session.userId, session.userName, "Create", "Sub Goal", subGoal.name)
        revalidatePath("/main-goals")
        return { success: true, data: subGoal }
    } catch (error) {
        logError("createSubGoal", error)
        return { error: "فشل في إنشاء الهدف الفرعي" }
    }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSubGoal(id: string, data: { name: string; description?: string }) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const result = subGoalUpdateSchema.safeParse(data)
    if (!result.success) {
        return { error: "Validation failed", errors: result.error.flatten().fieldErrors }
    }

    try {
        const subGoal = await prisma.subGoal.update({
            where: {
                id,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            data: {
                name: result.data.name,
                description: result.data.description || "",
            },
        })
        await logActivity(session.userId, session.userName, "Update", "Sub Goal", subGoal.name)
        revalidatePath("/main-goals")
        return { success: true }
    } catch (error) {
        logError("updateSubGoal", error)
        return { error: "فشل في تحديث الهدف الفرعي" }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSubGoal(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        const subGoal = await prisma.subGoal.delete({
            where: {
                id,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
        })
        await logActivity(session.userId, session.userName, "Delete", "Sub Goal", subGoal.name)
        revalidatePath("/main-goals")
        return { success: true }
    } catch (error) {
        logError("deleteSubGoal", error)
        return { error: "فشل في حذف الهدف الفرعي" }
    }
}
