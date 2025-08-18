-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "systemId" TEXT NOT NULL DEFAULT 'business-smart-suite';

-- CreateIndex
CREATE INDEX "Role_systemId_idx" ON "Role"("systemId");
