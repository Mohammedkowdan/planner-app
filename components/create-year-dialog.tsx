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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateYear: (year: {
    name: string
    year: number
    startDate: string
    endDate: string
    status: "active" | "draft" | "completed"
  }) => void
}

export function CreateYearDialog({ open, onOpenChange, onCreateYear }: CreateYearDialogProps) {
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<"active" | "draft" | "completed">("draft")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && year.trim() && startDate && endDate) {
      onCreateYear({
        name: name.trim(),
        year: Number.parseInt(year),
        startDate,
        endDate,
        status,
      })
      // إعادة تعيين النموذج
      setName("")
      setYear("")
      setStartDate("")
      setEndDate("")
      setStatus("draft")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء سنة تخطيط جديدة</DialogTitle>
          <DialogDescription>أضف سنة تخطيط استراتيجي جديدة لإدارة المؤشرات والبرامج</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم السنة</Label>
              <Input
                id="name"
                placeholder="مثال: الخطة الاستراتيجية 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">السنة</Label>
              <Input
                id="year"
                placeholder="2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                type="number"
                min="2020"
                max="2100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">الحالة</Label>
              <Select value={status} onValueChange={(value: "active" | "draft" | "completed") => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!name.trim() || !year.trim() || !startDate || !endDate}>
              إنشاء السنة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
