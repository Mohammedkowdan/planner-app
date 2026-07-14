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
import type { Program } from "@/components/programs/programs-client-page"

interface CreateProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProgram: (program: Omit<Program, "id">) => void
  programWallets: any[]
}

export function CreateProgramDialog({ open, onOpenChange, onCreateProgram, programWallets }: CreateProgramDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    budget: "",
    startDate: "",
    endDate: "",
    yearId: "",
    programWalletId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.programWalletId) {
      alert("يرجى اختيار حقيبة البرامج")
      return
    }
    onCreateProgram({
      name: formData.name,
      description: formData.description,
      department: formData.department,
      budget: Number(formData.budget),
      startDate: formData.startDate,
      endDate: formData.endDate,
      yearId: formData.yearId,
      spent: 0,
      progress: 0,
      initiatives: [],
      status: "planning",
      programWalletId: formData.programWalletId
    })
    // ... reset form including programWalletId
    setFormData({
      name: "",
      description: "",
      department: "",
      budget: "",
      startDate: "",
      endDate: "",
      yearId: "",
      programWalletId: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة برنامج جديد</DialogTitle>
          <DialogDescription>أضف برنامجاً استراتيجياً جديداً وتفاصيل ميزانيته</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">

            <div className="space-y-2 col-span-2">
              <Label htmlFor="wallet">حقيبة البرامج</Label>
              <Select
                value={formData.programWalletId}
                onValueChange={(val) => setFormData({ ...formData, programWalletId: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر حقيبة البرامج" />
                </SelectTrigger>
                <SelectContent>
                  {programWallets.map(wallet => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">اسم البرنامج</Label>
              {/* ... input */}
              <Input
                id="name"
                placeholder="مثال: مبادرة الصحة الرقمية"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* ... rest of the form */}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                placeholder="وصف أهداف البرنامج ونطاقه"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">القسم المسؤول</Label>
                <Input
                  id="department"
                  placeholder="مثال: تقنية المعلومات"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">الميزانية ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="مثال: 1000000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
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

              <div className="space-y-2">
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">إنشاء البرنامج</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
