-- AlterTable
ALTER TABLE "COSHHCategory" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "acceptedBy" TEXT;

-- AlterTable
ALTER TABLE "JobDescriptionCategory" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TechnicalFileCategory" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WorkInstructionCategory" ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "InterestedPartyVersion" (
    "id" TEXT NOT NULL,
    "interestedPartyId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "needsExpectations" TEXT,
    "initialLikelihood" INTEGER NOT NULL,
    "initialSeverity" INTEGER NOT NULL,
    "controlsRecommendations" TEXT,
    "residualLikelihood" INTEGER NOT NULL,
    "residualSeverity" INTEGER NOT NULL,
    "riskLevel" INTEGER NOT NULL,
    "residualRiskLevel" INTEGER NOT NULL,
    "amendmentDetails" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterestedPartyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterestedPartyReview" (
    "id" TEXT NOT NULL,
    "interestedPartyId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDetails" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterestedPartyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalContextVersion" (
    "id" TEXT NOT NULL,
    "organizationalContextId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "initialLikelihood" INTEGER NOT NULL,
    "initialSeverity" INTEGER NOT NULL,
    "initialRiskLevel" INTEGER NOT NULL,
    "controlsRecommendations" TEXT NOT NULL,
    "residualLikelihood" INTEGER NOT NULL,
    "residualSeverity" INTEGER NOT NULL,
    "residualRiskLevel" INTEGER NOT NULL,
    "objectives" TEXT[],
    "amendmentDetails" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationalContextVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalContextReview" (
    "id" TEXT NOT NULL,
    "organizationalContextId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDetails" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationalContextReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectiveSectionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "amendmentDetails" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectiveSectionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectiveSectionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDetails" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObjectiveSectionReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSectionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "amendmentDetails" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceSectionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceSectionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDetails" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceSectionReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterestedPartyVersion_interestedPartyId_idx" ON "InterestedPartyVersion"("interestedPartyId");

-- CreateIndex
CREATE INDEX "InterestedPartyReview_interestedPartyId_idx" ON "InterestedPartyReview"("interestedPartyId");

-- CreateIndex
CREATE INDEX "OrganizationalContextVersion_organizationalContextId_idx" ON "OrganizationalContextVersion"("organizationalContextId");

-- CreateIndex
CREATE INDEX "OrganizationalContextReview_organizationalContextId_idx" ON "OrganizationalContextReview"("organizationalContextId");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_acceptedBy_fkey" FOREIGN KEY ("acceptedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestedPartyVersion" ADD CONSTRAINT "InterestedPartyVersion_interestedPartyId_fkey" FOREIGN KEY ("interestedPartyId") REFERENCES "InterestedParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestedPartyVersion" ADD CONSTRAINT "InterestedPartyVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestedPartyReview" ADD CONSTRAINT "InterestedPartyReview_interestedPartyId_fkey" FOREIGN KEY ("interestedPartyId") REFERENCES "InterestedParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterestedPartyReview" ADD CONSTRAINT "InterestedPartyReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalContextVersion" ADD CONSTRAINT "OrganizationalContextVersion_organizationalContextId_fkey" FOREIGN KEY ("organizationalContextId") REFERENCES "OrganizationalContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalContextVersion" ADD CONSTRAINT "OrganizationalContextVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalContextReview" ADD CONSTRAINT "OrganizationalContextReview_organizationalContextId_fkey" FOREIGN KEY ("organizationalContextId") REFERENCES "OrganizationalContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalContextReview" ADD CONSTRAINT "OrganizationalContextReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveSectionVersion" ADD CONSTRAINT "ObjectiveSectionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveSectionReview" ADD CONSTRAINT "ObjectiveSectionReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSectionVersion" ADD CONSTRAINT "MaintenanceSectionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceSectionReview" ADD CONSTRAINT "MaintenanceSectionReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
