"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, TrendingUp, Target, Briefcase, DollarSign } from "lucide-react"
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

const indicatorProgressData = [
  { name: "Q1", value: 75 },
  { name: "Q2", value: 78 },
  { name: "Q3", value: 82 },
  { name: "Q4", value: 85 },
]

const programBudgetData = [
  { name: "Digital Health", budget: 5000000, spent: 3200000 },
  { name: "Emergency Response", budget: 2500000, spent: 1800000 },
  { name: "Community Health", budget: 800000, spent: 200000 },
]

const categoryData = [
  { name: "Quality", value: 8, color: "#1a508e" },
  { name: "Efficiency", value: 6, color: "#9bc24c" },
  { name: "Development", value: 5, color: "#5b8fc7" },
  { name: "Financial", value: 3, color: "#b5d167" },
  { name: "Customer", value: 2, color: "#3a6da6" },
]

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedReport, setSelectedReport] = useState("overview")

  const handleExport = (format: string) => {
    console.log(`Exporting ${selectedReport} report as ${format}`)
    alert(`تصدير التقرير بصيغة ${format.toUpperCase()}`)
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
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success font-medium">85%</span> على المسار الصحيح
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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-warning font-medium">3</span> تحتاج إلى اهتمام
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
              <div className="text-2xl font-bold">8.3 مليون $</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">5.2 مليون $</span> تم إنفاقها
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
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-success font-medium">+12%</span> مقارنة بالربع السابق
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
                <LineChart data={indicatorProgressData}>
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
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
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
                <BarChart data={programBudgetData}>
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
              {[
                {
                  action: "تم تحديث",
                  item: "مؤشر معدل رضا المرضى",
                  user: "المسؤول",
                  date: "منذ ساعتين",
                },
                {
                  action: "تم إنشاء",
                  item: "برنامج مبادرة الصحة الرقمية",
                  user: "المسؤول",
                  date: "منذ 5 ساعات",
                },
                {
                  action: "تم إكمال",
                  item: "تقرير الربع الثالث للاستجابة للطوارئ",
                  user: "المدير",
                  date: "منذ يوم واحد",
                },
                {
                  action: "تم تعديل",
                  item: "تخصيص الميزانية للصحة المجتمعية",
                  user: "المالية",
                  date: "منذ يومين",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.action}</span> {activity.item}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      بواسطة {activity.user} • {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
