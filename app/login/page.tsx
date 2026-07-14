"use client"

import type React from "react"
import { useState, useEffect, Suspense, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Users, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { login, getOrganizations, getDepartments, requestPasswordReset } from "@/actions/auth"

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [orgId, setOrgId] = useState("")
  const [deptId, setDeptId] = useState("")
  
  const [organizations, setOrganizations] = useState<{ id: string, name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([])
  
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [loadingDepts, setLoadingDepts] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<{ errors?: Record<string, string[]> } | null>(null)
  
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showResetSuccess, setShowResetSuccess] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState("")

  useEffect(() => {
    getOrganizations().then((data) => {
      setOrganizations(data)
      setLoadingOrgs(false)
    }).catch(() => setLoadingOrgs(false))
  }, [])

  useEffect(() => {
    if (orgId) {
      setLoadingDepts(true)
      getDepartments(orgId).then((data) => {
        setDepartments(data)
        setLoadingDepts(false)
      }).catch(() => setLoadingDepts(false))
    } else {
      setDepartments([])
    }
  }, [orgId])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)
    formData.append("organizationId", orgId)
    formData.append("departmentId", deptId)

    startTransition(async () => {
      const result = await login(null, formData)
      if (result?.errors) {
        setState({ errors: result.errors })
      }
    })
  }

const handleForgotPassword = async () => {
    if (!resetEmail) return;

    setResetLoading(true);
    setResetError("");

    try {
      const result = await requestPasswordReset(resetEmail);
      if (result.success) {
        setShowResetSuccess(true);
        setTimeout(() => {
          setShowResetSuccess(false);
          setResetEmail("");
        }, 5000);
      }
    } catch {
      setResetError("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
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
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                <Users className="w-8 h-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">نظام إدارة الخطط</h2>
            <p className="text-gray-600">مرحباً بك في منصة التخطيط الاستراتيجي</p>
          </div>

          <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-backwards">
            <CardHeader className="space-y-1 text-center bg-gradient-to-br from-muted/30 to-muted/10">
              <CardTitle className="text-xl">تسجيل الدخول إلى قسمك</CardTitle>
              <CardDescription>يرجى إدخال بيانات الدخول الخاصة بك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {state?.errors && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {Object.values(state.errors).flat().map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="organization">اختر المنظمة / المشروع</Label>
                  <Select value={orgId} onValueChange={setOrgId} dir="rtl">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingOrgs ? "جاري التحميل..." : "اختر المنظمة..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">اختر القسم</Label>
                  <Select value={deptId} onValueChange={setDeptId} disabled={!orgId} dir="rtl">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingDepts ? "جاري التحميل..." : "اختر القسم..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-right"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="text-right"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "تسجيل الدخول"}
                </Button>
              </form>

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
                      {resetError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">{resetError}</p>
                        </div>
                      )}
                      {showResetSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني</p>
                        </div>
                      )}
                      <Button onClick={handleForgotPassword} className="w-full" disabled={!resetEmail || resetLoading}>
                        {resetLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "إرسال رابط إعادة التعيين"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin h-4 w-4" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
