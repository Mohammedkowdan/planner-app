"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { getAdminOrgs, getAdminDepts } from "@/actions/admin-overview"
import { getAdminUsersForNotification, broadcastNotification } from "@/actions/admin-notifications"

interface BroadcastPanelProps {
    sessionRole: string;
    sessionOrgId: string;
}

export function BroadcastPanel({ sessionRole, sessionOrgId }: BroadcastPanelProps) {
    const isSuperAdmin = sessionRole === "SUPER_ADMIN"

    const [isPending, startTransition] = useTransition()
    
    // Scope states
    const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])
    const [depts, setDepts] = useState<{ id: string; name: string }[]>([])
    const [users, setUsers] = useState<{ id: string; name: string, departmentName: string }[]>([])

    const [selectedOrgId, setSelectedOrgId] = useState(isSuperAdmin ? "all" : sessionOrgId)
    const [selectedDeptId, setSelectedDeptId] = useState("all")
    const [selectedUserId, setSelectedUserId] = useState("all")

    // Form states
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [type, setType] = useState<"INFO" | "SUCCESS" | "WARNING" | "ERROR">("INFO")
    const [link, setLink] = useState("")

    useEffect(() => {
        if (isSuperAdmin) {
            getAdminOrgs().then(res => {
                if (res.success && res.data) setOrgs(res.data)
            })
        }
    }, [isSuperAdmin])

    useEffect(() => {
        const orgToFetch = selectedOrgId === "all" ? null : selectedOrgId
        if (orgToFetch) {
            getAdminDepts(orgToFetch).then(res => {
                if (res.success && res.data) setDepts(res.data)
            })
            getAdminUsersForNotification(orgToFetch).then(res => {
                if (res.success && res.data) setUsers(res.data)
            })
        } else {
            setDepts([])
            setUsers([])
        }
        setSelectedDeptId("all")
        setSelectedUserId("all")
    }, [selectedOrgId])

    useEffect(() => {
        const orgToFetch = selectedOrgId === "all" ? null : selectedOrgId
        if (orgToFetch) {
            const deptToFetch = selectedDeptId === "all" ? undefined : selectedDeptId
            getAdminUsersForNotification(orgToFetch, deptToFetch).then(res => {
                if (res.success && res.data) setUsers(res.data)
            })
        }
        setSelectedUserId("all")
    }, [selectedDeptId, selectedOrgId])

    const handleSend = () => {
        if (selectedOrgId === "all" && isSuperAdmin) {
            toast.error("خطأ", { description: "يرجى اختيار منظمة على الأقل" })
            return
        }
        if (!title || !message) {
            toast.error("خطأ", { description: "يرجى تعبئة العنوان ونص الرسالة" })
            return
        }

        startTransition(async () => {
            const res = await broadcastNotification({
                title,
                message,
                type,
                link: link || undefined,
                targetOrgId: selectedOrgId === "all" ? undefined : selectedOrgId,
                targetDeptId: selectedDeptId === "all" ? undefined : selectedDeptId,
                targetUserId: selectedUserId === "all" ? undefined : selectedUserId,
            })

            if (res.success) {
                toast.success("نجاح", { description: res.message })
                setTitle("")
                setMessage("")
                setLink("")
                setType("INFO")
            } else {
                toast.error("خطأ", { description: res.error })
            }
        })
    }

    return (
        <Card className="shadow-lg border-t-4 border-t-primary" dir="rtl">
            <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Send className="w-5 h-5" /> إرسال تنبيهات (Broadcast)
                </CardTitle>
                <CardDescription>
                    إرسال تنبيه أو رسالة لجميع المستخدمين ضمن منظمة، قسم، أو لمستخدم محدد
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/20 p-4 rounded-xl border">
                    {/* Organization Dropdown */}
                    {isSuperAdmin && (
                        <div className="space-y-2">
                            <Label>المنظمة المستهدفة</Label>
                            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر المنظمة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">-- يرجى الاختيار --</SelectItem>
                                    {orgs.map(org => (
                                        <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Department Dropdown */}
                    <div className="space-y-2">
                        <Label>القسم المستهدف</Label>
                        <Select value={selectedDeptId} onValueChange={setSelectedDeptId} disabled={selectedOrgId === "all"}>
                            <SelectTrigger>
                                <SelectValue placeholder="الجميع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأقسام</SelectItem>
                                {depts.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* User Dropdown */}
                    <div className="space-y-2">
                        <Label>المستخدم المستهدف</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={selectedOrgId === "all"}>
                            <SelectTrigger>
                                <SelectValue placeholder="الجميع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع المستخدمين</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.departmentName})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>عنوان التنبيه</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تنبيه هام بخصوص خطة 2025" />
                        </div>
                        <div className="space-y-2">
                            <Label>نوع التنبيه</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INFO">معلومة (أزرق)</SelectItem>
                                    <SelectItem value="SUCCESS">نجاح (أخضر)</SelectItem>
                                    <SelectItem value="WARNING">تحذير (برتقالي)</SelectItem>
                                    <SelectItem value="ERROR">خطأ (أحمر)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>نص التنبيه</Label>
                        <Textarea 
                            rows={4} 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="أدخل محتوى الرسالة هنا..." 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>رابط مرفق (اختياري)</Label>
                        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/dashboard, /main-goals, etc..." dir="ltr" className="text-left" />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleSend} disabled={isPending || (isSuperAdmin && selectedOrgId === "all")} className="w-full md:w-auto px-8 gap-2">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        إرسال التنبيه
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
