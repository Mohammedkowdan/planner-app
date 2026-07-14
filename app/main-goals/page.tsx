import { getMainGoals } from "@/actions/main-goals"
import { getPlanningYears } from "@/actions/planning"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Target } from "lucide-react"
import { getNotifications } from "@/actions/notifications"
import { PageHeader } from "@/components/page-header"
import { CreateMainGoalDialog } from "@/components/main-goals/create-goal-dialog"
import { MainGoalsClient } from "@/components/main-goals/main-goals-client"

export default async function MainGoalsPage() {
    const { data: mainGoals } = await getMainGoals()
    const { data: years } = await getPlanningYears()
    const { notifications, unreadCount } = await getNotifications()

    return (
        <DashboardLayout notifications={notifications} unreadCount={unreadCount}>
            <PageHeader
                title="الأهداف العامة"
                description="إدارة الأهداف الاستراتيجية وربط المؤشرات بها"
                icon={Target}
                actions={<CreateMainGoalDialog years={years || []} />}
            />

            <MainGoalsClient goals={mainGoals || []} years={years || []} />
        </DashboardLayout>
    )
}
