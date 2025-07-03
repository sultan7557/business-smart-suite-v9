/*
  Warnings:

  - You are about to drop the column `attendees` on the `ManagementReview` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ManagementReview` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ManagementReview` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ManagementReview` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `ManagementReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `ManagementReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewDate` to the `ManagementReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `ManagementReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CertificateReview" ALTER COLUMN "reviewerName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "businessContinuityId" TEXT,
ADD COLUMN     "correctiveActionId" TEXT,
ADD COLUMN     "coshhId" TEXT,
ADD COLUMN     "jobDescriptionId" TEXT,
ADD COLUMN     "managementReviewId" TEXT,
ADD COLUMN     "workInstructionId" TEXT;

-- AlterTable
ALTER TABLE "ManagementReview" DROP COLUMN "attendees",
DROP COLUMN "date",
DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ManualReview" (
    "id" TEXT NOT NULL,
    "manualId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcedureReview" (
    "id" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcedureReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormReview" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveActionCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CorrectiveActionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "content" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveActionVersion" (
    "id" TEXT NOT NULL,
    "correctiveActionId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "CorrectiveActionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveActionReview" (
    "id" TEXT NOT NULL,
    "correctiveActionId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorrectiveActionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessContinuityCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessContinuityCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessContinuity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "content" TEXT,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessContinuity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessContinuityVersion" (
    "id" TEXT NOT NULL,
    "businessContinuityId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "BusinessContinuityVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessContinuityReview" (
    "id" TEXT NOT NULL,
    "businessContinuityId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessContinuityReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementReviewCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ManagementReviewCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementReviewVersion" (
    "id" TEXT NOT NULL,
    "managementReviewId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "ManagementReviewVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementReviewReview" (
    "id" TEXT NOT NULL,
    "managementReviewId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "reviewerName" TEXT,
    "details" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManagementReviewReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescription" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "department" TEXT NOT NULL,
    "content" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescriptionCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDescriptionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescriptionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobDescriptionId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "JobDescriptionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescriptionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobDescriptionId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "JobDescriptionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkInstruction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "department" TEXT NOT NULL,
    "content" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "WorkInstruction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkInstructionCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkInstructionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkInstructionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workInstructionId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "WorkInstructionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkInstructionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workInstructionId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "WorkInstructionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COSHHCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "COSHHCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COSHH" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "department" TEXT NOT NULL,
    "content" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "COSHH_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COSHHVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "coshhId" TEXT NOT NULL,
    "documentId" TEXT,

    CONSTRAINT "COSHHVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COSHHReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" TEXT NOT NULL,
    "coshhId" TEXT NOT NULL,

    CONSTRAINT "COSHHReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "COSHHCategory_createdById_idx" ON "COSHHCategory"("createdById");

-- CreateIndex
CREATE INDEX "COSHHCategory_updatedById_idx" ON "COSHHCategory"("updatedById");

-- CreateIndex
CREATE INDEX "COSHH_categoryId_idx" ON "COSHH"("categoryId");

-- CreateIndex
CREATE INDEX "COSHH_createdById_idx" ON "COSHH"("createdById");

-- CreateIndex
CREATE INDEX "COSHH_updatedById_idx" ON "COSHH"("updatedById");

-- CreateIndex
CREATE INDEX "COSHHVersion_coshhId_idx" ON "COSHHVersion"("coshhId");

-- CreateIndex
CREATE INDEX "COSHHVersion_createdById_idx" ON "COSHHVersion"("createdById");

-- CreateIndex
CREATE INDEX "COSHHVersion_documentId_idx" ON "COSHHVersion"("documentId");

-- CreateIndex
CREATE INDEX "COSHHReview_coshhId_idx" ON "COSHHReview"("coshhId");

-- CreateIndex
CREATE INDEX "COSHHReview_reviewedById_idx" ON "COSHHReview"("reviewedById");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_correctiveActionId_fkey" FOREIGN KEY ("correctiveActionId") REFERENCES "CorrectiveAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_businessContinuityId_fkey" FOREIGN KEY ("businessContinuityId") REFERENCES "BusinessContinuity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_managementReviewId_fkey" FOREIGN KEY ("managementReviewId") REFERENCES "ManagementReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workInstructionId_fkey" FOREIGN KEY ("workInstructionId") REFERENCES "WorkInstruction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_coshhId_fkey" FOREIGN KEY ("coshhId") REFERENCES "COSHH"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualReview" ADD CONSTRAINT "ManualReview_manualId_fkey" FOREIGN KEY ("manualId") REFERENCES "Manual"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManualReview" ADD CONSTRAINT "ManualReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureReview" ADD CONSTRAINT "ProcedureReview_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcedureReview" ADD CONSTRAINT "ProcedureReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormReview" ADD CONSTRAINT "FormReview_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormReview" ADD CONSTRAINT "FormReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CorrectiveActionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveActionVersion" ADD CONSTRAINT "CorrectiveActionVersion_correctiveActionId_fkey" FOREIGN KEY ("correctiveActionId") REFERENCES "CorrectiveAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveActionVersion" ADD CONSTRAINT "CorrectiveActionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveActionVersion" ADD CONSTRAINT "CorrectiveActionVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveActionReview" ADD CONSTRAINT "CorrectiveActionReview_correctiveActionId_fkey" FOREIGN KEY ("correctiveActionId") REFERENCES "CorrectiveAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveActionReview" ADD CONSTRAINT "CorrectiveActionReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuity" ADD CONSTRAINT "BusinessContinuity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BusinessContinuityCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuity" ADD CONSTRAINT "BusinessContinuity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuity" ADD CONSTRAINT "BusinessContinuity_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuityVersion" ADD CONSTRAINT "BusinessContinuityVersion_businessContinuityId_fkey" FOREIGN KEY ("businessContinuityId") REFERENCES "BusinessContinuity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuityVersion" ADD CONSTRAINT "BusinessContinuityVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuityVersion" ADD CONSTRAINT "BusinessContinuityVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuityReview" ADD CONSTRAINT "BusinessContinuityReview_businessContinuityId_fkey" FOREIGN KEY ("businessContinuityId") REFERENCES "BusinessContinuity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessContinuityReview" ADD CONSTRAINT "BusinessContinuityReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReview" ADD CONSTRAINT "ManagementReview_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ManagementReviewCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReview" ADD CONSTRAINT "ManagementReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReview" ADD CONSTRAINT "ManagementReview_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReviewVersion" ADD CONSTRAINT "ManagementReviewVersion_managementReviewId_fkey" FOREIGN KEY ("managementReviewId") REFERENCES "ManagementReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReviewVersion" ADD CONSTRAINT "ManagementReviewVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReviewVersion" ADD CONSTRAINT "ManagementReviewVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReviewReview" ADD CONSTRAINT "ManagementReviewReview_managementReviewId_fkey" FOREIGN KEY ("managementReviewId") REFERENCES "ManagementReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementReviewReview" ADD CONSTRAINT "ManagementReviewReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "JobDescriptionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionVersion" ADD CONSTRAINT "JobDescriptionVersion_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionVersion" ADD CONSTRAINT "JobDescriptionVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionVersion" ADD CONSTRAINT "JobDescriptionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionReview" ADD CONSTRAINT "JobDescriptionReview_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescriptionReview" ADD CONSTRAINT "JobDescriptionReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstruction" ADD CONSTRAINT "WorkInstruction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WorkInstructionCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstruction" ADD CONSTRAINT "WorkInstruction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstruction" ADD CONSTRAINT "WorkInstruction_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstructionVersion" ADD CONSTRAINT "WorkInstructionVersion_workInstructionId_fkey" FOREIGN KEY ("workInstructionId") REFERENCES "WorkInstruction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstructionVersion" ADD CONSTRAINT "WorkInstructionVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstructionVersion" ADD CONSTRAINT "WorkInstructionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstructionReview" ADD CONSTRAINT "WorkInstructionReview_workInstructionId_fkey" FOREIGN KEY ("workInstructionId") REFERENCES "WorkInstruction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkInstructionReview" ADD CONSTRAINT "WorkInstructionReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHCategory" ADD CONSTRAINT "COSHHCategory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHCategory" ADD CONSTRAINT "COSHHCategory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHH" ADD CONSTRAINT "COSHH_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHH" ADD CONSTRAINT "COSHH_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHH" ADD CONSTRAINT "COSHH_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "COSHHCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHVersion" ADD CONSTRAINT "COSHHVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHVersion" ADD CONSTRAINT "COSHHVersion_coshhId_fkey" FOREIGN KEY ("coshhId") REFERENCES "COSHH"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHVersion" ADD CONSTRAINT "COSHHVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHReview" ADD CONSTRAINT "COSHHReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COSHHReview" ADD CONSTRAINT "COSHHReview_coshhId_fkey" FOREIGN KEY ("coshhId") REFERENCES "COSHH"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
