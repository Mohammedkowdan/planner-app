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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createMainGoal } from "@/actions/main-goals"
import { toast } from "sonner"

interface PlanningYear {
    id: string
    name: string
    year: number
}

export function CreateMainGoalDialog({ years }: { years: PlanningYear[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const result = await createMainGoal(formData)
        setLoading(false)

        if (result?.error) {
            toast.error("فشل في إنشاء الهدف", { description: result.error })
        } else {
            toast.success("تم إنشاء الهدف العام بنجاح")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="w-4 h-4" />
                    إضافة هدف عام
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>إضافة هدف عام جديد</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل الهدف العام وسنة التخطيط.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="yearId">سنة التخطيط</Label>
                            <Select name="yearId" required>
                                <SelectTrigger>
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
                            <Label htmlFor="name">اسم الهدف</Label>
                            <Input id="name" name="name" placeholder="مثال: تحسين جودة التعليم" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">الوصف</Label>
                            <Textarea id="description" name="description" placeholder="وصف مختصر للهدف..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "جاري الحفظ..." : "حفظ الهدف"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
