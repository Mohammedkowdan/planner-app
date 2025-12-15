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
import type { Program } from "@/app/programs/page"

interface CreateProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateProgram: (program: Omit<Program, "id">) => void
}

export function CreateProgramDialog({ open, onOpenChange, onCreateProgram }: CreateProgramDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    budget: "",
    startDate: "",
    endDate: "",
    year: "2025",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateProgram({
      ...formData,
      budget: Number(formData.budget),
      spent: 0,
      status: "planning",
      progress: 0,
      initiatives: [],
    })
    setFormData({
      name: "",
      description: "",
      department: "",
      budget: "",
      startDate: "",
      endDate: "",
      year: "2025",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
          <DialogDescription>Add a new strategic program to your plan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Program Name</Label>
              <Input
                id="name"
                placeholder="e.g., Digital Health Initiative"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the program objectives and scope"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT & Digital">IT & Digital</SelectItem>
                    <SelectItem value="Emergency Services">Emergency Services</SelectItem>
                    <SelectItem value="Public Health">Public Health</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g., 1000000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
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
              Cancel
            </Button>
            <Button type="submit">Create Program</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
