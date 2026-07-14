"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProgramWallet } from "@/actions/program-wallets"
import { Plus } from "lucide-react"
import { toast } from "sonner"

interface CreateWalletDialogProps {
    mainGoals: { id: string, name: string }[]
}

export function CreateWalletDialog({ mainGoals }: CreateWalletDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        mainGoalId: ""
    })

    const handleSubmit = async () => {
        if (!formData.name || !formData.mainGoalId) {
            toast.error("يرجى ملء جميع الحقول المطلوبة")
            return
        }

        setLoading(true)
        try {
            const result = await createProgramWallet(formData)
            if (result.success) {
                toast.success("تم إنشاء الحقيبة بنجاح")
                setOpen(false)
                setFormData({ name: "", description: "", mainGoalId: "" })
            } else {
                toast.error(result.error || "فشل في إنشاء الحقيبة")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-primary hover:bg-white/90">
                    <Plus className="w-4 h-4" />
                    حقيبة جديدة
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>إضافة حقيبة برامج جديدة</DialogTitle>
                    <DialogDescription>
                        قم بإنشاء حقيبة برامج وربطها بهدف عام لتنظيم برامجك.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">اسم الحقيبة</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="مثال: حقيبة التحول الرقمي"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mainGoal">الهدف العام المرتبط</Label>
                        <Select
                            value={formData.mainGoalId}
                            onValueChange={(val) => setFormData({ ...formData, mainGoalId: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر هدفاً عاماً" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainGoals.map(goal => (
                                    <SelectItem key={goal.id} value={goal.id}>
                                        {goal.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">الوصف (اختياري)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "جاري الحفظ..." : "حفظ الحقيبة"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
