/*
  Warnings:

  - You are about to alter the column `plannedBudget` on the `ImplementationReport` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `actualBudget` on the `ImplementationReport` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `attachments` column on the `ImplementationReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `budget` on the `Program` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `spent` on the `Program` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - The `initiatives` column on the `Program` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ImplementationReport" ALTER COLUMN "plannedBudget" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "actualBudget" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "attachments",
ADD COLUMN     "attachments" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "MainGoal" ADD COLUMN     "yearId" TEXT;

-- AlterTable
ALTER TABLE "Program" ALTER COLUMN "budget" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "spent" SET DATA TYPE DECIMAL(15,2),
DROP COLUMN "initiatives",
ADD COLUMN     "initiatives" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT;

-- CreateIndex
CREATE INDEX "Activity_organizationId_departmentId_idx" ON "Activity"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "ImplementationReport_organizationId_departmentId_idx" ON "ImplementationReport"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "Indicator_organizationId_departmentId_idx" ON "Indicator"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "MainGoal_organizationId_departmentId_idx" ON "MainGoal"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "PlanningYear_organizationId_departmentId_idx" ON "PlanningYear"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "Program_organizationId_departmentId_idx" ON "Program"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "User_organizationId_departmentId_idx" ON "User"("organizationId", "departmentId");

-- AddForeignKey
ALTER TABLE "MainGoal" ADD CONSTRAINT "MainGoal_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "PlanningYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
