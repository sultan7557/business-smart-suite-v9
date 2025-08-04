import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")
    const cacheKey = `environmental-guidance:archived:${archived}:categoryId:${categoryId || 'all'}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

    const environmentalGuidance = await prisma.environmentalGuidance.findMany({
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
    const result = JSON.stringify(environmentalGuidance)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to fetch Environmental Guidance" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { title, version, reviewDate, department, content, categoryId, highlighted, approved } = body

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderEnvironmentalGuidance = await prisma.environmentalGuidance.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderEnvironmentalGuidance ? highestOrderEnvironmentalGuidance.order + 1 : 1

    const environmentalGuidance = await prisma.environmentalGuidance.create({
      data: {
        title,
        version,
        reviewDate: new Date(reviewDate),
        department,
        content,
        categoryId,
        createdById: user.id,
        highlighted: highlighted || false,
        approved: approved || false,
        order: newOrder,
      },
    })

    return NextResponse.json(environmentalGuidance, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("Error creating Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to create Environmental Guidance" }, { status: 500 })
  }
}, "write")

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Environmental Guidance IDs are required" }, { status: 400 })
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

    const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedEnvironmentalGuidance.count} Environmental Guidance(s)`,
      count: updatedEnvironmentalGuidance.count,
    })
  } catch (error) {
    console.error("Error bulk updating Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to update Environmental Guidance" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Environmental Guidance IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedEnvironmentalGuidance = await prisma.environmentalGuidance.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedEnvironmentalGuidance.count} Environmental Guidance(s) permanently`,
        count: deletedEnvironmentalGuidance.count,
      })
    } else {
      // Soft delete - archive the Environmental Guidance
      const archivedEnvironmentalGuidance = await prisma.environmentalGuidance.updateMany({
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
        message: `Successfully archived ${archivedEnvironmentalGuidance.count} Environmental Guidance(s)`,
        count: archivedEnvironmentalGuidance.count,
      })
    }
  } catch (error) {
    console.error("Error deleting Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to delete Environmental Guidance" }, { status: 500 })
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

        // Reset order numbers for Environmental Guidance in a category
        const environmentalGuidance = await prisma.environmentalGuidance.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = environmentalGuidance.map((environmentalGuidance, index) =>
          prisma.environmentalGuidance.update({
            where: { id: environmentalGuidance.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${environmentalGuidance.length} Environmental Guidance in category`,
          count: environmentalGuidance.length,
        })

      case "move-to-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both current and new category IDs are required" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderInNewCategory = await prisma.environmentalGuidance.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const startingOrder = highestOrderInNewCategory ? highestOrderInNewCategory.order + 1 : 1

        // Get Environmental Guidance to move
        const environmentalGuidanceToMove = await prisma.environmentalGuidance.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        // Move Environmental Guidance to new category with new order
        const movePromises = environmentalGuidanceToMove.map((environmentalGuidance, index) =>
          prisma.environmentalGuidance.update({
            where: { id: environmentalGuidance.id },
            data: {
              categoryId: newCategoryId,
              order: startingOrder + index,
            },
          })
        )

        await Promise.all(movePromises)

        return NextResponse.json({
          message: `Successfully moved ${environmentalGuidanceToMove.length} Environmental Guidance to new category`,
          count: environmentalGuidanceToMove.length,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing Environmental Guidance operation:", error)
    return NextResponse.json({ error: "Failed to perform operation" }, { status: 500 })
  }
}, "write")