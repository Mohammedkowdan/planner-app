"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Target, TrendingUp } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CreateYearDialog } from "@/components/create-year-dialog"
import { PageHeader } from "@/components/page-header"
import { createPlanningYear, updatePlanningYear } from "@/actions/planning"
import { useOrganization } from "@/contexts/organization-context"
import { EditYearDialog } from "@/components/edit-year-dialog"
import { Pencil } from "lucide-react"
import { toast } from "sonner"

interface PlanningYearsClientPageProps {
    initialYears: any[]
}

export function PlanningYearsClientPage({ initialYears }: PlanningYearsClientPageProps) {
    const router = useRouter()
    const { currentOrganization } = useOrganization()
    const [years, setYears] = useState(initialYears)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingYear, setEditingYear] = useState<any>(null)

    const handleCreateYear = async (yearData: {
        name: string
        year: number
        startDate: string
        endDate: string
        status: "active" | "draft" | "completed"
    }) => {
        const result = await createPlanningYear({
            ...yearData,
        })

        if (result.success && result.data) {
            setYears([result.data, ...years])
            setShowCreateDialog(false)
            toast.success("تم إنشاء سنة التخطيط بنجاح")
        } else {
            toast.error("فشل في إنشاء سنة التخطيط", { description: result.error })
        }
    }

    const handleUpdateYear = async (id: string, yearData: any) => {
        const result = await updatePlanningYear(id, yearData)
        if (result.success && result.data) {
            setYears(years.map(y => y.id === id ? result.data : y))
            setEditingYear(null)
            toast.success("تم التحديث بنجاح")
        } else {
            toast.error("فشل في التحديث", { description: result.error })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "text-success bg-success/10"
            case "draft":
                return "text-warning bg-warning/10"
            case "completed":
                return "text-muted-foreground bg-muted"
            default:
                return "text-muted-foreground bg-muted"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return "نشط"
            case "draft":
                return "مسودة"
            case "completed":
                return "مكتمل"
            default:
                return status
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="سنوات التخطيط"
                    description="إدارة دورات التخطيط الاستراتيجي للمنظمة"
                    icon={Calendar}
                    actions={
                        <Button onClick={() => setShowCreateDialog(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                            <Plus className="w-4 h-4 mr-2" />
                            سنة تخطيط جديدة
                        </Button>
                    }
                />

                {years.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">لا توجد سنوات تخطيط</h3>
                            <p className="text-muted-foreground text-center mb-4">ابدأ بإنشاء سنة تخطيط استراتيجي جديدة</p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                إنشاء سنة تخطيط
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {years.map((year) => (
                            <Card
                                key={year.id}
                                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
                                onClick={() => router.push(`/dashboard/${year.id}`)}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl">{year.year}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(year.status)}`}>
                                                {getStatusLabel(year.status)}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingYear(year)
                                                }}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardDescription>{year.name}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>من:</span>
                                            <span>{new Date(year.startDate).toLocaleDateString("ar-EG")}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>إلى:</span>
                                            <span>{new Date(year.endDate).toLocaleDateString("ar-EG")}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <CreateYearDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onCreateYear={handleCreateYear} />
            
            <EditYearDialog 
                open={!!editingYear} 
                onOpenChange={(open: boolean) => !open && setEditingYear(null)} 
                yearData={editingYear}
                onUpdateYear={handleUpdateYear}
            />
        </DashboardLayout>
    )
}
