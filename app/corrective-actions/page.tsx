import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import CorrectiveActionsClient from "@/components/corrective-actions-client"

export default async function CorrectiveActionsPage({
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
  
  // Fetch active or archived corrective action categories based on showArchived flag
  const categories = await prisma.correctiveActionCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      correctiveActions: {
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
  
  // If showing archived, also get archived corrective actions from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.correctiveActionCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        correctiveActions: {
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
    
    // Filter out categories with no archived corrective actions
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.correctiveActions.length > 0
    );
    
    // Combine all categories with archived corrective actions
    categories.push(...archivedInActiveCategories);
  }

  return (
    <CorrectiveActionsClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}