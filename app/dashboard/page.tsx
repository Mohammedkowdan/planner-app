"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Target, TrendingUp } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateYearDialog } from "@/components/create-year-dialog"
import { usePlanningYears } from "@/hooks/use-data"
import { useOrganization } from "@/contexts/organization-context"
import { useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const { organization } = useOrganization()
  const { years, loading, addYear } = usePlanningYears()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/")
    }
  }, [router])

  const activeYears = years.filter((y) => y.status === "active").length
  const totalIndicators = years.reduce((sum, year) => sum + (year as any).indicatorsCount || 0, 0)
  const totalPrograms = years.reduce((sum, year) => sum + (year as any).programsCount || 0, 0)

  const handleCreateYear = (yearData: {
    name: string
    year: number
    startDate: string
    endDate: string
    status: "active" | "draft" | "completed"
  }) => {
    addYear({
      ...yearData,
      organization: organization || "",
    })
    setShowCreateDialog(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success bg-success/10"
      case "draft":
        return "text-warning bg-warning/10"
      case "completed":
        return "text-muted-foreground bg-muted"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "نشط"
      case "draft":
        return "مسودة"
      case "completed":
        return "مكتمل"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جارٍ التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">سنوات التخطيط</h1>
            <p className="text-muted-foreground mt-1">إدارة دورات التخطيط الاستراتيجي للمنظمة</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            سنة تخطيط جديدة
          </Button>
        </div>

        {years.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد سنوات تخطيط</h3>
              <p className="text-muted-foreground text-center mb-4">ابدأ بإنشاء سنة تخطيط استراتيجي جديدة</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                إنشاء سنة تخطيط
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {years.map((year) => (
                <Card
                  key={year.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                  onClick={() => router.push(`/dashboard/${year.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl">{year.year}</CardTitle>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(year.status)}`}>
                        {getStatusLabel(year.status)}
                      </span>
                    </div>
                    <CardDescription>{year.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>من:</span>
                        <span>{new Date(year.startDate).toLocaleDateString("ar-EG")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إلى:</span>
                        <span>{new Date(year.endDate).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-chart-3" />
                    السنوات النشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeYears}</div>
                  <p className="text-xs text-muted-foreground mt-1">نشطة حالياً</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    إجمالي السنوات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{years.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">عبر جميع الفترات</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-secondary" />
                    المنظمة الحالية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{organization}</div>
                  <p className="text-xs text-muted-foreground mt-1">المكتب أو الفرع</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    الحالة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-success">نشط</div>
                  <p className="text-xs text-muted-foreground mt-1">النظام يعمل</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <CreateYearDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateYear={handleCreateYear} />
    </DashboardLayout>
  )
}
