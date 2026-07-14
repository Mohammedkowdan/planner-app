"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logActivity, logError } from "@/lib/activity"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Role, ProgressStatus } from "@/generated/prisma/client"

// ─── Shared Types ───────────────────────────────────────────────────────────

interface PlanningYearData {
    name: string
    year: number
    startDate: string
    endDate: string
    status?: string
}

interface ProgramData {
    name: string
    description?: string
    budget: number
    spent?: number
    startDate: string
    endDate: string
    status?: string
    progress?: number
    initiatives?: unknown[]
    programWalletId?: string
    yearId?: string
    department?: string
}

interface ActivityCreateData {
    name: string
    description?: string
    startDate: string
    endDate: string
    duration: number
    project?: string
    department?: string
    status?: string
    color?: string
    assignedUserId?: string
    yearId: string
}

interface ActivityUpdateData {
    name?: string
    description?: string
    startDate?: string
    endDate?: string
    duration?: number
    project?: string
    department?: string
    status?: string
    color?: string
    assignedUserId?: string
}

// ─── Planning Years ──────────────────────────────────────────────────────────

export async function getPlanningYears() {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const years = await prisma.planningYear.findMany({
            where: {
                organizationId: session.orgId,
            },
            orderBy: { year: "desc" },
        })
        return { success: true, data: years }
    } catch (error) {
        logError("getPlanningYears", error)
        return { success: false, error: "فشل في جلب سنوات التخطيط" }
    }
}

export async function createPlanningYear(data: PlanningYearData) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }
    if (session.role !== Role.ADMIN) return { success: false, error: "غير مصرح لك بإنشاء سنوات تخطيطية" }

    try {
        const year = await prisma.planningYear.create({
            data: {
                name: data.name,
                year: data.year,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: (data.status?.toUpperCase() as "ACTIVE" | "DRAFT" | "COMPLETED" | "ARCHIVED") || "ACTIVE",
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        revalidatePath("/dashboard")
        revalidatePath("/planning-years")
        return { success: true, data: year }
    } catch (error) {
        logError("createPlanningYear", error)
        return { success: false, error: "فشل في إنشاء سنة التخطيط" }
    }
}

export async function updatePlanningYear(id: string, data: Partial<PlanningYearData>) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }
    if (session.role !== Role.ADMIN) return { success: false, error: "غير مصرح لك بتعديل سنوات تخطيطية" }

    try {
        const updateData: Record<string, unknown> = { ...data }
        if (data.startDate) updateData.startDate = new Date(data.startDate)
        if (data.endDate) updateData.endDate = new Date(data.endDate)
        if (data.status) updateData.status = data.status.toUpperCase() as "ACTIVE" | "DRAFT" | "COMPLETED" | "ARCHIVED"

        // Ownership check: any admin in the organization can update
        const existing = await prisma.planningYear.findFirst({ where: { id, organizationId: session.orgId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const year = await prisma.planningYear.update({ where: { id }, data: updateData, })
        revalidatePath("/dashboard")
        revalidatePath("/planning-years")
        return { success: true, data: year }
    } catch (error) {
        logError("updatePlanningYear", error)
        return { success: false, error: "فشل في تحديث سنة التخطيط" }
    }
}

export async function getPlanningYear(id: string) {
    if (!id) return { error: "Year ID is required" }
    try {
        const year = await prisma.planningYear.findUnique({ where: { id } })
        if (!year) return { error: "Year not found" }
        return { success: true, data: year }
    } catch (error) {
        logError("getPlanningYear", error)
        return { success: false, error: "فشل في جلب سنة التخطيط" }
    }
}

// ─── Programs ────────────────────────────────────────────────────────────────

export async function getPrograms(yearId?: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const programs = await prisma.program.findMany({
            where: {
                organizationId: session.orgId,
                departmentId: session.deptId,
                ...(yearId ? { yearId } : {}),
            },
            orderBy: { createdAt: "desc" },
        })
        return { success: true, data: programs }
    } catch (error) {
        logError("getPrograms", error)
        return { success: false, error: "فشل في جلب البرامج" }
    }
}

export async function createProgram(data: ProgramData) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    if (!data.programWalletId) {
        return { success: false, error: "يجب اختيار حقيبة البرامج" }
    }

    try {
        const program = await prisma.program.create({
            data: {
                name: data.name,
                description: data.description,
                budget: data.budget,
                spent: data.spent ?? 0,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                status: (data.status as "ON_TRACK" | "AT_RISK" | "DELAYED" | "COMPLETED" | "PENDING" | "IN_PROGRESS") || "ON_TRACK",
                progress: data.progress ?? 0,
                initiatives: JSON.stringify(data.initiatives ?? []),
                programWalletId: data.programWalletId,
                yearId: data.yearId!,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        await logActivity(session.userId, session.userName, "Create", "Program", program.name)
        revalidatePath("/programs")
        return { success: true, data: program }
    } catch (error) {
        logError("createProgram", error)
        return { success: false, error: "فشل في إنشاء البرنامج" }
    }
}

export async function updateProgram(id: string, data: Partial<ProgramData>) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const updateData: Record<string, unknown> = { ...data }
        if (data.startDate) updateData.startDate = new Date(data.startDate)
        if (data.endDate) updateData.endDate = new Date(data.endDate)
        if (data.initiatives) updateData.initiatives = JSON.stringify(data.initiatives)

        // ✅ Ownership check: scoped to user's org and department
        const existing = await prisma.program.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const program = await prisma.program.update({ where: { id }, data: updateData, })
        await logActivity(session.userId, session.userName, "Update", "Program", program.name)
        revalidatePath("/programs")
        return { success: true, data: program }
    } catch (error) {
        logError("updateProgram", error)
        return { success: false, error: "فشل في تحديث البرنامج" }
    }
}

export async function deleteProgram(id: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        // ✅ Ownership check: scoped to user's org and department
        const existing = await prisma.program.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const program = await prisma.program.delete({ where: { id } })
        await logActivity(session.userId, session.userName, "Delete", "Program", program.name)
        revalidatePath("/programs")
        return { success: true }
    } catch (error) {
        logError("deleteProgram", error)
        return { success: false, error: "فشل في حذف البرنامج" }
    }
}

// ─── Indicators ──────────────────────────────────────────────────────────────

export async function getIndicators(yearId?: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const indicators = await prisma.indicator.findMany({
            where: {
                organizationId: session.orgId,
                departmentId: session.deptId,
                ...(yearId ? { yearId } : {}),
            },
            orderBy: { createdAt: "desc" },
        })
        return { success: true, data: indicators }
    } catch (error) {
        logError("getIndicators", error)
        return { success: false, error: "فشل في جلب المؤشرات" }
    }
}

