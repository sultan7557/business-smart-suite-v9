import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import EnvironmentalGuidanceClient from "@/components/environmental-guidance-client"

export default function EnvironmentalGuidancePageWrapper(props: any) {
  return (
    <Suspense fallback={<Loader overlay message="Loading environmental guidance..." />}>
      <EnvironmentalGuidancePage {...props} />
    </Suspense>
  )
}

async function EnvironmentalGuidancePage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write", "environmental-guidance");
  const canDelete = await hasPermission("delete", "environmental-guidance");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch active or archived environmental guidance categories based on showArchived flag
  const categories = await prisma.environmentalGuidanceCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      environmentalGuidance: {
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
  
  // If showing archived, also get archived environmental guidance from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.environmentalGuidanceCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        environmentalGuidance: {
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
    
    // Filter out categories with no archived environmental guidance
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.environmentalGuidance.length > 0
    );
    
    // Combine all categories with archived environmental guidance
    categories.push(...archivedInActiveCategories);
  }

  // Map 'environmentalGuidance' to 'environmentalGuidances' for client compatibility
  const mappedCategories = categories.map((category) => ({
    ...category,
    highlighted: (category as any).highlighted ?? false,
    environmentalGuidances: (category.environmentalGuidance || []).map((eg: any) => ({
      ...eg,
      reviewDate: eg.reviewDate instanceof Date ? eg.reviewDate.toISOString() : eg.reviewDate,
      nextReviewDate: eg.nextReviewDate instanceof Date && eg.nextReviewDate !== null ? eg.nextReviewDate.toISOString() : eg.nextReviewDate,
    })),
  }))

  return (
    <EnvironmentalGuidanceClient 
      categories={mappedCategories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
} 