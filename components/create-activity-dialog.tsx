"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"

interface Activity {
  name: string
  project: string
  department: string
  startDate: string
  endDate: string
  duration: number
  months: boolean[]
  status: "planned" | "in-progress" | "completed"
}

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (activity: Activity) => void
}

export function CreateActivityDialog({ open, onOpenChange, onSubmit }: CreateActivityDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    project: "",
    department: "",
    startDate: "",
    endDate: "",
    status: "planned" as const,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const calculateMonths = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = Array(12).fill(false)

    const startMonth = start.getMonth()
    const endMonth = end.getMonth()
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    if (startYear === endYear) {
      for (let i = startMonth; i <= endMonth; i++) {
        months[i] = true
      }
    } else {
      for (let i = startMonth; i < 12; i++) {
        months[i] = true
      }
    }

    return months
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "اسم النشاط مطلوب"
    }
    if (!formData.project) {
      newErrors.project = "المشروع مطلوب"
    }
    if (!formData.department) {
      newErrors.department = "القسم مطلوب"
    }
    if (!formData.startDate) {
      newErrors.startDate = "تاريخ البدء مطلوب"
    }
    if (!formData.endDate) {
      newErrors.endDate = "تاريخ الانتهاء مطلوب"
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        newErrors.endDate = "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const duration = calculateDuration(formData.startDate, formData.endDate)
    const months = calculateMonths(formData.startDate, formData.endDate)

    onSubmit({
      name: formData.name,
      project: formData.project,
      department: formData.department,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration,
      months,
      status: formData.status,
    })

    // إعادة تعيين النموذج
    setFormData({
      name: "",
      project: "",
      department: "",
      startDate: "",
      endDate: "",
      status: "planned",
    })
    setErrors({})
  }

  const duration = formData.startDate && formData.endDate ? calculateDuration(formData.startDate, formData.endDate) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            إضافة نشاط جديد
          </DialogTitle>
          <DialogDescription>أدخل تفاصيل النشاط والجدول الزمني للتنفيذ</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم النشاط *</Label>
            <Input
              id="name"
              placeholder="مثال: ورشة تدريبية للمعلمين"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">المشروع *</Label>
              <Select value={formData.project} onValueChange={(value) => updateField("project", value)}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="اختر المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="التعليم">التعليم</SelectItem>
                  <SelectItem value="الصحة">الصحة</SelectItem>
                  <SelectItem value="المياه">المياه والصرف الصحي</SelectItem>
                  <SelectItem value="الحماية">الحماية</SelectItem>
                  <SelectItem value="التنمية">التنمية</SelectItem>
                </SelectContent>
              </Select>
              {errors.project && <p className="text-sm text-destructive">{errors.project}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">القسم المنفذ *</Label>
              <Select value={formData.department} onValueChange={(value) => updateField("department", value)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="التعليم">التعليم</SelectItem>
                  <SelectItem value="الصحة">الصحة</SelectItem>
                  <SelectItem value="التنمية">التنمية</SelectItem>
                  <SelectItem value="اللوجستيات">اللوجستيات</SelectItem>
                  <SelectItem value="المالية">المالية</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-sm text-destructive">{errors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البدء *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ الانتهاء *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {duration > 0 && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm">
                <span className="text-muted-foreground">المدة الإجمالية: </span>
                <span className="font-bold text-primary">{duration} يوم</span>
                <span className="text-muted-foreground mr-2">({Math.floor(duration / 30)} شهر تقريباً)</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select value={formData.status} onValueChange={(value: any) => updateField("status", value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">مخطط</SelectItem>
                <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} className="bg-secondary hover:bg-secondary/90">
            إضافة النشاط
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
