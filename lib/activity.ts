import { prisma } from "@/lib/db";

/**
 * Logs a user activity to the database for the "Recent Activity" dashboard feed.
 */
export async function logActivity(
    userId: string,
    userName: string,
    action: string,
    targetType: string,
    targetTitle: string
) {
    try {
        await prisma.recentActivity.create({
            data: {
                userId,
                userName,
                action,
                targetType,
                targetTitle,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
        // Don't throw, we don't want to break the main action if logging fails
    }
}

/**
 * Logs an error to the server console with context.
 */
export function logError(context: string, error: any) {
    console.error(`[${context}] Error:`, error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
        console.error(error.stack);
    }
}
