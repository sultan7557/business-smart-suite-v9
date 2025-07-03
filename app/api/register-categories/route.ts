import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"

    const categories = await prisma.registerCategory.findMany({
      where: {
        archived,
      },
      include: {
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
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching register categories:", error)
    return NextResponse.json({ error: "Failed to fetch register categories" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const user = await getUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    // Get the highest order
    const highestOrderCategory = await prisma.registerCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.registerCategory.create({
      data: {
        name,
        order: newOrder,
        createdById: user.id as string,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[REGISTER_CATEGORIES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}, "write")

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Category IDs are required" }, { status: 400 })
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
      case "update":
        if (!data) {
          return NextResponse.json({ error: "Update data is required" }, { status: 400 })
        }
        updateData = data
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedCategories = await prisma.registerCategory.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedCategories.count} category(ies)`,
      count: updatedCategories.count,
    })
  } catch (error) {
    console.error("Error bulk updating register categories:", error)
    return NextResponse.json({ error: "Failed to update register categories" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Category IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedCategories = await prisma.registerCategory.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedCategories.count} category(ies) permanently`,
        count: deletedCategories.count,
      })
    } else {
      // Soft delete - archive the categories
      const archivedCategories = await prisma.registerCategory.updateMany({
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
        message: `Successfully archived ${archivedCategories.count} category(ies)`,
        count: archivedCategories.count,
      })
    }
  } catch (error) {
    console.error("Error deleting register categories:", error)
    return NextResponse.json({ error: "Failed to delete register categories" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, categoryId, newOrder } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    switch (action) {
      case "reorder":
        if (!categoryId || typeof newOrder !== "number") {
          return NextResponse.json(
            { error: "Category ID and new order are required for reordering" },
            { status: 400 }
          )
        }

        const category = await prisma.registerCategory.findUnique({
          where: { id: categoryId },
          select: { order: true },
        })

        if (!category) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 })
        }

        const oldOrder = category.order

        if (newOrder > oldOrder) {
          // Moving down - decrease order of items in between
          await prisma.registerCategory.updateMany({
            where: {
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          })
        } else if (newOrder < oldOrder) {
          // Moving up - increase order of items in between
          await prisma.registerCategory.updateMany({
            where: {
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          })
        }

        // Update the category's order
        await prisma.registerCategory.update({
          where: { id: categoryId },
          data: { order: newOrder },
        })

        return NextResponse.json({
          message: "Successfully reordered category",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing register category action:", error)
    return NextResponse.json({ error: "Failed to perform register category action" }, { status: 500 })
  }
}, "write") 