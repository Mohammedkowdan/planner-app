import { getUsers, deleteUser } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateUserDialog } from "@/components/create-user-dialog"
import { EditUserDialog } from "@/components/edit-user-dialog"
import { DeleteUserButton } from "@/components/delete-user-button"
import { Users, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default async function UsersPage() {
    const { data: users, success } = await getUsers()

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">إدارة المستخدمين</h2>
                    <p className="text-muted-foreground">عرض وإدارة الحسابات والصلاحيات</p>
                </div>
                <CreateUserDialog />
            </div>

            <Card className="shadow-xl border-t-4 border-t-primary rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/20 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <Users className="w-5 h-5" />
                        قائمة المستخدمين
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {success && users && users.length > 0 ? (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-right">
                                <thead className="bg-muted/30">
                                    <tr className="border-b">
                                        <th className="h-14 px-6 align-middle font-semibold text-slate-600">الاسم</th>
                                        <th className="h-14 px-6 align-middle font-semibold text-slate-600">البريد الإلكتروني</th>
                                        <th className="h-14 px-6 align-middle font-semibold text-slate-600">الصلاحية</th>
                                        <th className="h-14 px-6 align-middle font-semibold text-slate-600">القسم</th>
                                        <th className="h-14 px-6 align-middle font-semibold text-slate-600 text-left rounded-tl-lg">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {users.map((user: any) => (
                                        <tr key={user.id} className="border-b transition-all duration-200 hover:bg-white hover:shadow-sm data-[state=selected]:bg-muted group">
                                            <td className="p-4 px-6 align-middle font-medium text-slate-900 group-hover:text-primary transition-colors">{user.name}</td>
                                            <td className="p-4 px-6 align-middle text-slate-600">{user.email}</td>
                                            <td className="p-4 px-6 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-all
                          ${user.role === 'SUPER_ADMIN' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/20' :
                            user.role === 'ADMIN' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20' :
                                                        user.role === 'MANAGER' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/20' : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 px-6 align-middle font-medium text-slate-700">{user.departmentName}</td>
                                            <td className="p-4 px-6 align-middle text-left">
                                                <div className="flex items-center gap-2">
                                                    <EditUserDialog user={user} />
                                                    <DeleteUserButton userId={user.id} userName={user.name} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            لا يوجد مستخدمين حالياً
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    )
}
