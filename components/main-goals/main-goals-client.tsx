"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Target, Trash2 } from "lucide-react"
import { deleteMainGoal } from "@/actions/main-goals"
import { toast } from "sonner"
import { EditGoalDialog } from "@/components/main-goals/edit-goal-dialog"
import { SubGoalSection } from "@/components/main-goals/sub-goal-section"
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

interface Goal {
    id: string
    name: string
    description?: string | null
    yearId?: string | null
    year?: { id: string; name: string; year: number } | null
    subGoals?: SubGoal[]
    _count?: { indicators: number }
}

interface PlanningYear {
    id: string
    name: string
    year: number
}

interface MainGoalsClientProps {
    goals: Goal[]
    years: PlanningYear[]
}

export function MainGoalsClient({ goals: initialGoals, years }: MainGoalsClientProps) {
    const [goals, setGoals] = useState(initialGoals)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!deletingId) return
        const result = await deleteMainGoal(deletingId)
        if (result.success) {
            setGoals(goals.filter((g) => g.id !== deletingId))
            toast.success("تم حذف الهدف العام بنجاح")
        } else {
            toast.error("فشل في حذف الهدف", { description: result.error })
        }
        setDeletingId(null)
    }

    if (goals.length === 0) {
        return (
            <div className="col-span-full text-center py-12 bg-muted/20 rounded-xl border-dashed border-2">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-foreground">لا توجد أهداف عامة بعد</h3>
                <p className="text-muted-foreground">قم بإضافة هدف عام جديد للبدء بربط الأهداف الفرعية والمؤشرات</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {goals.map((goal, index) => {
                    const subGoalCount = goal.subGoals?.length ?? 0
                    const indicatorCount = goal._count?.indicators ?? 0

                    return (
                        <Card
                            key={goal.id}
                            className="relative group hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary animate-in fade-in zoom-in-50"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2 text-xl flex-1 min-w-0">
                                        <Target className="w-5 h-5 text-primary shrink-0" />
                                        <span className="truncate">{goal.name}</span>
                                    </CardTitle>

                                    {/* Edit / Delete actions */}
                                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <EditGoalDialog goal={goal} years={years} />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletingId(goal.id)}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="sr-only">حذف</span>
                                        </Button>
                                    </div>
                                </div>

                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                                    {goal.description || "لا يوجد وصف"}
                                </CardDescription>

                                {/* Year badge + counts */}
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {goal.year && (
                                        <Badge variant="secondary" className="text-xs font-normal">
                                            {goal.year.name}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                        {subGoalCount} هدف فرعي
                                    </Badge>
                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                        {indicatorCount} مؤشر مباشر
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <Separator className="mb-4" />
                                {/* Sub-goals accordion */}
                                <SubGoalSection
                                    mainGoalId={goal.id}
                                    initialSubGoals={goal.subGoals ?? []}
                                    totalIndicators={indicatorCount}
                                />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* ✅ Confirmation dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف هذا الهدف العام نهائياً مع جميع أهدافه الفرعية. المؤشرات المرتبطة لن تُحذف لكنها ستُفصل عنه.
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
        </>
    )
}
