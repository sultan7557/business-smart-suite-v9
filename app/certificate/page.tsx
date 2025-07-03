import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import CertificatesClient from "@/components/certificates-client"

export default async function CertificatesPage({
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
  
  // Fetch active or archived certificate categories based on showArchived flag
  const categories = await prisma.certificateCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      certificates: {
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
  
  // If showing archived, also get archived certificates from active categories
  let archivedInActiveCategories = [];
  if (showArchived) {
    const activeCategories = await prisma.certificateCategory.findMany({
      where: {
        archived: false,
      },
      include: {
        certificates: {
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
    
    // Filter out categories with no archived certificates
    archivedInActiveCategories = activeCategories.filter(
      (category) => category.certificates.length > 0
    );
    
    // Combine all categories with archived certificates
    categories.push(...archivedInActiveCategories);
  }

  return (
    <CertificatesClient 
      categories={categories}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      currentSort={sortParam}
    />
  );
}