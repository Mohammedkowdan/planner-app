import { getSession } from "@/lib/auth"
import { Role } from "@/generated/prisma/client"
import { redirect } from "next/navigation"
import { BroadcastPanel } from "@/components/admin/broadcast-panel"
import { DashboardLayout } from "@/components/dashboard-layout"

export const metadata = {
    title: "إرسال التنبيهات | النظرة الإدارية",
}

export default async function AdminNotificationsPage() {
    const session = await getSession()
    if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
        redirect("/dashboard")
    }

    return (
        <DashboardLayout>
            <div className="space-y-6" dir="rtl">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">إرسال التنبيهات</h1>
                        <p className="text-muted-foreground mt-2">
                            لوحة التحكم الخاصة بإرسال الإشعارات والتنبيهات للمستخدمين
                        </p>
                    </div>
                </div>

                <BroadcastPanel 
                    sessionRole={session.role}
                    sessionOrgId={session.orgId}
                />
            </div>
        </DashboardLayout>
    )
}
