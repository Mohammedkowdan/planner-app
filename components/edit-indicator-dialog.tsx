"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

interface EditIndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicator: Indicator
  onUpdateIndicator: (indicator: Indicator) => void
  mainGoals?: MainGoal[]
}

export function EditIndicatorDialog({ open, onOpenChange, indicator, onUpdateIndicator, mainGoals = [] }: EditIndicatorDialogProps) {
  const [formData, setFormData] = useState(indicator)

  useEffect(() => {
    setFormData(indicator)
  }, [indicator])

  // Derive sub-goals for the currently selected main goal
  const availableSubGoals = mainGoals.find(g => g.id === formData.mainGoalId)?.subGoals ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Auto-calculate status based on progress
    const currentProgress = (formData.q1 + formData.q2 + formData.q3 + formData.q4) / 4
    const progressPercentage = (currentProgress / formData.target) * 100
    let status: "on-track" | "at-risk" | "off-track" = "on-track"

    if (progressPercentage < 60) {
      status = "off-track"
    } else if (progressPercentage < 80) {
      status = "at-risk"
    }

    onUpdateIndicator({ ...formData, status })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل المؤشر</DialogTitle>
          <DialogDescription>تحديث تفاصيل المؤشر والأهداف</DialogDescription>
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
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Main Goal */}
              {mainGoals.length > 0 && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-mainGoal">الهدف العام</Label>
                  <Select
                    value={formData.mainGoalId || ""}
                    onValueChange={(value) => setFormData({ ...formData, mainGoalId: value, subGoalId: undefined })}
                  >
                    <SelectTrigger id="edit-mainGoal">
                      <SelectValue placeholder="اختر الهدف العام المرتبط" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sub-Goal — shown only when main goal has sub-goals */}
              {formData.mainGoalId && availableSubGoals.length > 0 && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-subGoal">الهدف الفرعي</Label>
                  <Select
                    value={formData.subGoalId || ""}
                    onValueChange={(value) => setFormData({ ...formData, subGoalId: value || undefined })}
                  >
                    <SelectTrigger id="edit-subGoal">
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

              <div className="space-y-2">
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
                  onChange={(e) => setFormData({ ...formData, baseline: Number(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="col-span-2 border-t pt-4">
                <h4 className="font-semibold mb-3">القيم الفعلية الفصلية</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="q1">الربع الأول</Label>
                    <Input
                      id="q1"
                      type="number"
                      value={formData.q1}
                      onChange={(e) => setFormData({ ...formData, q1: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q2">الربع الثاني</Label>
                    <Input
                      id="q2"
                      type="number"
                      value={formData.q2}
                      onChange={(e) => setFormData({ ...formData, q2: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q3">الربع الثالث</Label>
                    <Input
                      id="q3"
                      type="number"
                      value={formData.q3}
                      onChange={(e) => setFormData({ ...formData, q3: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q4">الربع الرابع</Label>
                    <Input
                      id="q4"
                      type="number"
                      value={formData.q4}
                      onChange={(e) => setFormData({ ...formData, q4: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">حفظ التغييرات</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
