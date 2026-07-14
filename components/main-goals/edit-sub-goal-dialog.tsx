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
import { updateSubGoal } from "@/actions/sub-goals"
import { toast } from "sonner"

interface SubGoal {
    id: string
    name: string
    description?: string | null
}

interface EditSubGoalDialogProps {
    subGoal: SubGoal
}

export function EditSubGoalDialog({ subGoal }: EditSubGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(subGoal.name)
    const [description, setDescription] = useState(subGoal.description || "")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const result = await updateSubGoal(subGoal.id, { name, description })
        setLoading(false)

        if (result?.error) {
            toast.error("فشل في تحديث الهدف الفرعي", { description: result.error })
        } else {
            toast.success("تم تحديث الهدف الفرعي بنجاح")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="sr-only">تعديل الهدف الفرعي</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>تعديل الهدف الفرعي</DialogTitle>
                        <DialogDescription>
                            قم بتعديل تفاصيل الهدف الفرعي ثم احفظ التغييرات.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sub-name">اسم الهدف الفرعي</Label>
                            <Input
                                id="edit-sub-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="مثال: رفع معدل النجاح الدراسي"
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sub-description">الوصف</Label>
                            <Textarea
                                id="edit-sub-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="وصف مختصر للهدف الفرعي..."
                                rows={3}
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
