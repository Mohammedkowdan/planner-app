"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Save, Send, CheckCircle, Users, DollarSign } from "lucide-react"

export default function ImplementationPage() {
  const [formData, setFormData] = useState({
    activityName: "",
    project: "",
    department: "",
    location: "",
    startDate: "",
    endDate: "",
    plannedBeneficiaries: "",
    actualBeneficiaries: "",
    plannedMale: "",
    actualMale: "",
    plannedFemale: "",
    actualFemale: "",
    operations: "",
    outputs: "",
    challenges: "",
    recommendations: "",
    plannedBudget: "",
    actualBudget: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const budgetProgress =
    formData.plannedBudget && formData.actualBudget
      ? (Number(formData.actualBudget) / Number(formData.plannedBudget)) * 100
      : 0

  const beneficiariesProgress =
    formData.plannedBeneficiaries && formData.actualBeneficiaries
      ? (Number(formData.actualBeneficiaries) / Number(formData.plannedBeneficiaries)) * 100
      : 0

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">تقرير التنفيذ</h1>
            <p className="text-muted-foreground mt-1">تفاصيل تنفيذ النشاط والنتائج المحققة</p>
          </div>
          <Badge className="bg-secondary text-white">
            <FileText className="w-4 h-4 ml-1" />
            نموذج جديد
          </Badge>
        </div>

        {/* Activity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              معلومات النشاط
            </CardTitle>
            <CardDescription>البيانات الأساسية للنشاط المنفذ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activityName">اسم النشاط *</Label>
                <Input
                  id="activityName"
                  placeholder="مثال: حملة تطعيم للأطفال"
                  value={formData.activityName}
                  onChange={(e) => updateField("activityName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">المشروع *</Label>
                <Select value={formData.project} onValueChange={(value) => updateField("project", value)}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="اختر المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">التعليم</SelectItem>
                    <SelectItem value="health">الصحة</SelectItem>
                    <SelectItem value="water">المياه والصرف الصحي</SelectItem>
                    <SelectItem value="protection">الحماية</SelectItem>
                    <SelectItem value="livelihoods">سبل العيش</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">القسم المنفذ *</Label>
                <Select value={formData.department} onValueChange={(value) => updateField("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="education">التعليم</SelectItem>
                    <SelectItem value="health">الصحة</SelectItem>
                    <SelectItem value="logistics">اللوجستيات</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع *</Label>
                <Input
                  id="location"
                  placeholder="مثال: مخيم الزعتري"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beneficiaries Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              بيانات المستفيدين
            </CardTitle>
            <CardDescription>الأعداد المخططة والفعلية للمستفيدين</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plannedBeneficiaries">عدد المستفيدين المخطط</Label>
                <Input
                  id="plannedBeneficiaries"
                  type="number"
                  placeholder="0"
                  value={formData.plannedBeneficiaries}
                  onChange={(e) => updateField("plannedBeneficiaries", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBeneficiaries">عدد المستفيدين الفعلي</Label>
                <Input
                  id="actualBeneficiaries"
                  type="number"
                  placeholder="0"
                  value={formData.actualBeneficiaries}
                  onChange={(e) => updateField("actualBeneficiaries", e.target.value)}
                />
              </div>
            </div>

            {formData.plannedBeneficiaries && formData.actualBeneficiaries && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>نسبة الإنجاز</span>
                  <span className="font-bold">{beneficiariesProgress.toFixed(1)}%</span>
                </div>
                <Progress value={beneficiariesProgress} className="h-2" />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="plannedMale">ذكور (مخطط)</Label>
                <Input
                  id="plannedMale"
                  type="number"
                  placeholder="0"
                  value={formData.plannedMale}
                  onChange={(e) => updateField("plannedMale", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualMale">ذكور (فعلي)</Label>
                <Input
                  id="actualMale"
                  type="number"
                  placeholder="0"
                  value={formData.actualMale}
                  onChange={(e) => updateField("actualMale", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedFemale">إناث (مخطط)</Label>
                <Input
                  id="plannedFemale"
                  type="number"
                  placeholder="0"
                  value={formData.plannedFemale}
                  onChange={(e) => updateField("plannedFemale", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualFemale">إناث (فعلي)</Label>
                <Input
                  id="actualFemale"
                  type="number"
                  placeholder="0"
                  value={formData.actualFemale}
                  onChange={(e) => updateField("actualFemale", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operations">عدد العمليات المنفذة</Label>
              <Input
                id="operations"
                type="number"
                placeholder="مثال: عدد الزيارات أو الجلسات"
                value={formData.operations}
                onChange={(e) => updateField("operations", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Outputs and Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              المخرجات والنتائج
            </CardTitle>
            <CardDescription>وصف تفصيلي للإنجازات والتحديات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outputs">المخرجات المحققة *</Label>
              <Textarea
                id="outputs"
                placeholder="اذكر بالتفصيل ما تم إنجازه من مخرجات ونتائج ملموسة..."
                rows={4}
                value={formData.outputs}
                onChange={(e) => updateField("outputs", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="challenges">التحديات والصعوبات</Label>
              <Textarea
                id="challenges"
                placeholder="اذكر أي تحديات أو عقبات واجهتكم أثناء التنفيذ..."
                rows={3}
                value={formData.challenges}
                onChange={(e) => updateField("challenges", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recommendations">التوصيات</Label>
              <Textarea
                id="recommendations"
                placeholder="اقتراحات للتحسين أو توصيات للأنشطة المستقبلية..."
                rows={3}
                value={formData.recommendations}
                onChange={(e) => updateField("recommendations", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              الميزانية
            </CardTitle>
            <CardDescription>الميزانية المخططة والمنفذة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plannedBudget">الميزانية المخططة (USD)</Label>
                <Input
                  id="plannedBudget"
                  type="number"
                  placeholder="0"
                  value={formData.plannedBudget}
                  onChange={(e) => updateField("plannedBudget", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualBudget">الميزانية المنفذة (USD)</Label>
                <Input
                  id="actualBudget"
                  type="number"
                  placeholder="0"
                  value={formData.actualBudget}
                  onChange={(e) => updateField("actualBudget", e.target.value)}
                />
              </div>
            </div>

            {formData.plannedBudget && formData.actualBudget && (
              <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">نسبة الصرف</span>
                  <div className="text-left">
                    <span className="text-2xl font-bold text-primary">{budgetProgress.toFixed(1)}%</span>
                  </div>
                </div>
                <Progress value={budgetProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>المنفذ: ${Number(formData.actualBudget).toLocaleString()}</span>
                  <span>المخطط: ${Number(formData.plannedBudget).toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-muted-foreground" />
              المرفقات
            </CardTitle>
            <CardDescription>تقارير، صور، أو مستندات داعمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">اضغط لتحميل الملفات</p>
              <p className="text-xs text-muted-foreground">PDF, Word, Excel, صور (حتى 10 ميجا)</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pb-6">
          <Button variant="outline" size="lg">
            <Save className="w-4 h-4 ml-2" />
            حفظ كمسودة
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary/10 bg-transparent"
          >
            <Send className="w-4 h-4 ml-2" />
            إرسال للمراجعة
          </Button>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            <CheckCircle className="w-4 h-4 ml-2" />
            اعتماد التقرير
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
