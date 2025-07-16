import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")
    const cacheKey = `work-instructions:archived:${archived}:categoryId:${categoryId || 'all'}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

    const workInstructions = await prisma.workInstruction.findMany({
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
    const result = JSON.stringify(workInstructions)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching work instructions:", error)
    return NextResponse.json({ error: "Failed to fetch work instructions" }, { status: 500 })
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
    const highestOrderWorkInstruction = await prisma.workInstruction.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderWorkInstruction ? highestOrderWorkInstruction.order + 1 : 1

    const workInstruction = await prisma.workInstruction.create({
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

    return NextResponse.json(workInstruction)
  } catch (error) {
    console.error("[WORK_INSTRUCTIONS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Work instruction IDs are required" }, { status: 400 })
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

    const updatedWorkInstructions = await prisma.workInstruction.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedWorkInstructions.count} work instruction(s)`,
      count: updatedWorkInstructions.count,
    })
  } catch (error) {
    console.error("Error bulk updating work instructions:", error)
    return NextResponse.json({ error: "Failed to update work instructions" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Work instruction IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedWorkInstructions = await prisma.workInstruction.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedWorkInstructions.count} work instruction(s) permanently`,
        count: deletedWorkInstructions.count,
      })
    } else {
      // Soft delete - archive the work instructions
      const archivedWorkInstructions = await prisma.workInstruction.updateMany({
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
        message: `Successfully archived ${archivedWorkInstructions.count} work instruction(s)`,
        count: archivedWorkInstructions.count,
      })
    }
  } catch (error) {
    console.error("Error deleting work instructions:", error)
    return NextResponse.json({ error: "Failed to delete work instructions" }, { status: 500 })
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

        // Reset order numbers for work instructions in a category
        const workInstructions = await prisma.workInstruction.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = workInstructions.map((wi, index) =>
          prisma.workInstruction.update({
            where: { id: wi.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${workInstructions.length} work instructions in category`,
          count: workInstructions.length,
        })

      case "move-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both category ID and new category ID are required for moving" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderWorkInstruction = await prisma.workInstruction.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const newOrder = highestOrderWorkInstruction ? highestOrderWorkInstruction.order + 1 : 1

        // Move work instructions to the new category
        const movedWorkInstructions = await prisma.workInstruction.updateMany({
          where: { categoryId },
          data: {
            categoryId: newCategoryId,
            order: newOrder,
          },
        })

        return NextResponse.json({
          message: `Successfully moved ${movedWorkInstructions.count} work instructions to new category`,
          count: movedWorkInstructions.count,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing work instruction action:", error)
    return NextResponse.json({ error: "Failed to perform work instruction action" }, { status: 500 })
  }
}, "write")
