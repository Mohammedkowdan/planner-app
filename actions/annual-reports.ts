"use server"

import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { Prisma } from "@/generated/prisma/client"
import { ParseResult } from "@/modules/annual-reports/types"

export async function commitAnnualReportImport(importId: string) {
  try {
    const session = await getSession()
    if (!session || !session.userId) throw new Error("Unauthorized")

    // Retrieve the import record and its summary
    const importRecord = await prisma.annualReportImport.findFirst({
      where: { id: importId, organizationId: session.orgId, departmentId: session.deptId }
    })

    if (!importRecord) throw new Error("Import not found")
    if (importRecord.status === "COMMITTED") throw new Error("Already committed")
    if (!importRecord.annualReportId) throw new Error("Orphaned import record")

    const parsedData = importRecord.summary as any as ParseResult
    if (!parsedData || !parsedData.projects) throw new Error("No parsed data available")

    // Database transaction to commit all
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      
      for (const pStr of parsedData.projects) {
        
        // Upsert Sector
        let sectorId = null;
        if (pStr.sector) {
          const s = await tx.sector.upsert({
            where: {
              name_organizationId_departmentId: {
                name: pStr.sector,
                organizationId: session.orgId,
                departmentId: session.deptId
              }
            },
            update: {},
            create: {
              name: pStr.sector,
              organizationId: session.orgId,
              departmentId: session.deptId
            }
          });
          sectorId = s.id;
        }

        // Upsert Donor
        let donorId = null;
        if (pStr.donor) {
          const d = await tx.donor.upsert({
            where: {
              name_organizationId_departmentId: {
                name: pStr.donor,
                organizationId: session.orgId,
                departmentId: session.deptId
              }
            },
            update: {},
            create: {
              name: pStr.donor,
              organizationId: session.orgId,
              departmentId: session.deptId
            }
          });
          donorId = d.id;
        }

        // Create Project
        const project = await tx.annualReportProject.create({
          data: {
            projectName: pStr.projectName,
            projectBrief: pStr.brief,
            projectOutputs: pStr.outputs,
            status: pStr.status,
            annualReportId: importRecord.annualReportId!,
            sectorId,
            donorId,
            organizationId: session.orgId,
            organizationName: session.orgName,
            departmentId: session.deptId,
            departmentName: session.deptName,
          }
        });

        // Insert locations
        for (const loc of pStr.locations) {
          // Upsert Governorate first
          const gov = await tx.governorate.upsert({
            where: { name: loc.governorate },
            update: {},
            create: { name: loc.governorate }
          });

          // Upsert District if exists
          let distId = null;
          if (loc.district) {
            const dist = await tx.district.upsert({
              where: {
                governorateId_name: {
                  governorateId: gov.id,
                  name: loc.district
                }
              },
              update: {},
              create: {
                name: loc.district,
                governorateId: gov.id
              }
            });
            distId = dist.id;
          }

          // Create Location
          // Only create location if Families > 0 or it's requested
          await tx.projectLocation.create({
            data: {
              projectId: project.id,
              governorateId: gov.id,
              districtId: distId,
              familiesCount: loc.families,
              boysCount: loc.boys,
              girlsCount: loc.girls,
              menCount: loc.men,
              womenCount: loc.women,
              organizationId: session.orgId,
              organizationName: session.orgName,
              departmentId: session.deptId,
              departmentName: session.deptName,
            }
          });
        }
      }

      // Mark import as COMMITTED
      await tx.annualReportImport.update({
        where: { id: importId },
        data: { status: "COMMITTED" }
      });

    });

    return { success: true }
  } catch (error: any) {
    console.error("Commit error:", error)
    return { success: false, error: error.message }
  }
}
