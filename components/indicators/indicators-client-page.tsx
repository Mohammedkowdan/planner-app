"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Target } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IndicatorCard } from "@/components/indicator-card"
import { CreateIndicatorDialog } from "@/components/create-indicator-dialog"
import { EditIndicatorDialog } from "@/components/edit-indicator-dialog"
import { PageHeader } from "@/components/page-header"
import { createIndicator, updateIndicator, deleteIndicator } from "@/actions/planning"
import { useOrganization } from "@/contexts/organization-context"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface Indicator {
    id: string
    name: string
    description: string | null
    category: string
    unit: string
    target: number
    baseline: number
    q1: number
    q2: number
    q3: number
    q4: number
    status: "on-track" | "at-risk" | "off-track" | "delayed" | "completed" | "pending" | "in-progress"
    yearId: string
    mainGoalId?: string
    subGoalId?: string
}

interface IndicatorsClientPageProps {
    initialIndicators: any[]
    initialYears: any[]
    mainGoals: any[]
}

export function IndicatorsClientPage({ initialIndicators, initialYears, mainGoals }: IndicatorsClientPageProps) {
    const [indicators, setIndicators] = useState<Indicator[]>(initialIndicators.map(ind => ({
        ...ind,
        target: ind.targetValue ?? ind.target,
        baseline: ind.baselineValue ?? ind.baseline,
        description: ind.description ?? undefined,
        status: ind.status as Indicator["status"],
        q1: ind.q1Actual || 0,
        q2: ind.q2Actual || 0,
        q3: ind.q3Actual || 0,
        q4: ind.q4Actual || 0,
        mainGoalId: ind.mainGoalId ?? undefined,
        subGoalId: ind.subGoalId ?? undefined,
    })))

    const { currentOrganization } = useOrganization()

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null)
    const [deletingIndicatorId, setDeletingIndicatorId] = useState<string | null>(null)

    const currentYear = initialYears.find(y => y.status === "ACTIVE") || initialYears[0]

    const categories = Array.from(new Set(indicators.map((ind) => ind.category))).filter(Boolean) as string[]

    const filteredIndicators = indicators.filter((indicator) => {
        const matchesSearch =
            indicator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (indicator.description && indicator.description.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = !selectedCategory || indicator.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleCreateIndicator = async (indicatorData: Omit<Indicator, "id">) => {
        if (!currentYear) {
            toast.warning("لا توجد سنة تخطيطية", {
                description: "يرجى إضافة سنة تخطيطية أولاً من صفحة السنوات التخطيطية.",
            })
            return
        }

        const result = await createIndicator({
            name: indicatorData.name,
            description: indicatorData.description ?? undefined,
            category: indicatorData.category,
            baselineValue: indicatorData.baseline,
            targetValue: indicatorData.target,
            unit: indicatorData.unit,
            yearId: currentYear.id,
            organizationId: currentOrganization?.id || "org-1",
            organizationName: currentOrganization?.name || "Main",
            departmentId: "dept-1",
            departmentName: "General",
            mainGoalId: indicatorData.mainGoalId ?? undefined,
            subGoalId: indicatorData.subGoalId ?? undefined,
        })

        if (result.success && result.data) {
            const newInd: Indicator = {
                ...result.data,
                target: result.data.targetValue,
                baseline: result.data.baselineValue,
                status: result.data.status as Indicator["status"],
                q1: result.data.q1Actual || 0,
                q2: result.data.q2Actual || 0,
                q3: result.data.q3Actual || 0,
                q4: result.data.q4Actual || 0,
                mainGoalId: result.data.mainGoalId ?? undefined,
                subGoalId: result.data.subGoalId ?? undefined,
            }
            setIndicators([newInd, ...indicators])
            setShowCreateDialog(false)
            toast.success("تم إنشاء المؤشر بنجاح")
        } else {
            toast.error("فشل في إنشاء المؤشر", { description: result.error })
        }
    }

    const handleUpdateIndicator = async (updatedIndicator: Indicator) => {
        const result = await updateIndicator(updatedIndicator.id, {
            name: updatedIndicator.name,
            description: updatedIndicator.description ?? undefined,
            category: updatedIndicator.category,
            unit: updatedIndicator.unit,
            targetValue: updatedIndicator.target,
            baselineValue: updatedIndicator.baseline,
            q1Actual: updatedIndicator.q1,
            q2Actual: updatedIndicator.q2,
            q3Actual: updatedIndicator.q3,
            q4Actual: updatedIndicator.q4,
            mainGoalId: updatedIndicator.mainGoalId ?? null,
            subGoalId: updatedIndicator.subGoalId ?? null,
        })

        if (result.success && result.data) {
            const updated: Indicator = {
                ...result.data,
                target: result.data.targetValue,
                baseline: result.data.baselineValue,
                status: result.data.status as Indicator["status"],
                q1: result.data.q1Actual || 0,
                q2: result.data.q2Actual || 0,
                q3: result.data.q3Actual || 0,
                q4: result.data.q4Actual || 0,
                mainGoalId: result.data.mainGoalId ?? undefined,
                subGoalId: result.data.subGoalId ?? undefined,
            }
            setIndicators(indicators.map((ind) => (ind.id === updated.id ? updated : ind)))
            setEditingIndicator(null)
            toast.success("تم تحديث المؤشر بنجاح")
        } else {
            toast.error("فشل في تحديث المؤشر", { description: result.error })
        }
    }

    const handleDeleteIndicator = async () => {
        if (!deletingIndicatorId) return
        const result = await deleteIndicator(deletingIndicatorId)
        if (result.success) {
            setIndicators(indicators.filter((ind) => ind.id !== deletingIndicatorId))
            toast.success("تم حذف المؤشر بنجاح")
        } else {
            toast.error("فشل في حذف المؤشر", { description: result.error })
        }
        setDeletingIndicatorId(null)
    }

    const handleOpenCreateDialog = () => {
        if (!currentYear) {
            toast.warning("لا توجد سنة تخطيطية", {
                description: "يرجى إضافة سنة تخطيطية أولاً من صفحة السنوات التخطيطية.",
            })
            return
        }
        setShowCreateDialog(true)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="خطة المؤشرات"
                    description="تتبع وإدارة مؤشرات الأداء الاستراتيجية"
                    icon={Target}
                    actions={
                        <Button onClick={handleOpenCreateDialog} className="bg-white/20 hover:bg-white/30 text-white border-0">
                            <Plus className="w-4 h-4 mr-2" />
                            مؤشر جديد
                        </Button>
                    }
                />

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="البحث عن المؤشرات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant={selectedCategory === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(null)}
                        >
                            الكل
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    {indicators.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <Target className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">لا توجد مؤشرات</h3>
                            <p className="text-muted-foreground max-w-sm mb-6">
                                لم يتم إضافة أي مؤشرات بعد. ابدأ بإضافة مؤشر جديد لتتبع أداء الخطة الاستراتيجية.
                            </p>
                            <Button onClick={handleOpenCreateDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة مؤشر جديد
                            </Button>
                        </div>
                    ) : (
                        <>
                            {filteredIndicators.map((indicator) => (
                                <IndicatorCard
                                    key={indicator.id}
                                    indicator={indicator}
                                    onEdit={setEditingIndicator}
                                    onDelete={(id) => setDeletingIndicatorId(id)}
                                />
                            ))}
                            {filteredIndicators.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">لم يتم العثور على مؤشرات مطابقة للبحث</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <CreateIndicatorDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onCreateIndicator={handleCreateIndicator as any}
                mainGoals={mainGoals}
            />

            {editingIndicator && (
                <EditIndicatorDialog
                    open={!!editingIndicator}
                    onOpenChange={(open) => !open && setEditingIndicator(null)}
                    indicator={editingIndicator}
                    onUpdateIndicator={handleUpdateIndicator as any}
                    mainGoals={mainGoals}
                />
            )}

            {/* ✅ Proper confirmation dialog instead of window.confirm() */}
            <AlertDialog open={!!deletingIndicatorId} onOpenChange={(open) => !open && setDeletingIndicatorId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف هذا المؤشر نهائياً ولا يمكن التراجع عن هذه العملية.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteIndicator}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    )
}
