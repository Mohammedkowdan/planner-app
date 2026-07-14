"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateMainGoal } from "@/actions/main-goals"
import { toast } from "sonner"

interface PlanningYear {
    id: string
    name: string
    year: number
}

interface Goal {
    id: string
    name: string
    description?: string | null
    yearId?: string | null
}

interface EditGoalDialogProps {
    goal: Goal
    years: PlanningYear[]
}

export function EditGoalDialog({ goal, years }: EditGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(goal.name)
    const [description, setDescription] = useState(goal.description || "")
    const [yearId, setYearId] = useState(goal.yearId || "")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const result = await updateMainGoal(goal.id, { name, description, yearId: yearId || undefined })
        setLoading(false)

        if (result?.error) {
            toast.error("فشل في تحديث الهدف", { description: result.error })
        } else {
            toast.success("تم تحديث الهدف العام بنجاح")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Pencil className="w-4 h-4" />
                    <span className="sr-only">تعديل الهدف</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>تعديل الهدف العام</DialogTitle>
                        <DialogDescription>
                            قم بتعديل تفاصيل الهدف العام ثم احفظ التغييرات.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-yearId">سنة التخطيط</Label>
                            <Select value={yearId} onValueChange={setYearId}>
                                <SelectTrigger id="edit-yearId">
                                    <SelectValue placeholder="اختر السنة..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.name} ({year.year})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">اسم الهدف</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="مثال: تحسين جودة التعليم"
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">الوصف</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="وصف مختصر للهدف..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
