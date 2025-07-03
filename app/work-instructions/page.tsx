import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import WorkInstructionClient from "@/components/work-instructions-client"

export default async function WorkInstructionPage({
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
  
  // Fetch active or archived work instruction categories based on showArchived flag
  const categories = await prisma.workInstructionCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      workInstructions: {
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
  
  // If showing archived, also get archived work instructions from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.workInstructionCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        workInstructions: {
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
    
    // Filter out categories with no archived work instructions
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.workInstructions.length > 0
    );
    
    // Combine all categories with archived work instructions
    categories.push(...archivedInActiveCategories);
  }

  return (
    <WorkInstructionClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
