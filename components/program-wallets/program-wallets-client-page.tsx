"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { Briefcase, FolderOpen, Pencil, Trash2, MoreVertical, Target } from "lucide-react"
import { CreateWalletDialog } from "./create-wallet-dialog"
import { EditWalletDialog } from "./edit-wallet-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteProgramWallet } from "@/actions/program-wallets"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProgramWalletsClientPageProps {
    wallets: any[]
    mainGoals: any[]
}

export function ProgramWalletsClientPage({ wallets: initialWallets, mainGoals }: ProgramWalletsClientPageProps) {
    const router = useRouter()
    const [wallets, setWallets] = useState(initialWallets)
    const [editingWallet, setEditingWallet] = useState<any>(null)
    const [deletingWallet, setDeletingWallet] = useState<{ id: string; name: string } | null>(null)

    const handleDelete = async () => {
        if (!deletingWallet) return
        const result = await deleteProgramWallet(deletingWallet.id)
        if (result.success) {
            setWallets(wallets.filter((w) => w.id !== deletingWallet.id))
            toast.success("تم حذف الحقيبة بنجاح")
        } else {
            toast.error("فشل في حذف الحقيبة", { description: result.error })
        }
        setDeletingWallet(null)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="حقائب البرامج"
                description="إدارة محافظ البرامج وربطها بالأهداف الاستراتيجية للمنظمة."
                icon={Briefcase}
                actions={<CreateWalletDialog mainGoals={mainGoals} />}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {wallets.length > 0 ? (
                    wallets.map((wallet) => (
                        <Card
                            key={wallet.id}
                            className="hover:shadow-lg transition-all border-t-4 border-t-indigo-500 relative group"
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold line-clamp-1 flex-1 ml-2">
                                    {wallet.name}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingWallet(wallet)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            تعديل
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                            onClick={() => setDeletingWallet({ id: wallet.id, name: wallet.name })}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            حذف
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>

                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[40px]">
                                    {wallet.description || "لا يوجد وصف"}
                                </p>

                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <Target className="w-3.5 h-3.5" />
                                            الهدف العام
                                        </span>
                                        <span
                                            className="font-medium text-indigo-600 dark:text-indigo-400 max-w-[60%] truncate"
                                            title={wallet.mainGoal?.name}
                                        >
                                            {wallet.mainGoal?.name ?? "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">البرامج</span>
                                        <Badge variant="secondary" className="font-bold">
                                            {wallet._count?.programs ?? 0} برنامج
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-muted/20">
                        <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">لا توجد حقائب برامج</h3>
                        <p className="text-muted-foreground mb-4">ابدأ بإضافة حقيبة برامج جديدة لتنظيم برامجك.</p>
                        <CreateWalletDialog mainGoals={mainGoals} />
                    </div>
                )}
            </div>

            {/* ✅ Edit Dialog */}
            <EditWalletDialog
                open={!!editingWallet}
                onOpenChange={(open) => !open && setEditingWallet(null)}
                wallet={editingWallet}
                mainGoals={mainGoals}
                onUpdate={() => {
                    setEditingWallet(null)
                    router.refresh()
                }}
            />

            {/* ✅ Proper delete confirmation — replaces window.confirm() */}
            <AlertDialog
                open={!!deletingWallet}
                onOpenChange={(open) => !open && setDeletingWallet(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف حقيبة &quot;{deletingWallet?.name}&quot; نهائياً. البرامج المرتبطة بها لن تُحذف لكنها ستُفصل عنها.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            حذف
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
