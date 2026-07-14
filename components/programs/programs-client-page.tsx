"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Layers } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProgramCard } from "@/components/program-card"
import { CreateProgramDialog } from "@/components/create-program-dialog"
import { EditProgramDialog } from "@/components/edit-program-dialog"
import { PageHeader } from "@/components/page-header"
import { createProgram, updateProgram, deleteProgram } from "@/actions/planning"
import { useOrganization } from "@/contexts/organization-context"

export interface Initiative {
    id: string
    name: string
    status: "pending" | "in-progress" | "completed"
    dueDate: string
}

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
    yearId: string
    programWalletId?: string | null
}

interface ProgramsClientPageProps {
    initialPrograms: any[]
    initialYears: any[]
    initialWallets: any[]
}

export function ProgramsClientPage({ initialPrograms, initialYears, initialWallets }: ProgramsClientPageProps) {
    const [programs, setPrograms] = useState<Program[]>(initialPrograms.map(prog => ({
        ...prog,
        startDate: new Date(prog.startDate).toISOString().split('T')[0],
        endDate: new Date(prog.endDate).toISOString().split('T')[0],
        initiatives: typeof prog.initiatives === 'string' ? JSON.parse(prog.initiatives) : (prog.initiatives || []),
        status: prog.status as any,
        department: prog.departmentName || prog.department || "",
        description: prog.description || ""
    })))

    const { currentOrganization } = useOrganization()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingProgram, setEditingProgram] = useState<Program | null>(null)

    // Get current active year or fallback to the first one
    const currentYear = initialYears.find(y => y.status === 'ACTIVE') || initialYears[0]

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

    const handleCreateProgram = async (programData: Omit<Program, "id">) => {
        if (!currentYear) {
            alert("عفواً، لا يمكن إنشاء برنامج جديد لعدم وجود سنة تخطيطية معرفة. يرجى إضافة سنة تخطيطية أولاً من صفحة الإعدادات.")
            return
        }

        const result = await createProgram({
            ...programData,
            yearId: currentYear.id,
            programWalletId: programData.programWalletId || undefined,
            department: programData.department,
        })

        if (result.success && result.data) {
            const newProg: Program = {
                ...result.data,
                budget: Number(result.data.budget),
                spent: Number(result.data.spent),
                startDate: new Date(result.data.startDate).toISOString().split('T')[0],
                endDate: new Date(result.data.endDate).toISOString().split('T')[0],
                initiatives: typeof result.data.initiatives === 'string' ? JSON.parse(result.data.initiatives) : (result.data.initiatives || []),
                status: result.data.status as any,
                department: result.data.departmentName || "General",
                description: result.data.description || ""
            }
            setPrograms([newProg, ...programs])
            setShowCreateDialog(false)
        } else {
            alert("فشل في إنشاء البرنامج")
        }
    }

    const handleUpdateProgram = async (updatedProgram: Program) => {
        const updatePayload = {
            ...updatedProgram,
            programWalletId: updatedProgram.programWalletId || undefined
        };
        const result = await updateProgram(updatedProgram.id, updatePayload)

        if (result.success && result.data) {
            const updated: Program = {
                ...result.data,
                budget: Number(result.data.budget),
                spent: Number(result.data.spent),
                startDate: new Date(result.data.startDate).toISOString().split('T')[0],
                endDate: new Date(result.data.endDate).toISOString().split('T')[0],
                initiatives: typeof result.data.initiatives === 'string' ? JSON.parse(result.data.initiatives) : (result.data.initiatives || []),
                status: result.data.status as any,
                department: result.data.departmentName || "General",
                description: result.data.description || ""
            }
            setPrograms(programs.map((prog) => (prog.id === updated.id ? updated : prog)))
            setEditingProgram(null)
        } else {
            alert("فشل في تحديث البرنامج")
        }
    }

    const handleDeleteProgram = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا البرنامج؟")) {
            const result = await deleteProgram(id)
            if (result.success) {
                setPrograms(programs.filter((prog) => prog.id !== id))
            } else {
                alert("فشل في حذف البرنامج")
            }
        }
    }

    const handleOpenCreateDialog = () => {
        if (!currentYear) {
            alert("عفواً، لا يمكن إنشاء برنامج جديد لعدم وجود سنة تخطيطية معرفة. يرجى إضافة سنة تخطيطية أولاً من صفحة الإعدادات.")
            return
        }
        setShowCreateDialog(true)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="خطة البرامج"
                    description="إدارة البرامج الاستراتيجية وتتبع تقدم المبادرات"
                    icon={Layers}
                    actions={
                        programs.length >= 0 && (
                            <Button onClick={handleOpenCreateDialog} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                <Plus className="w-4 h-4 mr-2" />
                                برنامج جديد
                            </Button>
                        )
                    }
                />

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
                    {programs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <Layers className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">لا توجد برامج</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                لم يتم إضافة أي برامج بعد. ابدأ بإضافة برنامج استراتيجي جديد لتنظيم العمل والمبادرات.
                            </p>
                            <Button onClick={handleOpenCreateDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة برنامج جديد
                            </Button>
                        </div>
                    ) : (
                        <>
                            {filteredPrograms.map((program) => (
                                <ProgramCard
                                    key={program.id}
                                    program={program}
                                    onEdit={setEditingProgram}
                                    onDelete={handleDeleteProgram}
                                />
                            ))}
                            {filteredPrograms.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">لم يتم العثور على برامج مطابقة للبحث</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CreateProgramDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onCreateProgram={handleCreateProgram}
                programWallets={initialWallets}
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
