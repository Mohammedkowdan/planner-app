import { NextRequest, NextResponse } from "next/server";
import { parseAnnualReport } from "@/modules/annual-reports/parser";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const reportYearStr = formData.get("reportYear") as string;
    const title = formData.get("title") as string;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Parse the file
    const parsedData = await parseAnnualReport(buffer);

    const reportYear = parseInt(reportYearStr) || new Date().getFullYear();

    // Create the Annual Report first
    const annualReport = await prisma.annualReport.create({
      data: {
        title: title || `تقرير القطاعات - ${reportYear}`,
        reportYear: reportYear,
        organizationId: session.orgId,
        organizationName: session.orgName,
        departmentId: session.deptId,
        departmentName: session.deptName,
      }
    });

    // Create the PENDING import record
    const importRecord = await prisma.annualReportImport.create({
      data: {
        fileName: file.name,
        status: "PENDING",
        summary: parsedData as any,
        organizationId: session.orgId,
        organizationName: session.orgName,
        departmentId: session.deptId,
        departmentName: session.deptName,
        importedByUserId: session.userId,
        annualReportId: annualReport.id
      }
    });

    // Save issues
    if (parsedData.issues.length > 0) {
      await prisma.annualReportImportIssue.createMany({
        data: parsedData.issues.map(issue => ({
          importId: importRecord.id,
          severity: issue.severity,
          message: issue.message,
          sheetName: issue.sheetName,
          rowNumber: issue.rowNumber,
          columnName: issue.columnName,
          rawValue: issue.rawValue
        }))
      });
    }

    return NextResponse.json({ success: true, importId: importRecord.id });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