const indicatorSchema = z.object({
    name: z.string().min(1, "اسم المؤشر مطلوب"),
    description: z.string().optional(),
    category: z.string().min(1, "التصنيف مطلوب"),
    baselineValue: z.number(),
    targetValue: z.number(),
    unit: z.string().min(1, "الوحدة مطلوبة"),
    yearId: z.string().min(1, "سنة التخطيط مطلوبة"),
    organizationId: z.string(),
    organizationName: z.string(),
    departmentId: z.string(),
    departmentName: z.string(),
    mainGoalId: z.string().optional().nullable(),
    subGoalId: z.string().optional().nullable(),
})

export type CreateIndicatorData = z.infer<typeof indicatorSchema>

export async function createIndicator(data: CreateIndicatorData) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const validation = indicatorSchema.safeParse(data)
    if (!validation.success) {
        return { error: validation.error.errors.map((e) => e.message).join(", ") }
    }

    try {
        const indicator = await prisma.indicator.create({
            data: {
                ...validation.data,
                mainGoalId: validation.data.mainGoalId || null,
                subGoalId: validation.data.subGoalId || null,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        await logActivity(session.userId, session.userName, "Create", "Indicator", indicator.name)
        revalidatePath("/indicators")
        revalidatePath("/main-goals")
        return { success: true, data: indicator }
    } catch (error) {
        logError("createIndicator", error)
        return { error: "فشل في إنشاء المؤشر" }
    }
}

const indicatorUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    baselineValue: z.number().optional(),
    targetValue: z.number().optional(),
    unit: z.string().optional(),
    q1Target: z.number().optional(),
    q1Actual: z.number().optional(),
    q2Target: z.number().optional(),
    q2Actual: z.number().optional(),
    q3Target: z.number().optional(),
    q3Actual: z.number().optional(),
    q4Target: z.number().optional(),
    q4Actual: z.number().optional(),
    status: z.nativeEnum(ProgressStatus).optional(),
    progress: z.number().optional(),
    mainGoalId: z.string().nullable().optional(),
    subGoalId: z.string().nullable().optional(),
})

export type UpdateIndicatorData = z.infer<typeof indicatorUpdateSchema>

