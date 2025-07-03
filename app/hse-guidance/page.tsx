import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import HseGuidanceClient from "@/components/hse-guidance-client"

export default async function HseGuidancePage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write");
  const canDelete = await hasPermission("delete");
  
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  const categories = await prisma.hseGuidanceCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      hseGuidances: {
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
  
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.hseGuidanceCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        hseGuidances: {
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
    
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.hseGuidances.length > 0
    );
    
    categories.push(...archivedInActiveCategories);
  }

  return (
    <HseGuidanceClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
