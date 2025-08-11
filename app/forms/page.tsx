import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import FormsClient from "@/components/forms-client"

export const metadata = {
  title: "Forms | Business Smart Suite Portal",
  description: "Manage organization forms",
}


export default function FormsPageWrapper(props: any) {
  return (
    <Suspense fallback={<Loader overlay message="Loading forms..." />}>
      <FormsPage {...props} />
    </Suspense>
  )
}

async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string; sort?: string }>
}) {
  const canEdit = await hasPermission("write", "forms");
  const canDelete = await hasPermission("delete", "forms");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch active or archived form categories based on showArchived flag

  const categories = await prisma.formCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      forms: {
        where: {
          archived: showArchived,
        },
        orderBy: sortParam === "name" 
          ? { title: "asc" } 
          : sortParam === "date" 
          ? { issueDate: "desc" } // Changed from updatedAt to issueDate for better form date representation
          : { order: "asc" },
      },
    },
    // Always sort categories by order, regardless of form sort
    orderBy: { order: "asc" },
  });
  
  
  // If showing archived, also get archived forms from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.formCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        forms: {
          where: {
            archived: true,
          },
          orderBy: sortParam === "name" 
            ? { title: "asc" } 
            : sortParam === "date" 
            ? { issueDate: "desc" }
            : { order: "asc" },
        },
      },
      // Always sort categories by order
      orderBy: { order: "asc" },
    });
    
    // Filter out categories with no archived forms
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.forms.length > 0
    );
    
    // Combine all categories with archived forms
    categories.push(...archivedInActiveCategories);
  }

  return (
    <FormsClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}