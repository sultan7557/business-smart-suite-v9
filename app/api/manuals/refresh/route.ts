import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async () => {
  try {
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
    // Use a Map to ensure no duplicate categories
    const archivedCategoriesMap = new Map()
    
    // Add fully archived categories
    archivedCategories.forEach(category => {
      archivedCategoriesMap.set(category.id, category)
    })
    
    // Add active categories that have archived manuals
    categoriesWithArchivedManuals.forEach(category => {
      if (!archivedCategoriesMap.has(category.id)) {
        archivedCategoriesMap.set(category.id, category)
      }
    })
    
    const allArchivedCategories = Array.from(archivedCategoriesMap.values())

    return NextResponse.json({
      categories,
      archivedCategories: allArchivedCategories,
    })
  } catch (error) {
    console.error("Error refreshing manual data:", error)
    return NextResponse.json({ error: "Failed to refresh manual data" }, { status: 500 })
  }
})
