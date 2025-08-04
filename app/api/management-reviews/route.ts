import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")

    const managementReviews = await prisma.managementReview.findMany({
      where: {
        archived,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          category: {
            order: "asc",
          },
        },
        { order: "asc" },
        { title: "asc" },
      ],
    })

    return NextResponse.json(managementReviews, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("Error fetching management reviews:", error)
    return NextResponse.json({ error: "Failed to fetch management reviews" }, { status: 500 })
  }
})

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const nextReviewDate = formData.get("nextReviewDate") as string
    const location = formData.get("location") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !location) {
      return new NextResponse("All fields are required", { status: 400 })
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderManagementReview = await prisma.managementReview.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderManagementReview ? highestOrderManagementReview.order + 1 : 1

    const managementReview = await prisma.managementReview.create({
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        location,
        content: content || "",
        highlighted,
        approved,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    return NextResponse.json(managementReview, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("[MANAGEMENT_REVIEWS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Management review IDs are required" }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case "archive":
        updateData = { archived: true }
        break
      case "unarchive":
        updateData = { archived: false }
        break
      case "approve":
        updateData = { approved: true, updatedById: user.id }
        break
      case "unapprove":
        updateData = { approved: false, updatedById: user.id }
        break
      case "highlight":
        updateData = { highlighted: true }
        break
      case "unhighlight":
        updateData = { highlighted: false }
        break
      case "update":
        if (!data) {
          return NextResponse.json({ error: "Update data is required" }, { status: 400 })
        }
        updateData = { ...data, updatedById: user.id }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedManagementReviews = await prisma.managementReview.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedManagementReviews.count} management review(s, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })`,
      count: updatedManagementReviews.count,
    })
  } catch (error) {
    console.error("Error bulk updating management reviews:", error)
    return NextResponse.json({ error: "Failed to update management reviews" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Management review IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedManagementReviews = await prisma.managementReview.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedManagementReviews.count} management review(s, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      }) permanently`,
        count: deletedManagementReviews.count,
      })
    } else {
      // Soft delete - archive the management reviews
      const archivedManagementReviews = await prisma.managementReview.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          archived: true,
        },
      })

      return NextResponse.json({
        message: `Successfully archived ${archivedManagementReviews.count} management review(s, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })`,
        count: archivedManagementReviews.count,
      })
    }
  } catch (error) {
    console.error("Error deleting management reviews:", error)
    return NextResponse.json({ error: "Failed to delete management reviews" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, categoryId, newCategoryId } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    switch (action) {
      case "reorder-category":
        if (!categoryId) {
          return NextResponse.json({ error: "Category ID is required for reordering" }, { status: 400 })
        }

        // Reset order numbers for management reviews in a category
        const managementReviews = await prisma.managementReview.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = managementReviews.map((mr, index) =>
          prisma.managementReview.update({
            where: { id: mr.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${managementReviews.length} management reviews in category`,
          count: managementReviews.length,
        })

      case "move-to-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both current and new category IDs are required" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderInNewCategory = await prisma.managementReview.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const startingOrder = highestOrderInNewCategory ? highestOrderInNewCategory.order + 1 : 1

        // Update all management reviews in the current category
        const managementReviewsToMove = await prisma.managementReview.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const movePromises = managementReviewsToMove.map((mr, index) =>
          prisma.managementReview.update({
            where: { id: mr.id },
            data: {
              categoryId: newCategoryId,
              order: startingOrder + index,
            },
          })
        )

        await Promise.all(movePromises)

        return NextResponse.json({
          message: `Successfully moved ${managementReviewsToMove.length} management reviews to new category`,
          count: managementReviewsToMove.length,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing management review action:", error)
    return NextResponse.json({ error: "Failed to perform management review action" }, { status: 500 })
  }
}, "write")
