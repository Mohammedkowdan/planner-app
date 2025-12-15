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
import type { Indicator } from "@/app/indicators/page"

interface CreateIndicatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateIndicator: (indicator: Omit<Indicator, "id">) => void
}

export function CreateIndicatorDialog({ open, onOpenChange, onCreateIndicator }: CreateIndicatorDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit: "",
    target: "",
    baseline: "",
    year: "2025",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateIndicator({
      ...formData,
      target: Number(formData.target),
      baseline: Number(formData.baseline),
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
      unit: "",
      target: "",
      baseline: "",
      year: "2025",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Indicator</DialogTitle>
          <DialogDescription>Add a new performance indicator to track progress</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Indicator Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Patient Satisfaction Rate"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this indicator measures"
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
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="unit">Unit of Measurement</Label>
                <Input
                  id="unit"
                  placeholder="e.g., %, hours, count"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseline">Baseline Value</Label>
                <Input
                  id="baseline"
                  type="number"
                  placeholder="Starting value"
                  value={formData.baseline}
                  onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <Input
                  id="target"
                  type="number"
                  placeholder="Goal to achieve"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Indicator</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
