import { redirect } from "next/navigation";
import { ReportFilters } from "./filters";
import { Prisma } from "@/generated/prisma/client";
import Link from "next/link";
import { Plus, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AnnualReportsPage({
  searchParams,
}: {
  searchParams: { query?: string; year?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const query = searchParams?.query || "";
  const year = searchParams?.year ? parseInt(searchParams.year) : undefined;

  const where: Prisma.AnnualReportWhereInput = {
    organizationId: session.orgId,
    departmentId: session.deptId,
  };

  if (query) {
    where.title = { contains: query, mode: "insensitive" };
  }

  if (year) {
    where.reportYear = year;
  }

  const reports = await prisma.annualReport.findMany({
    where,
    include: {
      _count: {
        select: { projects: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const allYears = await prisma.annualReport.groupBy({
    by: ['reportYear'],
    where: {
      organizationId: session.orgId,
      departmentId: session.deptId
    },
    _count: true
  });
  const years = allYears.map((y: { reportYear: number }) => y.reportYear).sort((a: number, b: number) => b - a);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التقارير السنوية</h1>
          <p className="text-muted-foreground mt-1 text-lg">منصة التقارير السنوية الخاصة بالقطاعات</p>
        </div>
        <Button asChild>
          <Link href="/annual-reports/import">
            <Plus className="ml-2 h-4 w-4" />
            استيراد تقرير جديد (Excel)
          </Link>
        </Button>
      </div>

      <ReportFilters years={years} />

      {reports.length === 0 ? (
        <div className="text-center bg-card border rounded-lg p-12 space-y-4">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileBarChart2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">لا توجد تقارير سنوية</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            يمكنك استيراد نماذج التقارير السنوية بصيغة Excel لإنشاء قاعدة بيانات المشاريع والمستفيدين.
          </p>
          <Button asChild className="mt-4">
            <Link href="/annual-reports/import">
              <Plus className="ml-2 h-4 w-4" />
              ابدأ بالاستيراد الآن
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl line-clamp-1" title={report.title || "بدون عنوان"}>
                    {report.title || "بدون عنوان"}
                  </CardTitle>
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md font-semibold font-mono">
                    {report.reportYear}
                  </span>
                </div>
                <CardDescription className="text-sm">
                  {new Date(report.createdAt).toLocaleDateString("ar-SA")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold ml-3">
                    {report._count.projects}
                  </div>
                  <div>
                    <p className="font-semibold">مشروع مسجل</p>
                    <p className="text-muted-foreground text-xs">تم استيراده من الملف</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t mt-4">
                <Button variant="ghost" className="w-full justify-between group" asChild>
                  <Link href={`/annual-reports/${report.id}`}>
                    التفاصيل والإحصاءات
                    <FileBarChart2 className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
