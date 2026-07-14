import { DashboardLayout } from "@/components/dashboard-layout"
import { ProgramWalletsClientPage } from "@/components/program-wallets/program-wallets-client-page"
import { getProgramWallets } from "@/actions/program-wallets"
import { getMainGoals } from "@/actions/main-goals"
import { getNotifications } from "@/actions/notifications"

export default async function ProgramWalletsPage() {
    const [walletsData, mainGoalsData, notificationsData] = await Promise.all([
        getProgramWallets(),
        getMainGoals(),
        getNotifications()
    ])

    const wallets = walletsData.data || []
    const mainGoals = mainGoalsData.data || [] // Assuming getMainGoals returns { data: [] }
    const notifications = notificationsData.notifications || []
    const unreadCount = notificationsData.unreadCount || 0

    return (
        <DashboardLayout notifications={notifications} unreadCount={unreadCount}>
            <ProgramWalletsClientPage wallets={wallets} mainGoals={mainGoals} />
        </DashboardLayout>
    )
}
