"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Users } from "lucide-react"
import { getUsers, setCurrentUser, initializeDefaultData } from "@/lib/storage"
import Image from "next/image"

const departments = [
  { id: "dept-1", value: "education", label: "التعليم", color: "bg-blue-500" },
  { id: "dept-2", value: "health", label: "الصحة", color: "bg-red-500" },
  { id: "dept-3", value: "development", label: "التنمية", color: "bg-green-500" },
  { id: "dept-4", value: "hr", label: "الموارد البشرية", color: "bg-purple-500" },
  { id: "dept-5", value: "protection", label: "الحماية", color: "bg-orange-500" },
  { id: "dept-6", value: "wash", label: "المياه والصرف الصحي", color: "bg-cyan-500" },
  { id: "dept-7", value: "logistics", label: "اللوجستيات", color: "bg-yellow-500" },
  { id: "dept-8", value: "administration", label: "الإدارة", color: "bg-gray-500" },
  { id: "dept-9", value: "finance", label: "المالية", color: "bg-emerald-500" },
  { id: "dept-10", value: "other", label: "أخرى", color: "bg-slate-500" },
]

const organizations = [
  { id: "org-1", name: "المكتب الرئيسي", description: "المقر الرئيسي للمؤسسة" },
  { id: "org-2", name: "فرع دوعن", description: "فرع دوعن الإقليمي" },
  { id: "org-3", name: "فرع عدن", description: "فرع عدن الإقليمي" },
]

export default function LoginPage() {
  const router = useRouter()
  const [organization, setOrganization] = useState("")
  const [department, setDepartment] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showResetSuccess, setShowResetSuccess] = useState(false)
  const [errors, setErrors] = useState<{
    organization?: string
    department?: string
    email?: string
    password?: string
  }>({})

  useEffect(() => {
    initializeDefaultData()
    const savedRememberMe = localStorage.getItem("rememberMe")
    if (savedRememberMe === "true") {
      const savedOrg = localStorage.getItem("lastOrganization")
      const savedDept = localStorage.getItem("lastDepartment")
      if (savedOrg) setOrganization(savedOrg)
      if (savedDept) setDepartment(savedDept)
      setRememberMe(true)
    }
  }, [])

  const handleLogin = () => {
    const newErrors: { organization?: string; department?: string; email?: string; password?: string } = {}

    if (!organization) newErrors.organization = "يرجى اختيار المنظمة"
    if (!department) newErrors.department = "يرجى اختيار القسم"
    if (!email) newErrors.email = "البريد الإلكتروني مطلوب"
    if (!password) newErrors.password = "كلمة المرور مطلوبة"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // التحقق من بيانات المستخدم
    const users = getUsers()
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      setErrors({
        email: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        password: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      })
      return
    }

    const selectedOrg = organizations.find((o) => o.id === organization)
    const selectedDept = departments.find((d) => d.id === department)

    if (!selectedOrg || !selectedDept) {
      setErrors({
        organization: "يرجى اختيار منظمة وقسم صحيحين",
      })
      return
    }

    // التحقق من صلاحيات المستخدم (المدير يمكنه الوصول لكل شيء)
    if (user.role !== "admin") {
      if (user.organizationId !== organization || user.departmentId !== department) {
        setErrors({
          organization: "ليس لديك صلاحية الوصول لهذه المنظمة أو القسم",
          department: "ليس لديك صلاحية الوصول لهذه المنظمة أو القسم",
        })
        return
      }
    }

    // حفظ بيانات المستخدم الحالي
    setCurrentUser(user)

    if (rememberMe) {
      localStorage.setItem("lastOrganization", organization)
      localStorage.setItem("lastDepartment", department)
      localStorage.setItem("rememberMe", "true")
    } else {
      localStorage.removeItem("lastOrganization")
      localStorage.removeItem("lastDepartment")
      localStorage.removeItem("rememberMe")
    }

    localStorage.setItem("isLoggedIn", "true")

    router.push("/dashboard")
  }

  const handleForgotPassword = () => {
    if (resetEmail) {
      setShowResetSuccess(true)
      setTimeout(() => {
        setShowResetSuccess(false)
        setResetEmail("")
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Image
              src="/selah-logo.jpg"
              alt="شعار مؤسسة صله للتنمية"
              width={180}
              height={70}
              className="object-contain"
              priority
            />
            <Image
              src="/planflow-logo.png"
              alt="PlanFlow Logo"
              width={200}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/humanitarian-community-development-teamwork-hope.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-secondary/20 to-primary/30 backdrop-blur-md" />

        <div className="relative w-full max-w-md space-y-6 z-10">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center shadow-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">نظام إدارة الخطط</h2>
            <p className="text-gray-600">مرحباً بك في منصة التخطيط الاستراتيجي</p>
          </div>

          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 text-center bg-gradient-to-br from-muted/30 to-muted/10">
              <CardTitle className="text-xl">تسجيل الدخول إلى قسمك</CardTitle>
              <CardDescription>يرجى إدخال بيانات الدخول الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="organization">اختر المنظمة / المشروع</Label>
                <Select
                  value={organization}
                  onValueChange={(value) => {
                    setOrganization(value)
                    setErrors({ ...errors, organization: undefined })
                  }}
                >
                  <SelectTrigger id="organization" className={errors.organization ? "border-red-500 w-full" : "w-full"}>
                    <SelectValue placeholder="اختر المنظمة..." />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        <div className="text-right">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-xs text-muted-foreground">{org.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.organization && <p className="text-sm text-red-500">{errors.organization}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">اختر القسم</Label>
                <Select
                  value={department}
                  onValueChange={(value) => {
                    setDepartment(value)
                    setErrors({ ...errors, department: undefined })
                  }}
                >
                  <SelectTrigger id="department" className={errors.department ? "border-red-500 w-full" : "w-full"}>
                    <SelectValue placeholder="اختر القسم..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                          <span>{dept.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="أدخل البريد الإلكتروني"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined })
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors({ ...errors, password: undefined })
                    }}
                    className={errors.password ? "border-red-500" : ""}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  تذكرني
                </Label>
              </div>

              <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90" size="lg">
                تسجيل الدخول
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="w-full text-center text-sm text-primary hover:underline">
                    هل نسيت كلمة المرور؟
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
                    <DialogDescription>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">البريد الإلكتروني</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="أدخل بريدك الإلكتروني"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    {showResetSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني</p>
                      </div>
                    )}
                    <Button onClick={handleForgotPassword} className="w-full" disabled={!resetEmail}>
                      إرسال رابط إعادة التعيين
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-700 font-medium">© 2025 مؤسسة صله للتنمية - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}
