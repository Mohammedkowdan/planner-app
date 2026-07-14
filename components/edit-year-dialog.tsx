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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  yearData: {
    id: string
    name: string
    year: number
    startDate: string
    endDate: string
    status: string
  } | null
  onUpdateYear: (id: string, year: {
    name?: string
    year?: number
    startDate?: string
    endDate?: string
    status?: "active" | "draft" | "completed" | "archived" | string
  }) => void
}

export function EditYearDialog({ open, onOpenChange, yearData, onUpdateYear }: EditYearDialogProps) {
  const [name, setName] = useState("")
  const [year, setYear] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<string>("draft")

  useEffect(() => {
    if (yearData && open) {
      setName(yearData.name)
      setYear(yearData.year.toString())
      setStartDate(new Date(yearData.startDate).toISOString().split('T')[0])
      setEndDate(new Date(yearData.endDate).toISOString().split('T')[0])
      setStatus(yearData.status.toLowerCase())
    }
  }, [yearData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (yearData && name.trim() && year.trim() && startDate && endDate) {
      onUpdateYear(yearData.id, {
        name: name.trim(),
        year: Number.parseInt(year),
        startDate,
        endDate,
        status,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تحديث سنة التخطيط</DialogTitle>
          <DialogDescription>قم بتعديل بيانات سنة التخطيط لتحديث النظام</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم السنة</Label>
              <Input
                id="edit-name"
                placeholder="مثال: الخطة الاستراتيجية 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-year">السنة</Label>
              <Input
                id="edit-year"
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
                <Label htmlFor="edit-startDate">تاريخ البدء</Label>
                <Input id="edit-startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-endDate">تاريخ الانتهاء</Label>
                <Input id="edit-endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">الحالة</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="archived">مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!name.trim() || !year.trim() || !startDate || !endDate}>
              تحديث
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
