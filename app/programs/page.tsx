"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProgramCard } from "@/components/program-card"
import { CreateProgramDialog } from "@/components/create-program-dialog"
import { EditProgramDialog } from "@/components/edit-program-dialog"

export interface Program {
  id: string
  name: string
  description: string
  department: string
  budget: number
  spent: number
  startDate: string
  endDate: string
  status: "planning" | "active" | "completed" | "on-hold"
  progress: number
  initiatives: Initiative[]
  year: string
}

export interface Initiative {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed"
  dueDate: string
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: "prog-1",
      name: "مبادرة الصحة الرقمية",
      description: "تنفيذ نظام السجلات الصحية الإلكترونية في جميع المرافق",
      department: "تقنية المعلومات والرقمنة",
      budget: 5000000,
      spent: 3200000,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      status: "active",
      progress: 65,
      initiatives: [
        {
          id: "init-1",
          name: "شراء النظام",
          status: "completed",
          dueDate: "2025-03-31",
        },
        {
          id: "init-2",
          name: "تدريب الموظفين",
          status: "in-progress",
          dueDate: "2025-06-30",
        },
        {
          id: "init-3",
          name: "النشر الكامل",
          status: "pending",
          dueDate: "2025-09-30",
        },
      ],
      year: "2025",
    },
    {
      id: "prog-2",
      name: "تحسين الاستجابة للطوارئ",
      description: "ترقية مرافق وإجراءات قسم الطوارئ",
      department: "خدمات الطوارئ",
      budget: 2500000,
      spent: 1800000,
      startDate: "2025-02-01",
      endDate: "2025-11-30",
      status: "active",
      progress: 72,
      initiatives: [
        {
          id: "init-4",
          name: "تجديد المرافق",
          status: "in-progress",
          dueDate: "2025-07-31",
        },
        {
          id: "init-5",
          name: "ترقية المعدات",
          status: "in-progress",
          dueDate: "2025-08-31",
        },
      ],
      year: "2025",
    },
    {
      id: "prog-3",
      name: "التوعية الصحية المجتمعية",
      description: "توسيع برامج الرعاية الوقائية والتثقيف الصحي",
      department: "الصحة العامة",
      budget: 800000,
      spent: 200000,
      startDate: "2025-03-01",
      endDate: "2025-12-31",
      status: "planning",
      progress: 25,
      initiatives: [
        {
          id: "init-6",
          name: "تصميم البرنامج",
          status: "completed",
          dueDate: "2025-04-30",
        },
        {
          id: "init-7",
          name: "التواصل مع الشركاء",
          status: "pending",
          dueDate: "2025-06-30",
        },
      ],
      year: "2025",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  const statuses = ["planning", "active", "completed", "on-hold"]
  const statusLabels: Record<string, string> = {
    planning: "التخطيط",
    active: "نشط",
    completed: "مكتمل",
    "on-hold": "متوقف",
  }

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || program.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleCreateProgram = (program: Omit<Program, "id">) => {
    const newProgram: Program = {
      ...program,
      id: `prog-${Date.now()}`,
    }
    setPrograms([...programs, newProgram])
    setShowCreateDialog(false)
  }

  const handleUpdateProgram = (updatedProgram: Program) => {
    setPrograms(programs.map((prog) => (prog.id === updatedProgram.id ? updatedProgram : prog)))
    setEditingProgram(null)
  }

  const handleDeleteProgram = (id: string) => {
    setPrograms(programs.filter((prog) => prog.id !== id))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">خطة البرامج</h1>
            <p className="text-muted-foreground mt-1">إدارة البرامج الاستراتيجية وتتبع تقدم المبادرات</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            برنامج جديد
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث عن البرامج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(null)}
            >
              الكل
            </Button>
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {statusLabels[status]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPrograms.map((program) => (
            <ProgramCard key={program.id} program={program} onEdit={setEditingProgram} onDelete={handleDeleteProgram} />
          ))}
          {filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لم يتم العثور على برامج</p>
            </div>
          )}
        </div>
      </div>

      <CreateProgramDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProgram={handleCreateProgram}
      />

      {editingProgram && (
        <EditProgramDialog
          open={!!editingProgram}
          onOpenChange={(open) => !open && setEditingProgram(null)}
          program={editingProgram}
          onUpdateProgram={handleUpdateProgram}
        />
      )}
    </DashboardLayout>
  )
}
