import { getTimelineActivities } from "@/actions/planning"
import { TimelineClient } from "./timeline-client"

export default async function TimelinePage() {
    const { data: activities, error } = await getTimelineActivities()

    if (error || !activities) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-500 rounded-lg">
                فشل في تحميل بيانات الجدول الزمني: {error}
            </div>
        )
    }

    return <TimelineClient initialActivities={activities} />
}
