-- CreateTable
CREATE TABLE "Sector" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" TEXT,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Governorate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Governorate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReport" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "reportYear" INTEGER NOT NULL,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReportProject" (
    "id" TEXT NOT NULL,
    "sheetNo" INTEGER,
    "projectName" TEXT NOT NULL,
    "projectBrief" TEXT,
    "projectOutputs" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT,
    "budgetUsd" DECIMAL(18,2),
    "annualReportId" TEXT NOT NULL,
    "sectorId" TEXT,
    "donorId" TEXT,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualReportProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLocation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "governorateId" TEXT NOT NULL,
    "districtId" TEXT,
    "familiesCount" INTEGER NOT NULL DEFAULT 0,
    "boysCount" INTEGER NOT NULL DEFAULT 0,
    "girlsCount" INTEGER NOT NULL DEFAULT 0,
    "menCount" INTEGER NOT NULL DEFAULT 0,
    "womenCount" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReportImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "summary" JSONB,
    "annualReportId" TEXT,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "importedByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualReportImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualReportImportIssue" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sheetName" TEXT,
    "rowNumber" INTEGER,
    "columnName" TEXT,
    "rawValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnnualReportImportIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sector_organizationId_departmentId_idx" ON "Sector"("organizationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Sector_name_organizationId_departmentId_key" ON "Sector"("name", "organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "Donor_organizationId_departmentId_idx" ON "Donor"("organizationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_name_organizationId_departmentId_key" ON "Donor"("name", "organizationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Governorate_name_key" ON "Governorate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "District_governorateId_name_key" ON "District"("governorateId", "name");

-- CreateIndex
CREATE INDEX "AnnualReport_organizationId_departmentId_idx" ON "AnnualReport"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "AnnualReportProject_organizationId_departmentId_idx" ON "AnnualReportProject"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "ProjectLocation_organizationId_departmentId_idx" ON "ProjectLocation"("organizationId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLocation_projectId_governorateId_districtId_key" ON "ProjectLocation"("projectId", "governorateId", "districtId");

-- CreateIndex
CREATE INDEX "AnnualReportImport_organizationId_departmentId_idx" ON "AnnualReportImport"("organizationId", "departmentId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportProject" ADD CONSTRAINT "AnnualReportProject_annualReportId_fkey" FOREIGN KEY ("annualReportId") REFERENCES "AnnualReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportProject" ADD CONSTRAINT "AnnualReportProject_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportProject" ADD CONSTRAINT "AnnualReportProject_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "AnnualReportProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLocation" ADD CONSTRAINT "ProjectLocation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportImport" ADD CONSTRAINT "AnnualReportImport_annualReportId_fkey" FOREIGN KEY ("annualReportId") REFERENCES "AnnualReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportImport" ADD CONSTRAINT "AnnualReportImport_importedByUserId_fkey" FOREIGN KEY ("importedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualReportImportIssue" ADD CONSTRAINT "AnnualReportImportIssue_importId_fkey" FOREIGN KEY ("importId") REFERENCES "AnnualReportImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
