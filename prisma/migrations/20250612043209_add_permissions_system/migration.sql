/*
  Warnings:

  - You are about to drop the column `createdById` on the `COSHHCategory` table. All the data in the column will be lost.
  - You are about to drop the column `highlighted` on the `COSHHCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `COSHHCategory` table. All the data in the column will be lost.
  - You are about to drop the column `issueDate` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `RiskAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `riskLevel` on the `RiskAssessment` table. All the data in the column will be lost.
  - Added the required column `department` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewDate` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `RiskAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "COSHHCategory" DROP CONSTRAINT "COSHHCategory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "COSHHCategory" DROP CONSTRAINT "COSHHCategory_updatedById_fkey";

-- DropIndex
DROP INDEX "COSHH_categoryId_idx";

-- DropIndex
DROP INDEX "COSHH_createdById_idx";

-- DropIndex
DROP INDEX "COSHH_updatedById_idx";

-- DropIndex
DROP INDEX "COSHHCategory_createdById_idx";

-- DropIndex
DROP INDEX "COSHHCategory_updatedById_idx";

-- DropIndex
DROP INDEX "COSHHReview_coshhId_idx";

-- DropIndex
DROP INDEX "COSHHReview_reviewedById_idx";

-- DropIndex
DROP INDEX "COSHHVersion_coshhId_idx";

-- DropIndex
DROP INDEX "COSHHVersion_createdById_idx";

-- DropIndex
DROP INDEX "COSHHVersion_documentId_idx";

-- AlterTable
ALTER TABLE "COSHHCategory" DROP COLUMN "createdById",
DROP COLUMN "highlighted",
DROP COLUMN "updatedById",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "customSectionId" TEXT,
ADD COLUMN     "environmentalGuidanceId" TEXT,
ADD COLUMN     "hseGuidanceId" TEXT,
ADD COLUMN     "registerId" TEXT,
ADD COLUMN     "riskAssessmentId" TEXT,
ADD COLUMN     "technicalFileId" TEXT;

-- AlterTable
ALTER TABLE "RiskAssessment" DROP COLUMN "issueDate",
DROP COLUMN "owner",
DROP COLUMN "riskLevel",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "department" TEXT NOT NULL,
ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextReviewDate" TIMESTAMP(3),
ADD COLUMN     "reviewDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" TEXT NOT NULL,
ALTER COLUMN "order" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "UserGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPermission" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "expiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "GroupPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "roleId" TEXT,
    "invitedBy" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionAudit" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermissionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessmentCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskAssessmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessmentVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskAssessmentId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RiskAssessmentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessmentReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "riskAssessmentId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "RiskAssessmentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Register" (
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

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegisterCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registerId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RegisterVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegisterReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registerId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "RegisterReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HseGuidanceCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HseGuidanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HseGuidance" (
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

    CONSTRAINT "HseGuidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HseGuidanceVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hseGuidanceId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "HseGuidanceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HseGuidanceReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hseGuidanceId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "HseGuidanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalFileCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechnicalFileCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalFile" (
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

    CONSTRAINT "TechnicalFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalFileVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicalFileId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TechnicalFileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalFileReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicalFileId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "TechnicalFileReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalGuidanceCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnvironmentalGuidanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalGuidance" (
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

    CONSTRAINT "EnvironmentalGuidance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalGuidanceVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environmentalGuidanceId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "EnvironmentalGuidanceVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalGuidanceReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environmentalGuidanceId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "EnvironmentalGuidanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSectionCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSectionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "department" TEXT,
    "content" TEXT,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restrictedAccess" BOOLEAN NOT NULL DEFAULT false,
    "restrictedUsers" TEXT[],
    "metadata" JSONB,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "CustomSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSectionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customSectionId" TEXT NOT NULL,
    "documentId" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "CustomSectionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSectionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customSectionId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,

    CONSTRAINT "CustomSectionReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Permission_userId_idx" ON "Permission"("userId");

-- CreateIndex
CREATE INDEX "Permission_systemId_idx" ON "Permission"("systemId");

-- CreateIndex
CREATE INDEX "Permission_expiry_idx" ON "Permission"("expiry");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_systemId_roleId_key" ON "Permission"("userId", "systemId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE INDEX "Group_name_idx" ON "Group"("name");

-- CreateIndex
CREATE INDEX "UserGroup_userId_idx" ON "UserGroup"("userId");

-- CreateIndex
CREATE INDEX "UserGroup_groupId_idx" ON "UserGroup"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_userId_groupId_key" ON "UserGroup"("userId", "groupId");

-- CreateIndex
CREATE INDEX "GroupPermission_groupId_idx" ON "GroupPermission"("groupId");

-- CreateIndex
CREATE INDEX "GroupPermission_systemId_idx" ON "GroupPermission"("systemId");

-- CreateIndex
CREATE INDEX "GroupPermission_expiry_idx" ON "GroupPermission"("expiry");

-- CreateIndex
CREATE UNIQUE INDEX "GroupPermission_groupId_systemId_roleId_key" ON "GroupPermission"("groupId", "systemId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_email_idx" ON "Invite"("email");

-- CreateIndex
CREATE INDEX "Invite_token_idx" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_status_idx" ON "Invite"("status");

-- CreateIndex
CREATE INDEX "Invite_expiresAt_idx" ON "Invite"("expiresAt");

-- CreateIndex
CREATE INDEX "PermissionAudit_userId_idx" ON "PermissionAudit"("userId");

-- CreateIndex
CREATE INDEX "PermissionAudit_performedBy_idx" ON "PermissionAudit"("performedBy");

-- CreateIndex
CREATE INDEX "PermissionAudit_createdAt_idx" ON "PermissionAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroup" ADD CONSTRAINT "UserGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupPermission" ADD CONSTRAINT "GroupPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_hseGuidanceId_fkey" FOREIGN KEY ("hseGuidanceId") REFERENCES "HseGuidance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_technicalFileId_fkey" FOREIGN KEY ("technicalFileId") REFERENCES "TechnicalFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_environmentalGuidanceId_fkey" FOREIGN KEY ("environmentalGuidanceId") REFERENCES "EnvironmentalGuidance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customSectionId_fkey" FOREIGN KEY ("customSectionId") REFERENCES "CustomSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RiskAssessmentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessmentVersion" ADD CONSTRAINT "RiskAssessmentVersion_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessmentVersion" ADD CONSTRAINT "RiskAssessmentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessmentVersion" ADD CONSTRAINT "RiskAssessmentVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessmentReview" ADD CONSTRAINT "RiskAssessmentReview_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "RiskAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessmentReview" ADD CONSTRAINT "RiskAssessmentReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "RegisterCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterVersion" ADD CONSTRAINT "RegisterVersion_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterVersion" ADD CONSTRAINT "RegisterVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterVersion" ADD CONSTRAINT "RegisterVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterReview" ADD CONSTRAINT "RegisterReview_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegisterReview" ADD CONSTRAINT "RegisterReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidance" ADD CONSTRAINT "HseGuidance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "HseGuidanceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidance" ADD CONSTRAINT "HseGuidance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidance" ADD CONSTRAINT "HseGuidance_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidanceVersion" ADD CONSTRAINT "HseGuidanceVersion_hseGuidanceId_fkey" FOREIGN KEY ("hseGuidanceId") REFERENCES "HseGuidance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidanceVersion" ADD CONSTRAINT "HseGuidanceVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidanceVersion" ADD CONSTRAINT "HseGuidanceVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidanceReview" ADD CONSTRAINT "HseGuidanceReview_hseGuidanceId_fkey" FOREIGN KEY ("hseGuidanceId") REFERENCES "HseGuidance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HseGuidanceReview" ADD CONSTRAINT "HseGuidanceReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFile" ADD CONSTRAINT "TechnicalFile_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TechnicalFileCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFile" ADD CONSTRAINT "TechnicalFile_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFile" ADD CONSTRAINT "TechnicalFile_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFileVersion" ADD CONSTRAINT "TechnicalFileVersion_technicalFileId_fkey" FOREIGN KEY ("technicalFileId") REFERENCES "TechnicalFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFileVersion" ADD CONSTRAINT "TechnicalFileVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFileVersion" ADD CONSTRAINT "TechnicalFileVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFileReview" ADD CONSTRAINT "TechnicalFileReview_technicalFileId_fkey" FOREIGN KEY ("technicalFileId") REFERENCES "TechnicalFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalFileReview" ADD CONSTRAINT "TechnicalFileReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidance" ADD CONSTRAINT "EnvironmentalGuidance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EnvironmentalGuidanceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidance" ADD CONSTRAINT "EnvironmentalGuidance_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidance" ADD CONSTRAINT "EnvironmentalGuidance_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidanceVersion" ADD CONSTRAINT "EnvironmentalGuidanceVersion_environmentalGuidanceId_fkey" FOREIGN KEY ("environmentalGuidanceId") REFERENCES "EnvironmentalGuidance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidanceVersion" ADD CONSTRAINT "EnvironmentalGuidanceVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidanceVersion" ADD CONSTRAINT "EnvironmentalGuidanceVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidanceReview" ADD CONSTRAINT "EnvironmentalGuidanceReview_environmentalGuidanceId_fkey" FOREIGN KEY ("environmentalGuidanceId") REFERENCES "EnvironmentalGuidance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalGuidanceReview" ADD CONSTRAINT "EnvironmentalGuidanceReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSection" ADD CONSTRAINT "CustomSection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CustomSectionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSection" ADD CONSTRAINT "CustomSection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSection" ADD CONSTRAINT "CustomSection_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionVersion" ADD CONSTRAINT "CustomSectionVersion_customSectionId_fkey" FOREIGN KEY ("customSectionId") REFERENCES "CustomSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionVersion" ADD CONSTRAINT "CustomSectionVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionVersion" ADD CONSTRAINT "CustomSectionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionReview" ADD CONSTRAINT "CustomSectionReview_customSectionId_fkey" FOREIGN KEY ("customSectionId") REFERENCES "CustomSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionReview" ADD CONSTRAINT "CustomSectionReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
