"use client"

import type React from "react"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Indicator } from "@/components/indicators/indicators-client-page"

interface SubGoal {
  id: string
  name: string
}

interface MainGoal {
  id: string
  name: string
  subGoals?: SubGoal[]
}

interface CreateIndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIndicator: (indicator: Omit<Indicator, "id">) => void
  mainGoals?: MainGoal[]
}

export function CreateIndicatorDialog({ open, onOpenChange, onCreateIndicator, mainGoals = [] }: CreateIndicatorDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    mainGoalId: "",
    subGoalId: "",
    unit: "",
    target: "",
    baseline: "",
    yearId: "",
  })

  // Derive the sub-goals list based on the selected main goal
  const availableSubGoals = mainGoals.find(g => g.id === formData.mainGoalId)?.subGoals ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.mainGoalId) {
      alert("يرجى اختيار الهدف العام")
      return
    }
    if (availableSubGoals.length > 0 && !formData.subGoalId) {
      alert("يرجى اختيار الهدف الفرعي")
      return
    }
    onCreateIndicator({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      mainGoalId: formData.mainGoalId,
      subGoalId: formData.subGoalId || undefined,
      unit: formData.unit,
      target: Number(formData.target) || 0,
      baseline: Number(formData.baseline) || 0,
      yearId: formData.yearId || "",
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      status: "on-track",
    })
    setFormData({
      name: "",
      description: "",
      category: "",
      mainGoalId: "",
      subGoalId: "",
      unit: "",
      target: "",
      baseline: "",
      yearId: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة مؤشر جديد</DialogTitle>
          <DialogDescription>أضف مؤشر أداء جديد لتتبع التقدم</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">اسم المؤشر</Label>
                <Input
                  id="name"
                  placeholder="مثال: معدل رضا المستفيدين"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="اصف ما يقيسه هذا المؤشر"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Main Goal */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="mainGoal">الهدف العام</Label>
                <Select
                  value={formData.mainGoalId}
                  onValueChange={(value) => setFormData({ ...formData, mainGoalId: value, subGoalId: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الهدف العام المرتبط" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainGoals.length > 0 ? (
                      mainGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-muted-foreground">لا توجد أهداف عامة</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub-Goal — shown only when a main goal with sub-goals is selected */}
              {formData.mainGoalId && availableSubGoals.length > 0 && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="subGoal">الهدف الفرعي</Label>
                  <Select
                    value={formData.subGoalId}
                    onValueChange={(value) => setFormData({ ...formData, subGoalId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الهدف الفرعي المرتبط" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubGoals.map((sg) => (
                        <SelectItem key={sg.id} value={sg.id}>
                          {sg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quality">الجودة</SelectItem>
                    <SelectItem value="Efficiency">الكفاءة</SelectItem>
                    <SelectItem value="Development">التنمية</SelectItem>
                    <SelectItem value="Financial">المالية</SelectItem>
                    <SelectItem value="Customer">المستفيدين</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">وحدة القياس</Label>
                <Input
                  id="unit"
                  placeholder="مثال: %، ساعة، عدد"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseline">قيمة الأساس</Label>
                <Input
                  id="baseline"
                  type="number"
                  placeholder="القيمة الحالية"
                  value={formData.baseline}
                  onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">القيمة المستهدفة</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="الهدف المراد تحقيقه"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">إنشاء المؤشر</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
