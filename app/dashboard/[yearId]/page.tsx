import { getPlanningYear, getIndicators, getPrograms } from "@/actions/planning"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, Briefcase, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function YearDetailPage(props: { params: Promise<{ yearId: string }> }) {
  const params = await props.params
  const yearId = params.yearId

  const [yearRes, indicatorsRes, programsRes] = await Promise.all([
    getPlanningYear(yearId),
    getIndicators(yearId),
    getPrograms(yearId)
  ])

  if (!yearRes.success || !yearRes.data) {
    notFound()
  }

  const year = yearRes.data
  const indicators = indicatorsRes.data || []
  const programs = programsRes.data || []

  const activeIndicatorsCount = indicators.filter(i => i.status !== 'COMPLETED').length
  const activeProgramsCount = programs.filter(p => p.status !== 'COMPLETED').length

  // Calculate completion rate (simplified)
  const totalItems = indicators.length + programs.length
  const completedItems = indicators.filter(i => i.status === 'COMPLETED').length + programs.filter(p => p.status === 'COMPLETED').length
  const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Calculate days remaining
  const today = new Date()
  const endDate = new Date(year.endDate)
  const diffTime = Math.abs(endDate.getTime() - today.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const daysRemaining = endDate > today ? diffDays : 0

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <PageHeader
          title={year.name}
          description="عرض تفصيلي وإدارة للسنة التخطيطية"
          icon={Calendar}
          actions={
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                المؤشرات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeIndicatorsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">يتم تتبعها حالياً</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-secondary" />
                البرامج القائمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProgramsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">قيد التنفيذ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                نسبة الإنجاز العامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">التقدم الكلي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                الأيام المتبقية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">حتى نهاية السنة</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>مهام شائعة لهذه السنة التخطيطية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/indicators" className="block">
                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal">
                  <Target className="w-4 h-4 ml-2 text-primary" />
                  عرض وإدارة المؤشرات
                  <ArrowUpRight className="w-4 h-4 mr-auto opacity-50" />
                </Button>
              </Link>
              <Link href="/programs" className="block">
                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal">
                  <Briefcase className="w-4 h-4 ml-2 text-secondary" />
                  عرض وإدارة البرامج
                  <ArrowUpRight className="w-4 h-4 mr-auto opacity-50" />
                </Button>
              </Link>
              <Link href="/reports" className="block">
                <Button variant="outline" className="w-full justify-start h-12 text-base font-normal">
                  <TrendingUp className="w-4 h-4 ml-2 text-success" />
                  إصدار تقرير
                  <ArrowUpRight className="w-4 h-4 mr-auto opacity-50" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات السنة</CardTitle>
              <CardDescription>التفاصيل الأساسية للدورة التخطيطية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">الحالة</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${year.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {year.status === 'ACTIVE' ? 'نشطة' : 'غير نشطة'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">تاريخ البدء</span>
                <span className="text-sm font-medium">{new Date(year.startDate).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm text-muted-foreground">تاريخ الانتهاء</span>
                <span className="text-sm font-medium">{new Date(year.endDate).toLocaleDateString('ar-SA')}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-muted-foreground">السنة المالية</span>
                <span className="text-sm font-medium">{year.year}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
