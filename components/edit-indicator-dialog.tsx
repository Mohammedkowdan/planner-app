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
import type { Indicator } from "@/app/indicators/page"

interface EditIndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicator: Indicator
  onUpdateIndicator: (indicator: Indicator) => void
}

export function EditIndicatorDialog({ open, onOpenChange, indicator, onUpdateIndicator }: EditIndicatorDialogProps) {
  const [formData, setFormData] = useState(indicator)

  useEffect(() => {
    setFormData(indicator)
  }, [indicator])

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
          <DialogTitle>Edit Indicator</DialogTitle>
          <DialogDescription>Update indicator details and quarterly progress</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Indicator Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Efficiency">Efficiency</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseline">Baseline</Label>
                <Input
                  id="baseline"
                  type="number"
                  value={formData.baseline}
                  onChange={(e) => setFormData({ ...formData, baseline: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  id="target"
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="col-span-2 border-t pt-4">
                <h4 className="font-semibold mb-3">Quarterly Progress</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="q1">Q1</Label>
                    <Input
                      id="q1"
                      type="number"
                      value={formData.q1}
                      onChange={(e) => setFormData({ ...formData, q1: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q2">Q2</Label>
                    <Input
                      id="q2"
                      type="number"
                      value={formData.q2}
                      onChange={(e) => setFormData({ ...formData, q2: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q3">Q3</Label>
                    <Input
                      id="q3"
                      type="number"
                      value={formData.q3}
                      onChange={(e) => setFormData({ ...formData, q3: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q4">Q4</Label>
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
              Cancel
            </Button>
            <Button type="submit">Update Indicator</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
