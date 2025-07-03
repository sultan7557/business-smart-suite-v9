import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import COSHHClient from "@/components/coshh-client"

export default async function COSHHPage({
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
  
  // Fetch active or archived COSHH categories based on showArchived flag
  const categories = await prisma.cOSHHCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      coshhs: {
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
  
  // If showing archived, also get archived COSHHs from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.cOSHHCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        coshhs: {
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
    
    // Filter out categories with no archived COSHHs
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.coshhs.length > 0
    );
    
    // Combine all categories with archived COSHHs
    categories.push(...archivedInActiveCategories);
  }

  return (
    <COSHHClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
