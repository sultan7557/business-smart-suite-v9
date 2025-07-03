import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import ProceduresClient from "@/components/procedures-client"

export default async function ProceduresPage({
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
  
  // Fetch active or archived procedure categories based on showArchived flag
  const categories = await prisma.procedureCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      procedures: {
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
  
  // If showing archived, also get archived procedures from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.procedureCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        procedures: {
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
    
    // Filter out categories with no archived procedures
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.procedures.length > 0
    );
    
    // Combine all categories with archived procedures
    categories.push(...archivedInActiveCategories);
  }

  return (
    <ProceduresClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}