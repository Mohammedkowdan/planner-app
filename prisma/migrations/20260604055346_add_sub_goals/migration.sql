-- AlterTable
ALTER TABLE "Indicator" ADD COLUMN     "subGoalId" TEXT;

-- CreateTable
CREATE TABLE "SubGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mainGoalId" TEXT NOT NULL,
    "yearId" TEXT,
    "organizationId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "departmentName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubGoal_organizationId_departmentId_idx" ON "SubGoal"("organizationId", "departmentId");

-- CreateIndex
CREATE INDEX "SubGoal_mainGoalId_idx" ON "SubGoal"("mainGoalId");

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_subGoalId_fkey" FOREIGN KEY ("subGoalId") REFERENCES "SubGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubGoal" ADD CONSTRAINT "SubGoal_mainGoalId_fkey" FOREIGN KEY ("mainGoalId") REFERENCES "MainGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
