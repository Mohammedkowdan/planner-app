"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import {
    Building2, Users, Target, Briefcase, BarChart3, ChevronDown, ChevronRight,
    FolderOpen, Plus, Pencil, Trash2, RefreshCw, Shield, TrendingUp,
    TrendingDown, Minus, ListChecks, GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
    getAdminOrgs, getAdminDepts, getAdminHierarchy,
    adminDeleteMainGoal, adminDeleteSubGoal, adminDeleteWallet,
} from "@/actions/admin-overview"

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Indicator {
    id: string; name: string; category: string; unit: string
    targetValue: number; baselineValue: number
    q1Actual: number; q2Actual: number; q3Actual: number; q4Actual: number
    status: string
}
interface SubGoal {
    id: string; name: string; description?: string | null
    indicators: Indicator[]
    _count: { indicators: number }
}
interface ProgramWallet { id: string; name: string; description?: string | null; _count: { programs: number } }
interface MainGoal {
    id: string; name: string; description?: string | null
    year?: { name: string; year: number } | null
    subGoals: SubGoal[]
    programWallets: ProgramWallet[]
    indicators: Indicator[]
    _count: { indicators: number; subGoals: number }
}
interface OrgOption { id: string; name: string }
interface DeptOption { id: string; name: string }

interface AdminOverviewClientProps {
    role: "ADMIN" | "SUPER_ADMIN"
    sessionOrgId: string
    sessionOrgName: string
    initialOrgs: OrgOption[]
    initialDepts: DeptOption[]
}

// ─── Status helpers ────────────────────────────────────────────────────────────

function statusColor(s: string) {
    if (s === "on-track" || s === "completed") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
    if (s === "at-risk" || s === "in-progress") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
}
function statusLabel(s: string) {
    const m: Record<string, string> = {
        "on-track": "على المسار", "at-risk": "في خطر", "off-track": "خارج المسار",
        "completed": "مكتمل", "delayed": "متأخر", "pending": "معلق", "in-progress": "جارٍ",
    }
    return m[s] ?? s
}
function calcActual(ind: Indicator) {
    return (ind.q1Actual + ind.q2Actual + ind.q3Actual + ind.q4Actual) / 4
}
function calcProgress(ind: Indicator) {
    if (!ind.targetValue) return 0
    return Math.min(100, Math.round((calcActual(ind) / ind.targetValue) * 100))
}

// ─── Indicator Row ─────────────────────────────────────────────────────────────

function IndicatorRow({ ind }: { ind: Indicator }) {
    const pct = calcProgress(ind)
    return (
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors group/ind">
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ind.name}</p>
                <p className="text-xs text-muted-foreground">{ind.category} · {ind.unit}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 min-w-[140px]">
                <Progress value={pct} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-8 text-left">{pct}%</span>
            </div>
            <div className="text-xs text-muted-foreground hidden md:block w-24 text-center">
                {calcActual(ind).toFixed(1)} / {ind.targetValue} {ind.unit}
            </div>
            <Badge className={`text-xs shrink-0 ${statusColor(ind.status)}`} variant="secondary">
                {statusLabel(ind.status)}
            </Badge>
        </div>
    )
}

// ─── Sub-Goal Accordion ────────────────────────────────────────────────────────

function SubGoalAccordion({
    sg, onDelete,
}: {
    sg: SubGoal
    onDelete: (id: string, name: string) => void
}) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border rounded-lg">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-muted/40 rounded-lg transition-colors group/sg"
            >
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
                <GitBranch className="w-4 h-4 text-violet-500 shrink-0" />
                <span className="font-medium flex-1 text-right truncate">{sg.name}</span>
                {sg.description && (
                    <span className="text-xs text-muted-foreground hidden md:block max-w-[200px] truncate">
                        {sg.description}
                    </span>
                )}
                <Badge variant="outline" className="text-xs font-normal ml-auto shrink-0">
                    {sg._count.indicators} مؤشر
                </Badge>
                <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 text-destructive hover:bg-destructive/10 opacity-0 group-hover/sg:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => { e.stopPropagation(); onDelete(sg.id, sg.name) }}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </button>
            {open && sg.indicators.length > 0 && (
                <div className="border-t divide-y">
                    {sg.indicators.map(ind => <IndicatorRow key={ind.id} ind={ind} />)}
                </div>
            )}
            {open && sg.indicators.length === 0 && (
                <p className="text-xs text-muted-foreground px-10 py-3">لا توجد مؤشرات مرتبطة بهذا الهدف الفرعي</p>
            )}
        </div>
    )
}

// ─── Main Goal Card ────────────────────────────────────────────────────────────

