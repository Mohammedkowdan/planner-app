"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getNotifications() {
    const session = await getSession()
    if (!session) return { error: "Not authenticated", notifications: [] }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.userId,
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20 // Limit to recent 20
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.userId,
                isRead: false
            }
        })

        return {
            notifications,
            unreadCount,
            success: true
        }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return { error: "Failed to fetch notifications", notifications: [] }
    }
}

export async function markAsRead(notificationId: string) {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: session.userId // Security check
            },
            data: {
                isRead: true
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update notification" }
    }
}

export async function markAllAsRead() {
    const session = await getSession()
    if (!session) return { error: "Not authenticated" }

    try {
        await prisma.notification.updateMany({
            where: {
                userId: session.userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        })

        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        return { error: "Failed to mark all as read" }
    }
}

// Internal utility - to be called by other actions
export async function createNotification({
    userId,
    title,
    message,
    type = "INFO",
    link
}: {
    userId: string,
    title: string,
    message: string,
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR",
    link?: string
}) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        })
        return { success: true }
    } catch (error) {
        console.error("Internal Error: Failed to create notification", error)
        return { success: false }
    }
}
