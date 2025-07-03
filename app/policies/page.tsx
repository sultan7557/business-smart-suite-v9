import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import PoliciesClient from "@/components/policies-client"
import { Prisma } from "@prisma/client"


export default async function PoliciesPage({
  searchParams,
}: {
  searchParams?: { showArchived?: string; sort?: string }
}) {
  const canEdit = await hasPermission("write");
  const canDelete = await hasPermission("delete");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch policy categories with their policies
  const categories = await prisma.policyCategory.findMany({
    where: {
      archived: showArchived,
    },
    include: {
      policies: {
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
  })

  return <PoliciesClient 
    categories={categories} 
    canEdit={canEdit} 
    canDelete={canDelete} 
    showArchived={showArchived} 
    currentSort={sortParam}
  />
}