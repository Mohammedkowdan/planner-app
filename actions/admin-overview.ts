"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { logError } from "@/lib/activity"
import { revalidatePath } from "next/cache"
// ─── Role Guards ──────────────────────────────────────────────────────────────

function isAdminOrAbove(role: string) {
    return role === "ADMIN" || role === "SUPER_ADMIN"
}

function isSuperAdmin(role: string) {
    return role === "SUPER_ADMIN"
}

// ─── Org / Dept Discovery ─────────────────────────────────────────────────────

/** Returns all distinct orgs that have data (users) — SUPER_ADMIN only */
export async function getAdminOrgs() {
    const session = await getSession()
    if (!session || !isSuperAdmin(session.role)) {
        return { error: "غير مصرح لك", data: [] }
    }
    try {
        const rows = await prisma.user.findMany({
            select: { organizationId: true, organizationName: true },
            distinct: ["organizationId"],
            orderBy: { organizationName: "asc" },
        })
        return { success: true, data: rows.map(r => ({ id: r.organizationId, name: r.organizationName })) }
    } catch (e) {
        logError("getAdminOrgs", e)
        return { error: "فشل في جلب المنظمات", data: [] }
    }
}

/** Returns all distinct depts within an org that have data — ADMIN+ */
export async function getAdminDepts(orgId: string) {
    const session = await getSession()
    if (!session || !isAdminOrAbove(session.role)) {
        return { error: "غير مصرح لك", data: [] }
    }
    // ADMIN can only query their own org
    const targetOrg = isSuperAdmin(session.role) ? orgId : session.orgId
    try {
        const rows = await prisma.user.findMany({
            where: { organizationId: targetOrg },
            select: { departmentId: true, departmentName: true },
            distinct: ["departmentId"],
            orderBy: { departmentName: "asc" },
        })
        return { success: true, data: rows.map(r => ({ id: r.departmentId, name: r.departmentName })) }
    } catch (e) {
        logError("getAdminDepts", e)
        return { error: "فشل في جلب الأقسام", data: [] }
    }
}

// ─── Full Hierarchy Read ──────────────────────────────────────────────────────

