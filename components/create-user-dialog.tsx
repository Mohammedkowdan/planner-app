"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { departments, organizations } from "@/lib/constants"
import { createUser } from "@/actions/users"
import { Plus } from "lucide-react"

export function CreateUserDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // States for form
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState("USER")

    const [department, setDepartment] = useState(departments[0].id)
    const [organization, setOrganization] = useState(organizations[0].id)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (password !== confirmPassword) {
            alert("كلمة المرور غير متطابقة")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
            setLoading(false)
            return
        }

        const selectedDept = departments.find(d => d.id === department)
        const selectedOrg = organizations.find(o => o.id === organization)

        const result = await createUser({
            name,
            email,
            password,
            role: role as any,
            organizationId: selectedOrg?.id || "org-1",
            organizationName: selectedOrg?.name || "المكتب الرئيسي",
            departmentId: selectedDept?.id || "dept-1",
            departmentName: selectedDept?.label || "التعليم",
        })

        if (result.success) {
            setOpen(false)
            setName("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مستخدم
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>
                        قم بإدخال بيانات المستخدم الجديد وتحديد صلاحياته
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>الاسم الكامل</Label>
                        <Input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="محمد أحمد"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>البريد الإلكتروني</Label>
                        <Input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>كلمة المرور</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>تأكيد كلمة المرور</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="******"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>الصلاحية</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">مستخدم عادي</SelectItem>
                                <SelectItem value="MANAGER">مدير قسم</SelectItem>
                                <SelectItem value="ADMIN">مدير نظام</SelectItem>
                                <SelectItem value="SUPER_ADMIN">مدير رئيسي (Super Admin)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>المنظمة</Label>
                        <Select value={organization} onValueChange={setOrganization}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map(org => (
                                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>القسم</Label>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "جاري الحفظ..." : "حفظ"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
