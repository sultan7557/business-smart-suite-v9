import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import PoliciesClient from "@/components/policies-client"
import { Prisma } from "@prisma/client"


export default function PoliciesPageWrapper(props: any) {
  return (
    <Suspense fallback={<Loader overlay message="Loading policies..." />}>
      <PoliciesPage {...props} />
    </Suspense>
  )
}

async function PoliciesPage({
  searchParams,
}: {
  searchParams?: { showArchived?: string; sort?: string }
}) {
  const canEdit = await hasPermission("write", "policies");
  const canDelete = await hasPermission("delete", "policies");
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams || {};
  const showArchived = resolvedSearchParams.showArchived === "true";
  const sortParam = resolvedSearchParams.sort;
  
  // Fetch policy categories with their policies
  const categories = await prisma.policyCategory.findMany({
    where: showArchived
      ? undefined // In archived view, include all categories so archived policies remain visible under their original categories
      : {
          archived: false,
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