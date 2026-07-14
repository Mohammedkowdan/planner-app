"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { Role, ProgressStatus } from "@/generated/prisma/client"

import { redirect } from "next/navigation"

export async function getUserDashboardData() {
    const session = await getSession()
    if (!session) redirect("/")

    const { userId, role, orgId, deptId } = session

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true }
    })

    if (!user) {
        redirect("/api/auth/clear-session")
    }

    // Filter Fetching Logic based on Role
    // ADMIN: Everything
    // MANAGER: Department level
    // USER: Assigned items

    const whereUser = { assignedUserId: userId }
    const whereDept = { departmentId: deptId }

    // For Programs/Indicators, User usually sees Department stuff but can't edit.
    // Or maybe they only see what they manage?
    // For dashboard "stats", usually users want to see "My Tasks" but also "My Dept Progress".

    // Let's go with:
    // Activities: Assigned to User (or all in Dept if Manager/Admin)
    // Programs: All in Dept (Manager/User), All (Admin)

    let activityWhere: any = {}
    let programWhere: any = {}
    let indicatorWhere: any = {}

    if (role === Role.ADMIN) {
        // No filters
    } else if (role === Role.MANAGER) {
        activityWhere = { departmentId: deptId }
        programWhere = { departmentId: deptId }
        indicatorWhere = { departmentId: deptId }
    } else { // USER
        activityWhere = { assignedUserId: userId }
        programWhere = { departmentId: deptId } // View only
        indicatorWhere = { departmentId: deptId } // View only
    }

    // Parallel Fetching
    // Parallel Fetching
    const [
        activitiesCount,
        programsCount,
        indicatorsCount,
        recentActivities,
        upcomingActivities,
        programsStatus,
        activitiesStatus,
        calendarEvents,
        allPrograms,
        onTrackIndicators,
        allIndicators
    ] = await Promise.all([
        prisma.activity.count({ where: activityWhere }),
        prisma.program.count({ where: programWhere }),
        prisma.indicator.count({ where: indicatorWhere }),

        // 3. Recent Activities
        prisma.recentActivity.findMany({
            where: role === Role.ADMIN ? {} : (role === Role.MANAGER ? { user: { departmentId: deptId } } : { userId }),
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { user: true }
        }),

        // 4. Upcoming Activities
        prisma.activity.findMany({
            where: { assignedUserId: userId, status: { not: ProgressStatus.COMPLETED } },
            orderBy: { startDate: "asc" },
            take: 5
        }),

        // 5. Chart Data: Programs
        prisma.program.groupBy({
            by: ['status'],
            where: programWhere,
            _count: true
        }),

        // 6. Chart Data: Activities
        prisma.activity.groupBy({
            by: ['status'],
            where: activityWhere,
            _count: true
        }),

        // 7. Calendar Events
        prisma.calendarEvent.findMany({
            where: {
                userId,
                date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            },
            orderBy: { date: "asc" },
            take: 5
        }),

        // 8. All Programs for Budget Alerts
        prisma.program.findMany({
            where: programWhere,
            select: { name: true, budget: true, spent: true }
        }),

        // 9. On Track Count
        prisma.indicator.count({
            where: { ...indicatorWhere, status: "ON_TRACK" }
        }),

        // 10. All Indicators for Standard Deviation calculation
        prisma.indicator.findMany({
            where: indicatorWhere,
            select: { progress: true }
        })
    ])

    // Merge Activities and Calendar Events
    const combinedActivities = [
        ...upcomingActivities.map(a => ({
            id: a.id,
            name: a.name,
            startDate: a.startDate,
            duration: a.duration,
            status: a.status, // PENDING, etc
            type: 'ACTIVITY' // Discriminator
        })),
        ...calendarEvents.map(e => ({
            id: e.id,
            name: e.title,
            startDate: e.date,
            duration: null,
            status: e.type === 'REMINDER' ? 'REMINDER' : 'EVENT',
            type: 'CALENDAR_EVENT' // Discriminator
        }))
    ].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 7) // Take top 7 combined

    // Calculate at-risk programs (spent > 80% of budget)
    const atRiskPrograms = allPrograms.filter(p => {
        const budget = Number(p.budget)
        const spent = Number(p.spent)
        return budget > 0 && (spent / budget) >= 0.8
    }).map(p => p.name)

    // Calculate overall progress based on statuses
    const totalIndicators = indicatorsCount
    const avgProgress = totalIndicators > 0 ? Math.round((onTrackIndicators / totalIndicators) * 100) : 0

    // Calculate Standard Deviation of planning indicators
    let stdDev = 0
    if (allIndicators.length > 0) {
        const progresses = allIndicators.map(ind => ind.progress || 0)
        const mean = progresses.reduce((a, b) => a + b, 0) / progresses.length
        const variance = progresses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / progresses.length
        stdDev = Math.round(Math.sqrt(variance))
    }

    return {
        counts: {
            activities: activitiesCount,
            programs: programsCount,
            indicators: indicatorsCount,
            progress: avgProgress,
            stdDev: stdDev
        },
        recentActivities: recentActivities.map((a: any) => ({
            ...a,
            user: { name: a.user.name, role: a.user.role }
        })),
        upcomingActivities: combinedActivities,
        charts: {
            programsStatus: programsStatus.map((p: any) => ({ name: p.status, value: p._count })),
            activitiesStatus: activitiesStatus.map((a: any) => ({ name: a.status, value: a._count }))
        },
        alerts: atRiskPrograms,
        user: { name: user.name, role: user.role }
    }
}
