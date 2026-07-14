"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateProgramWallet } from "@/actions/program-wallets"
import { toast } from "sonner"

interface EditWalletDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    wallet: any
    mainGoals: { id: string, name: string }[]
    onUpdate: () => void
}

export function EditWalletDialog({ open, onOpenChange, wallet, mainGoals, onUpdate }: EditWalletDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        mainGoalId: ""
    })

    useEffect(() => {
        if (wallet) {
            setFormData({
                name: wallet.name,
                description: wallet.description || "",
                mainGoalId: wallet.mainGoalId
            })
        }
    }, [wallet, open])

    const handleSubmit = async () => {
        if (!formData.name || !formData.mainGoalId) {
            toast.error("يرجى ملء جميع الحقول المطلوبة")
            return
        }

        setLoading(true)
        try {
            const result = await updateProgramWallet(wallet.id, formData)
            if (result.success) {
                toast.success("تم تحديث الحقيبة بنجاح")
                onUpdate()
                onOpenChange(false)
            } else {
                toast.error(result.error || "فشل في تحديث الحقيبة")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>تعديل حقيبة البرامج</DialogTitle>
                    <DialogDescription>
                        تعديل بيانات حقيبة البرامج والهدف المرتبط بها.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">اسم الحقيبة</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
