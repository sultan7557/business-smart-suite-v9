import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")

    const businessContinuities = await prisma.businessContinuity.findMany({
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

    return NextResponse.json(businessContinuities)
  } catch (error) {
    console.error("Error fetching business continuities:", error)
    return NextResponse.json({ error: "Failed to fetch business continuities" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = body

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderBusinessContinuity = await prisma.businessContinuity.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderBusinessContinuity ? highestOrderBusinessContinuity.order + 1 : 1

    const businessContinuity = await prisma.businessContinuity.create({
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        createdById: user.id,
        highlighted: highlighted || false,
        approved: approved || false,
        order: newOrder,
      },
    })

    return NextResponse.json(businessContinuity)
  } catch (error) {
    console.error("Error creating business continuity:", error)
    return NextResponse.json({ error: "Failed to create business continuity" }, { status: 500 })
  }
}, "write")

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Business continuity IDs are required" }, { status: 400 })
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

    const updatedBusinessContinuities = await prisma.businessContinuity.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedBusinessContinuities.count} business continuity(ies)`,
      count: updatedBusinessContinuities.count,
    })
  } catch (error) {
    console.error("Error bulk updating business continuities:", error)
    return NextResponse.json({ error: "Failed to update business continuities" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Business continuity IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedBusinessContinuities = await prisma.businessContinuity.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedBusinessContinuities.count} business continuity(ies) permanently`,
        count: deletedBusinessContinuities.count,
      })
    } else {
      // Soft delete - archive the business continuities
      const archivedBusinessContinuities = await prisma.businessContinuity.updateMany({
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
        message: `Successfully archived ${archivedBusinessContinuities.count} business continuity(ies)`,
        count: archivedBusinessContinuities.count,
      })
    }
  } catch (error) {
    console.error("Error deleting business continuities:", error)
    return NextResponse.json({ error: "Failed to delete business continuities" }, { status: 500 })
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

        // Reset order numbers for business continuities in a category
        const businessContinuities = await prisma.businessContinuity.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = businessContinuities.map((bc, index) =>
          prisma.businessContinuity.update({
            where: { id: bc.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${businessContinuities.length} business continuities in category`,
          count: businessContinuities.length,
        })

      case "move-to-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both current and new category IDs are required" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderInNewCategory = await prisma.businessContinuity.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const startingOrder = highestOrderInNewCategory ? highestOrderInNewCategory.order + 1 : 1

        // Update all business continuities in the current category
        const businessContinuitiesToMove = await prisma.businessContinuity.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const movePromises = businessContinuitiesToMove.map((bc, index) =>
          prisma.businessContinuity.update({
            where: { id: bc.id },
            data: {
              categoryId: newCategoryId,
              order: startingOrder + index,
            },
          })
        )

        await Promise.all(movePromises)

        return NextResponse.json({
          message: `Successfully moved ${businessContinuitiesToMove.length} business continuities to new category`,
          count: businessContinuitiesToMove.length,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing business continuity action:", error)
    return NextResponse.json({ error: "Failed to perform business continuity action" }, { status: 500 })
  }
}, "write")
