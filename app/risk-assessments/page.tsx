import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import RiskAssessmentClient from "@/components/risk-assessments-client"

export default async function RiskAssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write");
  const canDelete = await hasPermission("delete");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch active or archived risk assessment categories based on showArchived flag
  const categories = await prisma.riskAssessmentCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      riskAssessments: {
        where: {
          archived: showArchived,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: sortParam === "name" 
      ? { title: "asc" } 
      : sortParam === "date" 
      ? { updatedAt: "desc" } 
      : { order: "asc" },
  });
  
  // If showing archived, also get archived risk assessments from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.riskAssessmentCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        riskAssessments: {
          where: {
            archived: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
    
    // Filter out categories with no archived risk assessments
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.riskAssessments.length > 0
    );
    
    // Combine all categories with archived risk assessments
    categories.push(...archivedInActiveCategories);
  }

  return (
    <RiskAssessmentClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
