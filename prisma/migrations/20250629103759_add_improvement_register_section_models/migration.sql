-- CreateTable
CREATE TABLE "ImprovementRegisterSectionVersion" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "amendmentDetails" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImprovementRegisterSectionVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovementRegisterSectionReview" (
    "id" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewDetails" TEXT,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "nextReviewDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImprovementRegisterSectionReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ImprovementRegisterSectionVersion" ADD CONSTRAINT "ImprovementRegisterSectionVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementRegisterSectionReview" ADD CONSTRAINT "ImprovementRegisterSectionReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
