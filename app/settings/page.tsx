"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Bell, Palette, Users, Shield, Save, Download, Trash2, FileText } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
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
import { getOrganizationSettings, updateReportSettings, updateProfile } from "@/actions/settings"
import { getUser } from "@/actions/auth"

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
  
  const [reportSettings, setReportSettings] = useState({
    headerText: "",
    footerText: "",
    headerImage: "",
    footerImage: ""
  })
  const [profileData, setProfileData] = useState({ name: "", currentPassword: "", newPassword: "" })
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      const u = await getUser()
      if (u) {
        setProfileData(prev => ({ ...prev, name: u.name }))
        if (u.role === "ADMIN" || u.role === "SUPER_ADMIN") {
          setIsAdmin(true)
        }
      }

      const res = await getOrganizationSettings()
      if (res.success && res.data) {
        setReportSettings({
          headerText: res.data.reportHeaderText || "",
          footerText: res.data.reportFooterText || "",
          headerImage: res.data.reportHeaderImage || "",
          footerImage: res.data.reportFooterImage || ""
        })
      }
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    try {
      const res = await updateReportSettings({
        reportHeaderText: reportSettings.headerText,
        reportFooterText: reportSettings.footerText,
        reportHeaderImage: reportSettings.headerImage,
        reportFooterImage: reportSettings.footerImage
      })

      if (res.success) {
        toast({
          title: "تم حفظ الإعدادات",
          description: "تم تحديث إعداداتك بنجاح.",
        })
      } else {
        toast({
          title: "خطأ",
          description: res.error,
          variant: "destructive"
        })
      }
    } catch (e) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive"
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      const res = await updateProfile(profileData)
      if (res.success) {
        toast({ title: "تم التحديث", description: res.message || "تم تحديث الملف الشخصي بنجاح." })
        setProfileData(prev => ({ ...prev, currentPassword: "", newPassword: "" }))
      } else {
        toast({ title: "خطأ", description: res.error, variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "خطأ", description: "حدث خطأ غير متوقع", variant: "destructive" })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'headerImage' | 'footerImage') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReportSettings(prev => ({ ...prev, [field]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearData = () => {
    toast({
      title: "الميزة غير متاحة",
      description: "مسح البيانات معطل حالياً بسبب الانتقال إلى قاعدة البيانات السحابية.",
      variant: "destructive",
    })
  }

  const handleExportData = () => {
    toast({
      title: "قريباً",
      description: "تصدير البيانات سيتم إتاحته قريباً مع نظام النسخ الاحتياطي الجديد.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">الإعدادات</h1>
            <p className="text-muted-foreground mt-1">إدارة تفضيلات المنظمة والملف الشخصي</p>
          </div>
        </div>

        <Tabs defaultValue={isAdmin ? "general" : "profile"} className="space-y-6" dir="rtl">
          <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> الملف الشخصي
            </TabsTrigger>
            
            {isAdmin && (
              <>
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> عام
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" /> التقارير
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" /> الإشعارات
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> المستخدمين
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> البيانات والخصوصية
                </TabsTrigger>
              </>
            )}
            
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> المظهر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> الملف الشخصي
                </CardTitle>
                <CardDescription>تحديث معلوماتك الشخصية وكلمة المرور</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>الاسم</Label>
                  <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور الحالية</Label>
                  <Input type="password" value={profileData.currentPassword} onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})} placeholder="اتركه فارغاً إذا لم ترد تغييره" />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور الجديدة</Label>
                  <Input type="password" value={profileData.newPassword} onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})} placeholder="كلمة المرور الجديدة" />
                </div>
                <Button onClick={handleSaveProfile} className="mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  حفظ الملف الشخصي
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
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
          </TabsContent>

          {isAdmin && (
            <>
          <TabsContent value="general">
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
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  إعدادات التقارير
                </CardTitle>
                <CardDescription>تكوين ترويسة وتذييل التقارير الرسمية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">الترويسة (Header)</h3>
                    <div className="space-y-2">
                      <Label>النص (اختياري)</Label>
                      <Input 
                        placeholder="وزارة الصحة - قطاع الرعاية..." 
                        value={reportSettings.headerText}
                        onChange={e => setReportSettings(prev => ({ ...prev, headerText: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>صورة الترويسة / الشعار (اختياري)</Label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'headerImage')}
                      />
                      {reportSettings.headerImage && (
                        <div className="mt-2 p-2 border rounded-md bg-muted/20">
                          <img src={reportSettings.headerImage} alt="Header Preview" className="max-h-20 object-contain" />
                          <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => setReportSettings(prev => ({...prev, headerImage: ''}))}>إزالة الصورة</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-primary">التذييل (Footer)</h3>
                    <div className="space-y-2">
                      <Label>النص (اختياري)</Label>
                      <Input 
                        placeholder="العنوان - رقم الهاتف - البريد الإلكتروني..."
                        value={reportSettings.footerText}
                        onChange={e => setReportSettings(prev => ({ ...prev, footerText: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>صورة التذييل (اختياري)</Label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={e => handleImageUpload(e, 'footerImage')}
                      />
                      {reportSettings.footerImage && (
                        <div className="mt-2 p-2 border rounded-md bg-muted/20">
                          <img src={reportSettings.footerImage} alt="Footer Preview" className="max-h-20 object-contain" />
                          <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => setReportSettings(prev => ({...prev, footerImage: ''}))}>إزالة الصورة</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
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
          </TabsContent>



          <TabsContent value="users">
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
                    إدارة مستخدمي النظام وتعيين الصلاحيات (مدير نظام، مدير قسم، مستخدم).
                  </p>
                  <Button variant="outline" onClick={() => router.push("/settings/users")}>
                    <Users className="w-4 h-4 mr-2" />
                    الانتقال لإدارة المستخدمين
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
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
          </TabsContent>
          </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
