import { DashboardLayout } from "@/components/dashboard-layout"
import { FullCalendar } from "@/components/calendar/full-calendar"
import { getEvents } from "@/actions/calendar"
import { getUserDashboardData } from "@/actions/dashboard"
import { getNotifications } from "@/actions/notifications"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HijriConverter } from "@/components/hijri-converter"
import { Calendar as CalendarIcon, ArrowLeftRight } from "lucide-react"

export default async function CalendarPage() {
    // Reusing dashboard data fetchers for layout consistency
    const [eventsData, notificationsData] = await Promise.all([
        getEvents(),
        getNotifications()
    ])

    const events = eventsData.data || []
    const notifications = notificationsData.notifications || []
    const unreadCount = notificationsData.unreadCount || 0

    return (
        <DashboardLayout notifications={notifications} unreadCount={unreadCount}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">التقويم</h2>
                        <p className="text-muted-foreground">إدارة الفعاليات والأحداث وتحويل التواريخ</p>
                    </div>
                </div>

                <Tabs defaultValue="calendar" className="w-full" dir="rtl">
                    <TabsList className="bg-muted/50 p-1 mb-4 h-auto flex-wrap">
                        <TabsTrigger value="calendar" className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            تقويم الفعاليات
                        </TabsTrigger>
                        <TabsTrigger value="converter" className="flex items-center gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            محول التاريخ (هجري / ميلادي)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar" className="mt-0">
                        <div className="h-[calc(100vh-220px)] animate-in fade-in duration-500">
                            <FullCalendar initialEvents={events} />
                        </div>
                    </TabsContent>

                    <TabsContent value="converter" className="mt-0">
                        <HijriConverter />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
