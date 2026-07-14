import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, MapPin, Target, DollarSign } from "lucide-react";

export default async function StatisticsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const achievements = await prisma.projectAchievement.findMany({
        where: {
            organizationId: session.orgId,
            ...(session.role !== "SUPER_ADMIN" && { departmentId: session.deptId })
        },
        include: {
            mainGoal: true,
            subGoal: true,
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    let totalFamilies = 0;
    let totalBeneficiaries = 0;
    let totalBudget = 0;
    const uniqueProjects = new Set();
    const uniqueGovernorates = new Set();

    achievements.forEach(ach => {
        totalFamilies += ach.familiesCount;
        totalBeneficiaries += (ach.boysCount + ach.girlsCount + ach.menCount + ach.womenCount);
        totalBudget += Number(ach.budgetUsd);
        uniqueProjects.add(ach.projectName);
        uniqueGovernorates.add(ach.governorate);
    });

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">إحصائيات إنجازات المشاريع</h2>
                    <p className="text-muted-foreground text-lg">عرض كافة الإحصائيات والإنجازات المدخلة للمشاريع</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="shadow-lg border-t-4 border-t-emerald-500 rounded-xl bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي المستفيدين (أفراد)</CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{totalBeneficiaries.toLocaleString("ar-SA")}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-t-4 border-t-blue-500 rounded-xl bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الأسر</CardTitle>
                            <Building2 className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{totalFamilies.toLocaleString("ar-SA")}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-t-4 border-t-primary rounded-xl bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
                            <Target className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">{uniqueProjects.size}</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-t-4 border-t-amber-500 rounded-xl bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">إجمالي الموازنات (دولار)</CardTitle>
                            <DollarSign className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">${totalBudget.toLocaleString("en-US")}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="shadow-xl rounded-2xl overflow-hidden border-t-4 border-t-primary bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle>سجل الإنجازات التفصيلي</CardTitle>
                        <CardDescription>عرض لجميع المدخلات مصنفة حسب المحافظة والأهداف والمشروع</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="font-semibold px-6 py-4">المشروع</TableHead>
                                        <TableHead className="font-semibold px-6 py-4">المحافظة</TableHead>
                                        <TableHead className="font-semibold px-6 py-4">الهدف المرتبط</TableHead>
                                        <TableHead className="font-semibold px-6 py-4 text-center">الأسر</TableHead>
                                        <TableHead className="font-semibold px-6 py-4 text-center">أفراد المستفيدين</TableHead>
                                        <TableHead className="font-semibold px-6 py-4 text-left">الموازنة ($)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {achievements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                لم يتم إدخال أي إنجازات بعد.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        achievements.map((ach) => {
                                            const totalB = ach.boysCount + ach.girlsCount + ach.menCount + ach.womenCount;
                                            return (
                                                <TableRow key={ach.id} className="hover:bg-muted/30 transition-colors group">
                                                    <TableCell className="px-6 font-medium group-hover:text-primary transition-colors">{ach.projectName}</TableCell>
                                                    <TableCell className="px-6">
                                                        <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-none flex items-center gap-1 w-fit">
                                                            <MapPin className="w-3 h-3" /> {ach.governorate}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            <span className="font-semibold text-slate-800 line-clamp-1" title={ach.mainGoal.name}>رئيسي: {ach.mainGoal.name}</span>
                                                            <span className="text-slate-500 line-clamp-1" title={ach.subGoal.name}>فرعي: {ach.subGoal.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 text-center font-medium text-amber-600">{ach.familiesCount.toLocaleString("ar-SA")}</TableCell>
                                                    <TableCell className="px-6 text-center font-bold text-emerald-600">{totalB.toLocaleString("ar-SA")}</TableCell>
                                                    <TableCell className="px-6 text-left font-medium text-slate-700">${Number(ach.budgetUsd).toLocaleString("en-US")}</TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
