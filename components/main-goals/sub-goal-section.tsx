"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, ChevronRight, BarChart3 } from "lucide-react"
import { deleteSubGoal } from "@/actions/sub-goals"
import { toast } from "sonner"
import { CreateSubGoalDialog } from "./create-sub-goal-dialog"
import { EditSubGoalDialog } from "./edit-sub-goal-dialog"
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

interface SubGoal {
    id: string
    name: string
    description?: string | null
    _count?: { indicators: number }
}

interface SubGoalSectionProps {
    mainGoalId: string
    initialSubGoals: SubGoal[]
    totalIndicators: number
}

export function SubGoalSection({ mainGoalId, initialSubGoals, totalIndicators }: SubGoalSectionProps) {
    const [subGoals, setSubGoals] = useState(initialSubGoals)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [expanded, setExpanded] = useState(true)

    const handleDelete = async () => {
        if (!deletingId) return
        const result = await deleteSubGoal(deletingId)
        if (result.success) {
            setSubGoals(subGoals.filter((sg) => sg.id !== deletingId))
            toast.success("تم حذف الهدف الفرعي بنجاح")
        } else {
            toast.error("فشل في حذف الهدف الفرعي", { description: result.error })
        }
        setDeletingId(null)
    }

    return (
        <div className="mt-4 space-y-2">
            {/* Sub-goals header row */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronRight
                        className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                    />
                    الأهداف الفرعية
                    <Badge variant="secondary" className="text-xs h-5 px-1.5 font-normal">
                        {subGoals.length}
                    </Badge>
                </button>

                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BarChart3 className="w-3.5 h-3.5" />
                        {totalIndicators} مؤشر
                    </span>
                    <CreateSubGoalDialog
                        mainGoalId={mainGoalId}
                        onCreated={() => {
                            // Server revalidation will handle refresh automatically
                        }}
                    />
                </div>
            </div>

            {/* Sub-goals list */}
            {expanded && (
                <div className="space-y-1 pl-2 border-r-2 border-border/50 mr-1">
                    {subGoals.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 pr-2">
                            لا توجد أهداف فرعية — أضف هدفاً فرعياً لتنظيم المؤشرات
                        </p>
                    ) : (
                        subGoals.map((sg) => (
                            <div
                                key={sg.id}
                                className="group/sub flex items-start justify-between gap-2 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium leading-snug truncate">{sg.name}</p>
                                    {sg.description && (
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {sg.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Badge
                                        variant="outline"
                                        className="text-xs h-5 px-1.5 font-normal text-muted-foreground"
                                    >
                                        {sg._count?.indicators ?? 0} مؤشر
                                    </Badge>
                                    <EditSubGoalDialog subGoal={sg} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                                        onClick={() => setDeletingId(sg.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="sr-only">حذف</span>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من حذف الهدف الفرعي؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف هذا الهدف الفرعي نهائياً. المؤشرات المرتبطة به لن تُحذف لكنها ستُفصل عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
