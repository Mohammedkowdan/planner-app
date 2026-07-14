import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChevronRight, Layers, Users, MapPin, Building2, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AnnualReportDetailPage({
  params
}: {
  params: { reportId: string }
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const report = await prisma.annualReport.findUnique({
    where: {
      id: params.reportId,
      organizationId: session.orgId,
      departmentId: session.deptId
    },
    include: {
      projects: {
        include: {
          sector: true,
          donor: true,
          locations: {
            include: {
              governorate: true,
              district: true
            }
          }
        }
      }
    }
  });

  if (!report) redirect("/annual-reports");

  const totalProjects = report.projects.length;
  let totalFamilies = 0;
  let totalBeneficiaries = 0;
  const sectorsSet = new Set<string>();

  report.projects.forEach(p => {
    if (p.sector?.name) sectorsSet.add(p.sector.name);
    p.locations.forEach(loc => {
      totalFamilies += loc.familiesCount;
      totalBeneficiaries += (loc.boysCount + loc.girlsCount + loc.menCount + loc.womenCount);
    });
  });

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground mb-4">
        <Link href="/annual-reports" className="hover:text-foreground transition-colors">التقارير السنوية</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{report.title}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{report.title}</h1>
        <p className="text-muted-foreground text-lg">بناءً على التقرير السنوي للعام {report.reportYear}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary/5 hover:bg-primary/10 transition-colors border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستفيدين (أفراد)</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalBeneficiaries.toLocaleString("ar-SA")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأسر</CardTitle>
            <Building2 className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{totalFamilies.toLocaleString("ar-SA")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القطاعات المنفذة</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{sectorsSet.size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المشاريع المعتمدة</CardTitle>
          <CardDescription>
            المشاريع التي تم تضمينها في هذا التقرير والتفاصيل الخاصة بها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>القطاع</TableHead>
                  <TableHead className="w-[30%]">اسم المشروع</TableHead>
                  <TableHead>المانح</TableHead>
                  <TableHead>الجدول الزمني</TableHead>
                  <TableHead>المواقع</TableHead>
                  <TableHead className="text-left">م. المستفيدين</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      لا يوجد مشاريع
                    </TableCell>
                  </TableRow>
                ) : (
                  report.projects.map(p => {
                    let pBenes = 0;
                    p.locations.forEach(l => pBenes += (l.boysCount+l.girlsCount+l.menCount+l.womenCount));
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{p.sector?.name || 'غير محدد'}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{p.projectName}</TableCell>
                        <TableCell>{p.donor?.name || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.status ? <Badge variant="secondary" className="mb-1 block w-fit">{p.status}</Badge> : null}
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {p.startDate ? new Date(p.startDate).getFullYear() : '-'}</span>
                        </TableCell>
                        <TableCell>
                          {p.locations.length} مواقع
                        </TableCell>
                        <TableCell className="text-left font-semibold">
                          {pBenes.toLocaleString("ar-SA")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
