-- Add departmentId and departmentName with a safe default for existing rows,
-- then remove the default so future inserts must supply them explicitly.

ALTER TABLE "ProgramWallet"
  ADD COLUMN "departmentId"   TEXT NOT NULL DEFAULT '',
  ADD COLUMN "departmentName" TEXT NOT NULL DEFAULT '';

-- Strip the defaults so all future rows must supply values
ALTER TABLE "ProgramWallet"
  ALTER COLUMN "departmentId"   DROP DEFAULT,
  ALTER COLUMN "departmentName" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "ProgramWallet_organizationId_departmentId_idx" ON "ProgramWallet"("organizationId", "departmentId");