export async function updateIndicator(id: string, data: UpdateIndicatorData) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    const validation = indicatorUpdateSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map((e) => e.message).join(", ") }
    }

    try {
        // ✅ Ownership check: scoped to user's org and department; only safe fields updated
        // Explicitly handle nullable mainGoalId and subGoalId for Prisma compatibility
        const { mainGoalId, subGoalId, ...rest } = validation.data
        const existing = await prisma.indicator.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const indicator = await prisma.indicator.update({ where: { id }, data: {
                ...rest,
                ...(mainGoalId !== undefined
                    ? { mainGoal: mainGoalId ? { connect: { id: mainGoalId } } : { disconnect: true } }
                    : {}),
                ...(subGoalId !== undefined
                    ? { subGoal: subGoalId ? { connect: { id: subGoalId } } : { disconnect: true } }
                    : {}),
            }, })
        await logActivity(session.userId, session.userName, "Update", "Indicator", indicator.name)
        revalidatePath("/indicators")
        revalidatePath("/main-goals")
        return { success: true, data: indicator }
    } catch (error) {
        logError("updateIndicator", error)
        return { success: false, error: "فشل في تحديث المؤشر" }
    }
}

export async function deleteIndicator(id: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        // ✅ Ownership check: scoped to user's org and department
        const existing = await prisma.indicator.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const indicator = await prisma.indicator.delete({ where: { id } })
        await logActivity(session.userId, session.userName, "Delete", "Indicator", indicator.name)
        revalidatePath("/indicators")
        return { success: true }
    } catch (error) {
        logError("deleteIndicator", error)
        return { success: false, error: "فشل في حذف المؤشر" }
    }
}

// ─── Activities ──────────────────────────────────────────────────────────────

export async function getActivities(yearId?: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const activities = await prisma.activity.findMany({
            where: {
                organizationId: session.orgId,
                departmentId: session.deptId,
                ...(yearId ? { yearId } : {}),
            },
            orderBy: { createdAt: "desc" },
            include: { assignedUser: { select: { id: true, name: true } } },
        })
        return { success: true, data: activities }
    } catch (error) {
        logError("getActivities", error)
        return { success: false, error: "فشل في جلب الأنشطة" }
    }
}

export async function createActivity(data: ActivityCreateData) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const activity = await prisma.activity.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                duration: data.duration,
                project: data.project,
                department: data.department,
                status: (data.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ON_TRACK" | "AT_RISK" | "DELAYED") || "PENDING",
                color: data.color,
                assignedUserId: data.assignedUserId,
                yearId: data.yearId,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })
        await logActivity(session.userId, session.userName, "Create", "Activity", activity.name)
        revalidatePath("/calendar")
        return { success: true, data: activity }
    } catch (error) {
        logError("createActivity", error)
        return { success: false, error: "فشل في إنشاء النشاط" }
    }
}

export async function updateActivity(id: string, data: ActivityUpdateData) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const updateData: Record<string, unknown> = { ...data }
        if (data.startDate) updateData.startDate = new Date(data.startDate)
        if (data.endDate) updateData.endDate = new Date(data.endDate)

        // ✅ Ownership check
        const existing = await prisma.activity.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const activity = await prisma.activity.update({ where: { id }, data: updateData, })
        await logActivity(session.userId, session.userName, "Update", "Activity", activity.name)
        revalidatePath("/calendar")
        return { success: true, data: activity }
    } catch (error) {
        logError("updateActivity", error)
        return { success: false, error: "فشل في تحديث النشاط" }
    }
}

export async function deleteActivity(id: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        // ✅ Ownership check
        const existing = await prisma.activity.findFirst({ where: { id, organizationId: session.orgId, departmentId: session.deptId } });
        if (!existing) throw new Error("Unauthorized or not found");
        const activity = await prisma.activity.delete({ where: { id } })
        await logActivity(session.userId, session.userName, "Delete", "Activity", activity.name)
        revalidatePath("/calendar")
        return { success: true }
    } catch (error) {
        logError("deleteActivity", error)
        return { success: false, error: "فشل في حذف النشاط" }
    }
}

export async function getTimelineActivities() {
    const session = await getSession()
    if (!session) return { success: false, error: "Not authenticated" }

    try {
        const activities = await prisma.activity.findMany({
            where: {
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            orderBy: { startDate: "asc" },
        })
        return { success: true, data: JSON.parse(JSON.stringify(activities)) }
    } catch (error) {
        logError("getTimelineActivities", error)
        return { success: false, error: "فشل في جلب أنشطة الجدول الزمني" }
    }
}
