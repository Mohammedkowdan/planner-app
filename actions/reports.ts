"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function getReportsOverviewData() {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const where = {
    organizationId: session.orgId,
    departmentId: session.deptId,
  };

  try {
    const [
      indicatorCount,
      programCount,
      activityCount,
      annualReportCount,
      programs,
      onTrackIndicators,
      allIndicators,
      categoryGroups,
    ] = await Promise.all([
      prisma.indicator.count({ where }),
      prisma.program.count({ where }),
      prisma.activity.count({ where }),
      prisma.annualReport.count({ where }),
      prisma.program.findMany({ 
        where,
        select: { name: true, budget: true, spent: true },
        take: 5
      }),
      prisma.indicator.count({ 
        where: { ...where, status: "ON_TRACK" } 
      }),
      prisma.indicator.findMany({
        where,
        select: {
          q1Target: true, q1Actual: true,
          q2Target: true, q2Actual: true,
          q3Target: true, q3Actual: true,
          q4Target: true, q4Actual: true,
        }
      }),
      prisma.indicator.groupBy({
        by: ['category'],
        where,
        _count: true
      })
    ]);

    const totalBudget = programs.reduce((sum, p) => sum + Number(p.budget), 0);
    const totalSpent = programs.reduce((sum, p) => sum + Number(p.spent), 0);
    const indicatorSuccessRate = indicatorCount > 0 ? (onTrackIndicators / indicatorCount) * 100 : 0;

    // Calculate quarterly averages
    const calculateQuarterAvg = (actualKey: string, targetKey: string) => {
      let total = 0;
      let count = 0;
      allIndicators.forEach(ind => {
        const target = (ind as any)[targetKey];
        const actual = (ind as any)[actualKey];
        if (target > 0) {
          total += (actual / target) * 100;
          count++;
        }
      });
      return count > 0 ? Math.round(total / count) : 0;
    };

    const indicatorProgressData = [
      { name: "Q1", value: calculateQuarterAvg('q1Actual', 'q1Target') },
      { name: "Q2", value: calculateQuarterAvg('q2Actual', 'q2Target') },
      { name: "Q3", value: calculateQuarterAvg('q3Actual', 'q3Target') },
      { name: "Q4", value: calculateQuarterAvg('q4Actual', 'q4Target') },
    ];

    const programBudgetData = programs.map(p => ({
      name: p.name,
      budget: Number(p.budget),
      spent: Number(p.spent)
    }));

    const COLORS = ["#1a508e", "#9bc24c", "#5b8fc7", "#b5d167", "#3a6da6", "#7fb244"];
    const categoryData = categoryGroups.map((g, i) => ({
      name: g.category,
      value: g._count,
      color: COLORS[i % COLORS.length]
    }));

    return {
      success: true,
      data: {
        indicatorCount,
        programCount,
        activityCount,
        annualReportCount,
        totalBudget,
        totalSpent,
        indicatorSuccessRate,
        charts: {
          indicatorProgressData,
          programBudgetData,
          categoryData
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
