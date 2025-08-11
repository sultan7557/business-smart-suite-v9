import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import TechnicalFileClient from "@/components/technical-file-client"

export default function TechnicalFilePageWrapper(props: any) {
  return (
    <Suspense fallback={<Loader overlay message="Loading technical files..." />}>
      <TechnicalFilePage {...props} />
    </Suspense>
  )
}

async function TechnicalFilePage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write", "technical-files");
  const canDelete = await hasPermission("delete", "technical-files");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch active or archived technical file categories based on showArchived flag
  const categories = await prisma.technicalFileCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      technicalFiles: {
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
  
  // If showing archived, also get archived technical files from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.technicalFileCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        technicalFiles: {
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
    
    // Filter out categories with no archived technical files
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.technicalFiles.length > 0
    );
    
    // Combine all categories with archived technical files
    categories.push(...archivedInActiveCategories);
  }

  return (
    <TechnicalFileClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
} 