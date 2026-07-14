"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { createSubGoal } from "@/actions/sub-goals"
import { toast } from "sonner"

interface CreateSubGoalDialogProps {
    mainGoalId: string
    onCreated?: () => void
}

export function CreateSubGoalDialog({ mainGoalId, onCreated }: CreateSubGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.set("mainGoalId", mainGoalId)
        const result = await createSubGoal(formData)
        setLoading(false)

        if (result?.error) {
            toast.error("فشل في إنشاء الهدف الفرعي", { description: result.error })
        } else {
            toast.success("تم إنشاء الهدف الفرعي بنجاح")
            setOpen(false)
            onCreated?.()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs border-dashed hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة هدف فرعي
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>إضافة هدف فرعي جديد</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل الهدف الفرعي المرتبط بهذا الهدف العام.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sub-name">اسم الهدف الفرعي</Label>
                            <Input
                                id="sub-name"
                                name="name"
                                placeholder="مثال: رفع معدل النجاح الدراسي"
                                required
                                minLength={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sub-description">الوصف</Label>
                            <Textarea
                                id="sub-description"
                                name="description"
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
                            {loading ? "جاري الحفظ..." : "حفظ الهدف الفرعي"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
