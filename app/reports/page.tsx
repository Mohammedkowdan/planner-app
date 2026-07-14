"use client"

import { Download, FileText, TrendingUp, Target, Briefcase, DollarSign, RefreshCcw } from "lucide-react"
import { getReportsOverviewData } from "@/actions/reports"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const res = await getReportsOverviewData()
      if (res.success) {
        setData(res.data)
      } else {
        toast.error(res.error || "Failed to load report data")
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleExport = (format: string) => {
    console.log(`Exporting ${selectedReport} report as ${format}`)
    alert(`تصدير التقرير بصيغة ${format.toUpperCase()}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">التقارير والتحليلات</h1>
            <p className="text-muted-foreground mt-1">عرض رؤى الأداء وتصدير التقارير</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              تصدير PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="w-4 h-4 mr-2" />
              تصدير Excel
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">تقرير عام</SelectItem>
              <SelectItem value="indicators">تقرير المؤشرات</SelectItem>
              <SelectItem value="programs">تقرير البرامج</SelectItem>
              <SelectItem value="financial">التقرير المالي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                المؤشرات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.indicatorCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">{(data?.indicatorSuccessRate || 0).toFixed(0)}%</span> على المسار الصحيح
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-secondary" />
                البرامج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.programCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">{data?.activityCount || 0}</span> نشاط مسجل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-chart-3" />
                الميزانية الإجمالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalBudget?.toLocaleString()}$</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">{data?.totalSpent?.toLocaleString()}$</span> تم إنفاقها
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                نسبة الإنجاز
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.annualReportCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-emerald-500 font-medium">تقارير سنوية</span> معتمدة
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>اتجاه تقدم المؤشرات</CardTitle>
              <CardDescription>تتبع الأداء الفصلي</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.charts?.indicatorProgressData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#1a508e" strokeWidth={2} name="متوسط التقدم (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>المؤشرات حسب الفئة</CardTitle>
              <CardDescription>التوزيع عبر الفئات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data?.charts?.categoryData || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(data?.charts?.categoryData || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>تحليل ميزانية البرامج</CardTitle>
              <CardDescription>تخصيص الميزانية مقابل الإنفاق</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.charts?.programBudgetData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#1a508e" name="الميزانية" />
                  <Bar dataKey="spent" fill="#9bc24c" name="المُنفق" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              النشاط الأخير
            </CardTitle>
            <CardDescription>آخر التحديثات والتغييرات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                تحقق من الصفحة الرئيسية لمشاهدة سجل النشاطات الكامل.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
