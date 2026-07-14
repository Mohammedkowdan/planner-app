'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getUser } from "@/actions/auth"

export async function createEvent(data: {
    title: string
    description?: string
    date: Date
    type: string
}) {
    try {
        const user = await getUser()
        if (!user) return { error: "User not found" }

        const event = await prisma.calendarEvent.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                type: data.type,
                userId: user.id,
                organizationId: user.organizationId,
                organizationName: user.organizationName,
            }
        })

        // Create log
        await prisma.recentActivity.create({
            data: {
                userId: user.id,
                userName: user.name,
                action: "Create",
                targetType: "Event",
                targetTitle: event.title
            }
        })
        revalidatePath("/dashboard")
        return { success: true, data: event }
    } catch (error) {
        console.error("Error creating event:", error)
        return { error: "Failed to create event" }
    }
}

export async function getEvents() {
    try {
        const user = await getUser()
        if (!user) return { error: "User not found" }

        const events = await prisma.calendarEvent.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                date: 'asc'
            }
        })
        return { success: true, data: events }
    } catch (error) {
        console.error("Error fetching events:", error)
        return { error: "Failed to fetch events" }
    }
}

export async function deleteEvent(id: string) {
    try {
        const user = await getUser()
        if (!user) return { error: "User not found" }

        await prisma.calendarEvent.delete({
            where: {
                id,
                userId: user.id // Security check
            }
        })
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Error deleting event:", error)
        return { error: "Failed to delete event" }
    }
}
