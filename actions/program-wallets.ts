"use server"

import { prisma } from "@/lib/db"
import { logActivity, logError } from "@/lib/activity"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createWalletSchema = z.object({
    name: z.string().min(1, "اسم الحقيبة مطلوب"),
    description: z.string().optional(),
    mainGoalId: z.string().min(1, "الهدف العام مطلوب"),
})

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createProgramWallet(formData: { name: string; description?: string; mainGoalId: string }) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const validation = createWalletSchema.safeParse(formData)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }

    try {
        // ✅ Verify the linked MainGoal belongs to this tenant (org + dept)
        const parentGoal = await prisma.mainGoal.findFirst({
            where: {
                id: validation.data.mainGoalId,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
        })
        if (!parentGoal) return { error: "الهدف العام غير موجود أو غير مصرح لك" }

        const wallet = await prisma.programWallet.create({
            data: {
                name: validation.data.name,
                description: validation.data.description,
                mainGoalId: validation.data.mainGoalId,
                organizationId: session.orgId,
                organizationName: session.orgName || "",
                departmentId: session.deptId,
                departmentName: session.deptName || "",
            },
        })

        await logActivity(session.userId, session.userName, "Create", "Program Wallet", wallet.name)
        revalidatePath("/program-wallets")
        return { success: true, data: wallet }
    } catch (error) {
        logError("createProgramWallet", error)
        return { error: "فشل في إنشاء حقيبة البرامج" }
    }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProgramWallets() {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        const wallets = await prisma.programWallet.findMany({
            where: {
                // ✅ Full tenant isolation: org + dept
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
            include: {
                mainGoal: true,
                _count: {
                    select: { programs: true },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return { success: true, data: wallets }
    } catch (error) {
        logError("getProgramWallets", error)
        return { error: "فشل في جلب حقائب البرامج" }
    }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateProgramWallet(
    id: string,
    formData: { name: string; description?: string; mainGoalId: string }
) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    const validation = createWalletSchema.safeParse(formData)
    if (!validation.success) {
        return { error: validation.error.errors[0].message }
    }

    try {
        // ✅ Ownership check: scoped to org + dept
        const existing = await prisma.programWallet.findFirst({
            where: { id, organizationId: session.orgId, departmentId: session.deptId },
        })
        if (!existing) throw new Error("Unauthorized or not found")

        // ✅ Also verify the target main goal belongs to this tenant
        const parentGoal = await prisma.mainGoal.findFirst({
            where: {
                id: validation.data.mainGoalId,
                organizationId: session.orgId,
                departmentId: session.deptId,
            },
        })
        if (!parentGoal) return { error: "الهدف العام غير موجود أو غير مصرح لك" }

        const wallet = await prisma.programWallet.update({
            where: { id },
            data: {
                name: validation.data.name,
                description: validation.data.description,
                mainGoalId: validation.data.mainGoalId,
            },
        })

        await logActivity(session.userId, session.userName, "Update", "Program Wallet", wallet.name)
        revalidatePath("/program-wallets")
        return { success: true, data: wallet }
    } catch (error) {
        logError("updateProgramWallet", error)
        return { error: "فشل في تحديث حقيبة البرامج" }
    }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteProgramWallet(id: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        // ✅ Ownership check: scoped to org + dept
        const wallet = await prisma.programWallet.delete({
            where: { id, organizationId: session.orgId, departmentId: session.deptId },
        })
        await logActivity(session.userId, session.userName, "Delete", "Program Wallet", wallet.name)
        revalidatePath("/program-wallets")
        return { success: true }
    } catch (error) {
        logError("deleteProgramWallet", error)
        return { error: "فشل في حذف حقيبة البرامج" }
    }
}
