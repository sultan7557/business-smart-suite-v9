import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import BusinessContinuityClient from "@/components/business-continuity-client"

export default async function BusinessContinuityPage({
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
  
  // Fetch active or archived business continuity categories based on showArchived flag
  const categories = await prisma.businessContinuityCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      businessContinuities: {
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
  
  // If showing archived, also get archived business continuities from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.businessContinuityCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        businessContinuities: {
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
    
    // Filter out categories with no archived business continuities
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.businessContinuities.length > 0
    );
    
    // Combine all categories with archived business continuities
    categories.push(...archivedInActiveCategories);
  }

  return (
    <BusinessContinuityClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