function GoalCard({
    goal, onDeleteGoal, onDeleteSubGoal, onDeleteWallet,
}: {
    goal: MainGoal
    onDeleteGoal: (id: string, name: string) => void
    onDeleteSubGoal: (id: string, name: string) => void
    onDeleteWallet: (id: string, name: string) => void
}) {
    const [open, setOpen] = useState(false)
    const totalIndicators =
        goal.indicators.length + goal.subGoals.reduce((s, sg) => s + sg._count.indicators, 0)

    return (
        <Card className="border-r-4 border-r-primary hover:shadow-md transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => setOpen(!open)}
                        className="flex items-start gap-2 flex-1 text-right group/toggle"
                    >
                        <ChevronDown className={`w-5 h-5 text-muted-foreground mt-0.5 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`} />
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{goal.name}</CardTitle>
                            {goal.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{goal.description}</p>
                            )}
                        </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                        {goal.year && (
                            <Badge variant="secondary" className="text-xs font-normal">{goal.year.name}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs font-normal">{goal.subGoals.length} فرعي</Badge>
                        <Badge variant="outline" className="text-xs font-normal">{totalIndicators} مؤشر</Badge>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteGoal(goal.id, goal.name)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {open && (
                <CardContent className="pt-0 space-y-4">
                    {/* Program Wallets (Bags) */}
                    {goal.programWallets.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" /> حقائب البرامج
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {goal.programWallets.map(w => (
                                    <div key={w.id} className="group/wallet flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                                        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{w.name}</span>
                                        <Badge variant="secondary" className="text-xs h-4 px-1 font-normal">
                                            {w._count.programs}
                                        </Badge>
                                        <Button
                                            variant="ghost" size="icon"
                                            className="h-5 w-5 text-destructive hover:bg-destructive/10 opacity-0 group-hover/wallet:opacity-100 transition-opacity"
                                            onClick={() => onDeleteWallet(w.id, w.name)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub-Goals */}
                    {goal.subGoals.length > 0 && (
                        <div>
                            <Separator className="mb-3" />
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <GitBranch className="w-3.5 h-3.5" /> الأهداف الفرعية
                            </p>
                            <div className="space-y-1.5">
                                {goal.subGoals.map(sg => (
                                    <SubGoalAccordion key={sg.id} sg={sg} onDelete={onDeleteSubGoal} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Direct Indicators (not under sub-goals) */}
                    {goal.indicators.length > 0 && (
                        <div>
                            <Separator className="mb-3" />
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                <BarChart3 className="w-3.5 h-3.5" /> مؤشرات مباشرة
                            </p>
                            <div className="space-y-0.5">
                                {goal.indicators.map(ind => <IndicatorRow key={ind.id} ind={ind} />)}
                            </div>
                        </div>
                    )}

                    {goal.subGoals.length === 0 && goal.indicators.length === 0 && goal.programWallets.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            لا توجد أهداف فرعية أو مؤشرات أو حقائب مرتبطة بهذا الهدف
                        </p>
                    )}
                </CardContent>
            )}
        </Card>
    )
}

// ─── Overview Stats ────────────────────────────────────────────────────────────

function OverviewStats({ goals }: { goals: MainGoal[] }) {
    const totalGoals = goals.length
    const totalWallets = goals.reduce((s, g) => s + g.programWallets.length, 0)
    const totalSubGoals = goals.reduce((s, g) => s + g.subGoals.length, 0)
    const totalIndicators = goals.reduce((s, g) =>
        s + g.indicators.length + g.subGoals.reduce((ss, sg) => ss + sg._count.indicators, 0), 0
    )
    const stats = [
        { label: "أهداف عامة", value: totalGoals, icon: Target, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
        { label: "حقائب برامج", value: totalWallets, icon: Briefcase, color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30" },
        { label: "أهداف فرعية", value: totalSubGoals, icon: GitBranch, color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
        { label: "مؤشرات", value: totalIndicators, icon: BarChart3, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
    ]
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map(s => (
                <Card key={s.label} className="border-0 shadow-sm bg-card">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className={`p-2.5 rounded-xl ${s.color}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

// ─── Main Client ───────────────────────────────────────────────────────────────

export function AdminOverviewClient({
    role, sessionOrgId, sessionOrgName, initialOrgs, initialDepts,
}: AdminOverviewClientProps) {
    const isSuperAdmin = role === "SUPER_ADMIN"

    const [orgs] = useState<OrgOption[]>(initialOrgs)
    const [depts, setDepts] = useState<DeptOption[]>(initialDepts)
    const [selectedOrg, setSelectedOrg] = useState<string>(isSuperAdmin ? "" : sessionOrgId)
    const [selectedOrgName, setSelectedOrgName] = useState<string>(isSuperAdmin ? "" : sessionOrgName)
    const [selectedDept, setSelectedDept] = useState<string>("")
    const [goals, setGoals] = useState<MainGoal[]>([])
    const [loaded, setLoaded] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Confirm dialog state
    const [confirmDelete, setConfirmDelete] = useState<{
        type: "goal" | "subgoal" | "wallet"; id: string; name: string
    } | null>(null)

    // When org changes (SUPER_ADMIN only), reload depts
    const handleOrgChange = async (orgId: string) => {
        const org = orgs.find(o => o.id === orgId)
        setSelectedOrg(orgId)
        setSelectedOrgName(org?.name ?? "")
        setSelectedDept("")
        setGoals([])
        setLoaded(false)
        const res = await getAdminDepts(orgId)
        setDepts(res.data ?? [])
    }

    const loadHierarchy = () => {
        if (!selectedOrg || !selectedDept) {
            toast.warning("يرجى اختيار المنظمة والقسم أولاً")
            return
        }
        startTransition(async () => {
            const res = await getAdminHierarchy(selectedOrg, selectedDept)
            if (res.success) {
                setGoals(res.data as MainGoal[])
                setLoaded(true)
            } else {
                toast.error("فشل في جلب البيانات", { description: res.error })
            }
        })
    }

    // ── Delete handlers ────────────────────────────────────────────────────────

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return
        let result: { success?: boolean; error?: string } = {}

        if (confirmDelete.type === "goal") result = await adminDeleteMainGoal(confirmDelete.id)
        else if (confirmDelete.type === "subgoal") result = await adminDeleteSubGoal(confirmDelete.id)
        else if (confirmDelete.type === "wallet") result = await adminDeleteWallet(confirmDelete.id)

        if (result.success) {
            toast.success("تم الحذف بنجاح")
            loadHierarchy() // refresh
        } else {
            toast.error("فشل في الحذف", { description: result.error })
        }
        setConfirmDelete(null)
    }

    return (
        <div className="space-y-0">
            {/* ── Gradient Hero Header ─────────────────────────────────────── */}
            <div className="rounded-2xl bg-gradient-to-l from-slate-900 via-indigo-900 to-violet-900 p-6 mb-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">النظرة الإدارية الشاملة</h1>
                        <p className="text-sm text-white/70">
                            {isSuperAdmin ? "صلاحية عالمية — جميع المنظمات والأقسام" : `منظمة مقيدة — ${sessionOrgName}`}
                        </p>
                    </div>
                    <Badge className="mr-auto bg-white/20 text-white border-white/20 hover:bg-white/30">
                        {isSuperAdmin ? "SUPER ADMIN" : "ADMIN"}
                    </Badge>
                </div>

                {/* ── Scope Selector ──────────────────────────────────────── */}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                    {/* Org selector — only for SUPER_ADMIN */}
                    {isSuperAdmin && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-white/70 flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" /> المنظمة
                            </label>
                            <Select value={selectedOrg} onValueChange={handleOrgChange}>
                                <SelectTrigger className="w-52 bg-white/10 border-white/20 text-white hover:bg-white/20">
                                    <SelectValue placeholder="اختر المنظمة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orgs.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Dept selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-white/70 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> القسم
                        </label>
                        <Select
                            value={selectedDept}
                            onValueChange={(v) => { setSelectedDept(v); setGoals([]); setLoaded(false) }}
                            disabled={!selectedOrg || depts.length === 0}
                        >
                            <SelectTrigger className="w-52 bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50">
                                <SelectValue placeholder="اختر القسم" />
                            </SelectTrigger>
                            <SelectContent>
                                {depts.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={loadHierarchy}
                        disabled={!selectedOrg || !selectedDept || isPending}
                        className="bg-white text-indigo-900 hover:bg-white/90 font-semibold gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                        {isPending ? "جارٍ التحميل..." : "تحميل البيانات"}
                    </Button>
                </div>
            </div>

            {/* ── Content Area ─────────────────────────────────────────────── */}
            {!loaded && !isPending && (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                    <Shield className="w-16 h-16 text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">اختر المنظمة والقسم لعرض البيانات</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        ستظهر هنا جميع الأهداف والحقائب والمؤشرات الخاصة بالنطاق المحدد
                    </p>
                </div>
            )}

            {isPending && (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-muted-foreground">جارٍ تحميل التسلسل الهرمي...</p>
                    </div>
                </div>
            )}

            {loaded && !isPending && (
                <div className="space-y-4">
                    {/* Stats summary */}
                    <OverviewStats goals={goals} />

                    {goals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium">لا توجد بيانات لهذا النطاق</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                لم يتم إدخال أهداف أو مؤشرات لهذا القسم بعد
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onDeleteGoal={(id, name) => setConfirmDelete({ type: "goal", id, name })}
                                    onDeleteSubGoal={(id, name) => setConfirmDelete({ type: "subgoal", id, name })}
                                    onDeleteWallet={(id, name) => setConfirmDelete({ type: "wallet", id, name })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Delete Confirmation ──────────────────────────────────────── */}
            <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف &quot;{confirmDelete?.name}&quot;؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
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
