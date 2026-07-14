import { getUserDashboardData } from "@/actions/dashboard"
import { getNotifications } from "@/actions/notifications"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Target, Briefcase, TrendingUp, CheckCircle, Activity, ArrowUpRight } from "lucide-react"
import { StatusChart } from "@/components/dashboard/status-chart"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { UpcomingActivities } from "@/components/dashboard/upcoming-activities"
import { PageHeader } from "@/components/page-header"

export default async function DashboardPage() {

  const [dashboardData, notificationsData] = await Promise.all([
    getUserDashboardData(),
    getNotifications()
  ])

  if ('error' in dashboardData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
          فشل في تحميل البيانات: {String(dashboardData.error)}
        </div>
      </DashboardLayout>
    )
  }

  const { counts, recentActivities, upcomingActivities, charts, user, alerts } = dashboardData as any
  const { notifications, unreadCount } = notificationsData

  const roleText = {
    'ADMIN': 'مدير النظام',
    'MANAGER': 'مدير البرنامج',
    'USER': 'موظف'
  }[user.role as string] || 'مستخدم'

  return (
    <DashboardLayout notifications={notifications} unreadCount={unreadCount}>
      <div className="space-y-8 animate-in fade-in duration-500">

        <PageHeader
          title={`مرحباً، ${user.name} 👋`}
          description={
            <>
              أنت مسجل كـ <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-md text-white">{roleText}</span>.
              إليك نظرة عامة على أدائك وآخر التحديثات في النظام.
            </>
          }
          icon={Activity}
        />

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={user.role === 'USER' ? 'مهامي المعينة' : 'الأنشطة'}
            value={counts.activities}
            subtitle="نشاط جاري"
            icon={Briefcase}
            color="text-blue-500"
            bgColor="bg-blue-50"
            delay="delay-0"
          />
          <StatCard
            title="المؤشرات"
            value={counts.indicators}
            subtitle="مؤشر أداء"
            icon={Target}
            color="text-emerald-500"
            bgColor="bg-emerald-50"
            delay="delay-100"
          />
          <StatCard
            title="البرامج"
            value={counts.programs}
            subtitle="برنامج تطويري"
            icon={TrendingUp}
            color="text-orange-500"
            bgColor="bg-orange-50"
            delay="delay-200"
          />
          <StatCard
            title="الانحراف المعياري"
            value={`${counts.stdDev}%`}
            subtitle="مؤشرات التخطيط"
            icon={Activity}
            color="text-purple-500"
            bgColor="bg-purple-50"
            delay="delay-300"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Charts Section */}
          <div className="md:col-span-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatusChart data={charts.activitiesStatus} title={user.role === 'USER' ? "حالة مهامي" : "حالة الأنشطة العامة"} />
              <StatusChart data={charts.programsStatus} title="توزيع حالة البرامج" />
            </div>
            <RecentActivityList activities={recentActivities} />
          </div>


          {/* Sidebar Section */}
          <div className="md:col-span-3 space-y-6">
            <UpcomingActivities activities={upcomingActivities} />

            {/* Modern Alert Card */}
            {user.role === 'MANAGER' && (
              <Card className={`bg-gradient-to-br border-0 shadow-lg text-white relative overflow-hidden animate-in slide-in-from-right-10 duration-700 ${alerts.length > 0 ? 'from-orange-500 to-red-600' : 'from-indigo-600 to-violet-600'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <CardHeader className="relative z-10 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-white/80" />
                    تنبيهات الإدارة
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-white/90 text-sm leading-relaxed">
                    {alerts.length > 0
                      ? `لديك ${alerts.length} برامج تتجاوز ميزانيتها 80%: (${alerts.slice(0, 2).join('، ')}${alerts.length > 2 ? '...' : ''}). يرجى مراجعة الصرف.`
                      : 'جميع البرامج تلتزم بحدود الميزانية المخصصة حالياً. عمل جيد!'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color, bgColor, delay }: any) {
  return (
    <Card className={`border-none shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${delay}`}>
      <CardContent className="p-6 relative">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${color.replace('text-', 'bg-')}`}></div>

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} ${color} transition-transform group-hover:rotate-6`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
