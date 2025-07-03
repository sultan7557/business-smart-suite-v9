import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import JobDescriptionClient from "@/components/job-descriptions-client"

export default async function JobDescriptionPage({
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
  
  // Fetch active or archived job description categories based on showArchived flag
  const categories = await prisma.jobDescriptionCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      jobDescriptions: {
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
  
  // If showing archived, also get archived job descriptions from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.jobDescriptionCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        jobDescriptions: {
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
    
    // Filter out categories with no archived job descriptions
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.jobDescriptions.length > 0
    );
    
    // Combine all categories with archived job descriptions
    categories.push(...archivedInActiveCategories);
  }

  return (
    <JobDescriptionClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}
