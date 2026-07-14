"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createProjectStatistic(data: {
    projectName: string;
    mainGoalId: string;
    subGoalId: string;
    governorate: string;
    familiesCount: number;
    boysCount: number;
    girlsCount: number;
    menCount: number;
    womenCount: number;
    budgetUsd: number;
}) {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك" };

    try {
        const achievement = await prisma.projectAchievement.create({
            data: {
                projectName: data.projectName,
                mainGoalId: data.mainGoalId,
                subGoalId: data.subGoalId,
                governorate: data.governorate,
                familiesCount: data.familiesCount,
                boysCount: data.boysCount,
                girlsCount: data.girlsCount,
                menCount: data.menCount,
                womenCount: data.womenCount,
                budgetUsd: data.budgetUsd,
                organizationId: session.orgId,
                organizationName: session.orgName,
                departmentId: session.deptId,
                departmentName: session.deptName,
            }
        });

        revalidatePath("/statistics");
        revalidatePath("/achievements/new");
        return { success: true, data: achievement };
    } catch (error) {
        console.error("Failed to save project statistic:", error);
        return { success: false, error: "حدث خطأ أثناء حفظ البيانات" };
    }
}

export async function getProjectStatistics() {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك", data: [] };

    try {
        const stats = await prisma.projectAchievement.findMany({
            where: {
                organizationId: session.orgId,
                ...(session.role !== "SUPER_ADMIN" && { departmentId: session.deptId })
            },
            include: {
                mainGoal: true,
                subGoal: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return { success: true, data: stats };
    } catch (error) {
        console.error("Failed to fetch project statistics:", error);
        return { success: false, error: "حدث خطأ أثناء جلب البيانات", data: [] };
    }
}

export async function getMainGoalsAndSubGoals() {
    const session = await getSession();
    if (!session) return { success: false, error: "غير مصرح لك", data: [] };

    try {
        const mainGoals = await prisma.mainGoal.findMany({
            where: {
                organizationId: session.orgId,
                ...(session.role !== "SUPER_ADMIN" && { departmentId: session.deptId })
            },
            include: {
                subGoals: true,
                indicators: true
            }
        });

        return { success: true, data: mainGoals };
    } catch (error) {
        console.error("Failed to fetch goals:", error);
        return { success: false, error: "حدث خطأ أثناء جلب الأهداف", data: [] };
    }
}
