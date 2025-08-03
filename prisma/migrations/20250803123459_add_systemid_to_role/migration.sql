-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "systemId" TEXT NOT NULL DEFAULT 'rkms-portal';

-- CreateIndex
CREATE INDEX "Role_systemId_idx" ON "Role"("systemId");
