import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminOverviewClient } from "@/components/admin/overview-client"
import { getAdminOrgs, getAdminDepts } from "@/actions/admin-overview"
import { getNotifications } from "@/actions/notifications"

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN"]

export default async function AdminOverviewPage() {
    const session = await getSession()

    // ── Role guard ──────────────────────────────────────────────────────────
    if (!session || !ALLOWED_ROLES.includes(session.role)) {
        redirect("/dashboard")
    }

    const isSuperAdmin = session.role === "SUPER_ADMIN"

    // ── Fetch initial data ───────────────────────────────────────────────────
    const [orgsResult, notificationsData] = await Promise.all([
        isSuperAdmin ? getAdminOrgs() : Promise.resolve({ data: [{ id: session.orgId, name: session.orgName ?? "" }] }),
        getNotifications(),
    ])

    // For ADMIN: pre-load their own org's departments
    const initialDepts = isSuperAdmin
        ? [] // SUPER_ADMIN picks org first, then depts load dynamically
        : (await getAdminDepts(session.orgId)).data ?? []

    const notifications = notificationsData.notifications ?? []
    const unreadCount = notificationsData.unreadCount ?? 0

    return (
        <DashboardLayout notifications={notifications} unreadCount={unreadCount}>
            <AdminOverviewClient
                role={session.role as "ADMIN" | "SUPER_ADMIN"}
                sessionOrgId={session.orgId}
                sessionOrgName={session.orgName ?? ""}
                initialOrgs={orgsResult.data ?? []}
                initialDepts={initialDepts}
            />
        </DashboardLayout>
    )
}