/** Fetches the full planning hierarchy for a specific org+dept scope */
export async function getAdminHierarchy(orgId: string, deptId: string) {
    const session = await getSession()
    if (!session || !isAdminOrAbove(session.role)) {
        return { error: "غير مصرح لك" }
    }
    // ADMIN is locked to their own org
    const targetOrg = isSuperAdmin(session.role) ? orgId : session.orgId

    try {
        const mainGoals = await prisma.mainGoal.findMany({
            where: { organizationId: targetOrg, departmentId: deptId },
            include: {
                year: { select: { id: true, name: true, year: true } },
                subGoals: {
                    include: {
                        indicators: {
                            orderBy: { createdAt: "asc" },
                        },
                        _count: { select: { indicators: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
                programWallets: {
                    include: {
                        _count: { select: { programs: true } },
                    },
                },
                indicators: {
                    where: { subGoalId: null }, // only direct indicators (not under sub-goals)
                    orderBy: { createdAt: "asc" },
                },
                _count: { select: { indicators: true, subGoals: true } },
            },
            orderBy: { createdAt: "desc" },
        })

        return { success: true, data: mainGoals }
    } catch (e) {
        logError("getAdminHierarchy", e)
        return { error: "فشل في جلب البيانات" }
    }
}

// ─── Cross-Tenant CRUD ─────────────────────────────────────────────────────────
// All mutations verify admin-level access and validate the target org matches
// ADMIN's own org (or any org for SUPER_ADMIN).

function assertAdminScope(session: { role: string; orgId: string }, targetOrgId: string): string | null {
    if (!isAdminOrAbove(session.role)) return "غير مصرح لك"
    if (!isSuperAdmin(session.role) && session.orgId !== targetOrgId) return "لا يمكنك تعديل بيانات منظمة أخرى"
    return null
}

// ── Main Goals ────────────────────────────────────────────────────────────────

export async function adminCreateMainGoal(data: {
    name: string; description?: string; yearId?: string
    organizationId: string; organizationName: string
    departmentId: string; departmentName: string
}) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const err = assertAdminScope(session, data.organizationId)
    if (err) return { error: err }

    try {
        const goal = await prisma.mainGoal.create({ data })
        revalidatePath("/admin/overview")
        return { success: true, data: goal }
    } catch (e) {
        logError("adminCreateMainGoal", e)
        return { error: "فشل في إنشاء الهدف العام" }
    }
}

export async function adminUpdateMainGoal(id: string, data: { name: string; description?: string }) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const existing = await prisma.mainGoal.findUnique({ where: { id } })
    if (!existing) return { error: "الهدف غير موجود" }
    const err = assertAdminScope(session, existing.organizationId)
    if (err) return { error: err }
    try {
        const goal = await prisma.mainGoal.update({ where: { id }, data })
        revalidatePath("/admin/overview")
        return { success: true, data: goal }
    } catch (e) {
        logError("adminUpdateMainGoal", e)
        return { error: "فشل في تحديث الهدف العام" }
    }
}

export async function adminDeleteMainGoal(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const existing = await prisma.mainGoal.findUnique({ where: { id } })
    if (!existing) return { error: "الهدف غير موجود" }
    const err = assertAdminScope(session, existing.organizationId)
    if (err) return { error: err }
    try {
        await prisma.mainGoal.delete({ where: { id } })
        revalidatePath("/admin/overview")
        return { success: true }
    } catch (e) {
        logError("adminDeleteMainGoal", e)
        return { error: "فشل في حذف الهدف العام" }
    }
}

// ── Sub Goals ─────────────────────────────────────────────────────────────────

export async function adminCreateSubGoal(data: {
    name: string; description?: string; mainGoalId: string
    organizationId: string; organizationName: string
    departmentId: string; departmentName: string; yearId?: string | null
}) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const err = assertAdminScope(session, data.organizationId)
    if (err) return { error: err }
    try {
        const sg = await prisma.subGoal.create({ data })
        revalidatePath("/admin/overview")
        return { success: true, data: sg }
    } catch (e) {
        logError("adminCreateSubGoal", e)
        return { error: "فشل في إنشاء الهدف الفرعي" }
    }
}

export async function adminUpdateSubGoal(id: string, data: { name: string; description?: string }) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const existing = await prisma.subGoal.findUnique({ where: { id } })
    if (!existing) return { error: "الهدف الفرعي غير موجود" }
    const err = assertAdminScope(session, existing.organizationId)
    if (err) return { error: err }
    try {
        const sg = await prisma.subGoal.update({ where: { id }, data })
        revalidatePath("/admin/overview")
        return { success: true, data: sg }
    } catch (e) {
        logError("adminUpdateSubGoal", e)
        return { error: "فشل في تحديث الهدف الفرعي" }
    }
}

export async function adminDeleteSubGoal(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const existing = await prisma.subGoal.findUnique({ where: { id } })
    if (!existing) return { error: "الهدف الفرعي غير موجود" }
    const err = assertAdminScope(session, existing.organizationId)
    if (err) return { error: err }
    try {
        await prisma.subGoal.delete({ where: { id } })
        revalidatePath("/admin/overview")
        return { success: true }
    } catch (e) {
        logError("adminDeleteSubGoal", e)
        return { error: "فشل في حذف الهدف الفرعي" }
    }
}

// ── Program Wallets (Bags) ────────────────────────────────────────────────────

export async function adminCreateWallet(data: {
    name: string; description?: string; mainGoalId: string
    organizationId: string; organizationName: string
    departmentId: string; departmentName: string
}) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const err = assertAdminScope(session, data.organizationId)
    if (err) return { error: err }
    try {
        const wallet = await prisma.programWallet.create({ data })
        revalidatePath("/admin/overview")
        return { success: true, data: wallet }
    } catch (e) {
        logError("adminCreateWallet", e)
        return { error: "فشل في إنشاء حقيبة البرامج" }
    }
}

export async function adminDeleteWallet(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }
    const existing = await prisma.programWallet.findUnique({ where: { id } })
    if (!existing) return { error: "الحقيبة غير موجودة" }
    const err = assertAdminScope(session, existing.organizationId)
    if (err) return { error: err }
    try {
        await prisma.programWallet.delete({ where: { id } })
        revalidatePath("/admin/overview")
        return { success: true }
    } catch (e) {
        logError("adminDeleteWallet", e)
        return { error: "فشل في حذف الحقيبة" }
    }
}
