-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'DRAFT', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('on-track', 'at-risk', 'delayed', 'completed', 'pending', 'in-progress');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningYear" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "q1Target" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q1Actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q2Target" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q2Actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q3Target" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q3Actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q4Target" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "q4Actual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProgressStatus" NOT NULL DEFAULT 'on-track',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,
    "spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'on-track',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "initiatives" TEXT NOT NULL DEFAULT '[]',
    "yearId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "project" TEXT,
    "department" TEXT,
    "status" "ProgressStatus" NOT NULL DEFAULT 'pending',
    "color" TEXT,
    "assignedTo" TEXT,
    "yearId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImplementationReport" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    "implementationDate" TIMESTAMP(3) NOT NULL,
    "men" INTEGER NOT NULL DEFAULT 0,
    "women" INTEGER NOT NULL DEFAULT 0,
    "boys" INTEGER NOT NULL DEFAULT 0,
    "girls" INTEGER NOT NULL DEFAULT 0,
    "plannedBudget" DOUBLE PRECISION NOT NULL,
    "actualBudget" DOUBLE PRECISION NOT NULL,
    "outputs" TEXT,
    "challenges" TEXT,
    "recommendations" TEXT,
    "attachments" TEXT NOT NULL DEFAULT '[]',
    "reportedBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImplementationReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "PlanningYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "PlanningYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "PlanningYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplementationReport" ADD CONSTRAINT "ImplementationReport_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
