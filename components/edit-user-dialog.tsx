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
import { updateUser } from "@/actions/users"
import { Edit } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    role: string
    organizationId: string
    departmentId: string
}

interface EditUserDialogProps {
    user: User
}

export function EditUserDialog({ user }: EditUserDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // States for form with initial values
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState(user.role)
    const [password, setPassword] = useState("") // Empty by default (no change)

    // Mock data for dropdowns (in real app, fetch from server or constants)
    const departments = [
        { id: "dept-1", value: "education", label: "التعليم" },
        { id: "dept-2", value: "health", label: "الصحة" },
    ]
    const organizations = [
        { id: "org-1", value: "main", label: "المكتب الرئيسي" },
    ]

    const [department, setDepartment] = useState(user.departmentId || departments[0].id)
    const [organization, setOrganization] = useState(user.organizationId || organizations[0].id)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const selectedDept = departments.find(d => d.id === department)
        const selectedOrg = organizations.find(o => o.id === organization)

        const result = await updateUser(user.id, {
            name,
            email,
            role: role as any,
            organizationId: selectedOrg?.id,
            organizationName: selectedOrg?.label,
            departmentId: selectedDept?.id,
            departmentName: selectedDept?.label,
            // Only send password if provided
            ...(password ? { password } : {}),
        })

        if (result.success) {
            setOpen(false)
            setPassword("") // Clear password field
        } else {
            alert(result.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                    <Edit className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                    <DialogDescription>
                        قم بتعديل بيانات المستخدم والصلاحيات
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>الاسم الكامل</Label>
                        <Input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>البريد الإلكتروني</Label>
                        <Input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>كلمة المرور الجديدة (اختياري)</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>الصلاحية</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
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
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {organizations.map(org => (
                                    <SelectItem key={org.id} value={org.id}>{org.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>القسم</Label>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger>
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
                            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
