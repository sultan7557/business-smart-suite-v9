import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import ManualsClient from "@/components/manuals-client"

export default async function ManualsPage() {
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")

  // Fetch active manual categories with their manuals
  const categories = await prisma.manualCategory.findMany({
    where: {
      archived: false,
    },
    include: {
      manuals: {
        where: {
          archived: false,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  })

  // Fetch archived manual categories with their manuals
  const archivedCategories = await prisma.manualCategory.findMany({
    where: {
      archived: true,
    },
    include: {
      manuals: {
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
  })

  // Also get archived manuals from active categories
  const activeCategories = await prisma.manualCategory.findMany({
    where: {
      archived: false,
    },
    include: {
      manuals: {
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
  })

  // Filter out categories with no archived manuals
  const categoriesWithArchivedManuals = activeCategories.filter((category) => category.manuals.length > 0)

  // Combine archived categories with categories that have archived manuals
  const allArchivedCategories = [...archivedCategories, ...categoriesWithArchivedManuals]

  return (
    <ManualsClient
      categories={categories}
      archivedCategories={allArchivedCategories}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}
