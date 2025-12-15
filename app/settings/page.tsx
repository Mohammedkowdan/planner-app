"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Building2, Bell, Palette, Users, Shield, Save, Download, Trash2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { clearAllData, downloadDataAsJson } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [settings, setSettings] = useState({
    organizationName: "وزارة الصحة",
    email: "admin@moh.gov",
    fiscalYearStart: "01",
    defaultCurrency: "USD",
    emailNotifications: true,
    quarterlyReminders: true,
    budgetAlerts: true,
    theme: "light",
  })

  const handleSave = () => {
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تحديث إعداداتك بنجاح.",
    })
  }

  const handleClearData = () => {
    clearAllData()
    toast({
      title: "تم مسح البيانات",
      description: "تم حذف جميع البيانات بنجاح. سيتم إعادة توجيهك لصفحة تسجيل الدخول.",
      variant: "destructive",
    })
    setTimeout(() => {
      router.push("/")
    }, 2000)
  }

  const handleExportData = () => {
    downloadDataAsJson()
    toast({
      title: "تم تصدير البيانات",
      description: "تم تنزيل البيانات بنجاح.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">الإعدادات</h1>
          <p className="text-muted-foreground mt-1">إدارة تفضيلات المنظمة وإعدادات النظام</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                تفاصيل المنظمة
              </CardTitle>
              <CardDescription>معلومات أساسية عن منظمتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">اسم المنظمة</Label>
                <Input
                  id="orgName"
                  value={settings.organizationName}
                  onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني للتواصل</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">شهر بداية السنة المالية</Label>
                  <Select
                    value={settings.fiscalYearStart}
                    onValueChange={(value) => setSettings({ ...settings, fiscalYearStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">يناير</SelectItem>
                      <SelectItem value="02">فبراير</SelectItem>
                      <SelectItem value="03">مارس</SelectItem>
                      <SelectItem value="04">أبريل</SelectItem>
                      <SelectItem value="05">مايو</SelectItem>
                      <SelectItem value="06">يونيو</SelectItem>
                      <SelectItem value="07">يوليو</SelectItem>
                      <SelectItem value="08">أغسطس</SelectItem>
                      <SelectItem value="09">سبتمبر</SelectItem>
                      <SelectItem value="10">أكتوبر</SelectItem>
                      <SelectItem value="11">نوفمبر</SelectItem>
                      <SelectItem value="12">ديسمبر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">العملة الافتراضية</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onValueChange={(value) => setSettings({ ...settings, defaultCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">دولار أمريكي - USD</SelectItem>
                      <SelectItem value="EUR">يورو - EUR</SelectItem>
                      <SelectItem value="GBP">جنيه إسترليني - GBP</SelectItem>
                      <SelectItem value="SAR">ريال سعودي - SAR</SelectItem>
                      <SelectItem value="AED">درهم إماراتي - AED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات
              </CardTitle>
              <CardDescription>تكوين كيفية استلام التنبيهات والتذكيرات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">استلام التحديثات عبر البريد الإلكتروني</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تذكيرات فصلية</Label>
                  <p className="text-sm text-muted-foreground">الحصول على تذكير لتحديث البيانات الفصلية</p>
                </div>
                <Switch
                  checked={settings.quarterlyReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, quarterlyReminders: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>تنبيهات الميزانية</Label>
                  <p className="text-sm text-muted-foreground">التنبيه عندما يتجاوز الإنفاق 80% من الميزانية</p>
                </div>
                <Switch
                  checked={settings.budgetAlerts}
                  onCheckedChange={(checked) => setSettings({ ...settings, budgetAlerts: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                المظهر
              </CardTitle>
              <CardDescription>تخصيص مظهر وشكل التطبيق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>المظهر</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">فاتح</SelectItem>
                    <SelectItem value="dark">داكن</SelectItem>
                    <SelectItem value="system">النظام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>إدارة المستخدمين والصلاحيات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  ستكون ميزات إدارة المستخدمين متاحة في النسخة الكاملة. اتصل بالمسؤول لإضافة أو إزالة المستخدمين.
                </p>
                <Button variant="outline" disabled>
                  <Users className="w-4 h-4 mr-2" />
                  إدارة المستخدمين
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                البيانات والخصوصية
              </CardTitle>
              <CardDescription>تصدير أو حذف بيانات منظمتك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">تصدير البيانات</h4>
                  <p className="text-sm text-muted-foreground mb-3">تنزيل جميع بيانات منظمتك بصيغة JSON</p>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="w-4 h-4 mr-2" />
                    تصدير جميع البيانات
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2 text-destructive">منطقة الخطر</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    حذف جميع بيانات المنظمة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        حذف جميع البيانات
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          سيتم حذف جميع البيانات بشكل دائم بما في ذلك السنوات التخطيطية، المؤشرات، البرامج، الأنشطة
                          والتقارير. لا يمكن التراجع عن هذا الإجراء. سيتم الاحتفاظ بحساب المدير الرئيسي فقط.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          نعم، احذف كل شيء
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline">إلغاء</Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
