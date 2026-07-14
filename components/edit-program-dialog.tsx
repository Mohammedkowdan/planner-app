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
import { Plus, Trash2 } from "lucide-react"
import type { Program, Initiative } from "@/components/programs/programs-client-page"

interface EditProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: Program
  onUpdateProgram: (program: Program) => void
}

export function EditProgramDialog({ open, onOpenChange, program, onUpdateProgram }: EditProgramDialogProps) {
  const [formData, setFormData] = useState(program)

  useEffect(() => {
    setFormData(program)
  }, [program])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProgram(formData)
  }

  const handleAddInitiative = () => {
    const newInitiative: Initiative = {
      id: `init-${Date.now()}`,
      name: "",
      status: "pending",
      dueDate: "",
    }
    setFormData({
      ...formData,
      initiatives: [...formData.initiatives, newInitiative],
    })
  }

  const handleUpdateInitiative = (index: number, field: keyof Initiative, value: string) => {
    const updatedInitiatives = [...formData.initiatives]
    updatedInitiatives[index] = { ...updatedInitiatives[index], [field]: value }
    setFormData({ ...formData, initiatives: updatedInitiatives })
  }

  const handleDeleteInitiative = (index: number) => {
    setFormData({
      ...formData,
      initiatives: formData.initiatives.filter((_, i) => i !== index),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل البرنامج</DialogTitle>
          <DialogDescription>تحديث تفاصيل البرنامج وتتبع المبادرات</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم البرنامج</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">القسم المسؤول</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT & Digital">تقنية المعلومات والرقمنة</SelectItem>
                    <SelectItem value="Emergency Services">خدمات الطوارئ</SelectItem>
                    <SelectItem value="Public Health">الصحة العامة</SelectItem>
                    <SelectItem value="Administration">الإدارة</SelectItem>
                    <SelectItem value="Operations">العمليات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">التخطيط</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="on-hold">متوقف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spent">المصروف ($)</Label>
                <Input
                  id="spent"
                  type="number"
                  value={formData.spent}
                  onChange={(e) => setFormData({ ...formData, spent: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">التقدم (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">المبادرات الرئيسية</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddInitiative}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة مبادرة
                </Button>
              </div>

              <div className="space-y-3">
                {formData.initiatives.map((initiative, index) => (
                  <div key={initiative.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Input
                        placeholder="اسم المبادرة"
                        value={initiative.name}
                        onChange={(e) => handleUpdateInitiative(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={initiative.status}
                        onValueChange={(value) => handleUpdateInitiative(index, "status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="in-progress">جاري التنفيذ</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="date"
                        value={initiative.dueDate}
                        onChange={(e) => handleUpdateInitiative(index, "dueDate", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteInitiative(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">تحديث البرنامج</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
