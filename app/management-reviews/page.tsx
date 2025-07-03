import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import ManagementReviewClient from "@/components/management-reviews-client"

export default async function ManagementReviewPage({
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
  
  // Fetch active or archived management review categories based on showArchived flag
  const categories = await prisma.managementReviewCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      managementReviews: {
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
  
  // If showing archived, also get archived management reviews from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.managementReviewCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        managementReviews: {
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
    
    // Filter out categories with no archived management reviews
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.managementReviews.length > 0
    );
    
    // Combine all categories with archived management reviews
    categories.push(...archivedInActiveCategories);
  }

  return (
    <ManagementReviewClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
