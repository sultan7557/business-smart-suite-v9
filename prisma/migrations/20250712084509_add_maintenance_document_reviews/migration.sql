/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "hasGeneratedNextAudit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MaintenanceDocumentReview" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "reviewerName" TEXT,
    "reviewDetails" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceDocumentReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_number_key" ON "Audit"("number");

-- AddForeignKey
ALTER TABLE "MaintenanceDocumentReview" ADD CONSTRAINT "MaintenanceDocumentReview_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "MaintenanceDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceDocumentReview" ADD CONSTRAINT "MaintenanceDocumentReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
