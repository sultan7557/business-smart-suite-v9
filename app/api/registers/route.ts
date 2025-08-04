import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")
    const cacheKey = `registers:archived:${archived}:categoryId:${categoryId || 'all'}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

    const registers = await prisma.register.findMany({
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
    const result = JSON.stringify(registers)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching registers:", error)
    return NextResponse.json({ error: "Failed to fetch registers" }, { status: 500 })
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
    const department = formData.get("department") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !department) {
      return new NextResponse("All fields are required", { status: 400 })
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderRegister = await prisma.register.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderRegister ? highestOrderRegister.order + 1 : 1

    const register = await prisma.register.create({
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        highlighted,
        approved,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    return NextResponse.json(register, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("[REGISTERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Register IDs are required" }, { status: 400 })
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

    const updatedRegisters = await prisma.register.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedRegisters.count} register(s)`,
      count: updatedRegisters.count,
    })
  } catch (error) {
    console.error("Error bulk updating registers:", error)
    return NextResponse.json({ error: "Failed to update registers" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Register IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedRegisters = await prisma.register.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedRegisters.count} register(s) permanently`,
        count: deletedRegisters.count,
      })
    } else {
      // Soft delete - archive the registers
      const archivedRegisters = await prisma.register.updateMany({
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
        message: `Successfully archived ${archivedRegisters.count} register(s)`,
        count: archivedRegisters.count,
      })
    }
  } catch (error) {
    console.error("Error deleting registers:", error)
    return NextResponse.json({ error: "Failed to delete registers" }, { status: 500 })
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

        // Reset order numbers for registers in a category
        const registers = await prisma.register.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = registers.map((ra, index) =>
          prisma.register.update({
            where: { id: ra.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${registers.length} registers in category`,
          count: registers.length,
        })

      case "move-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both category ID and new category ID are required for moving" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderRegister = await prisma.register.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const newOrder = highestOrderRegister ? highestOrderRegister.order + 1 : 1

        // Move registers to the new category
        const movedRegisters = await prisma.register.updateMany({
          where: { categoryId },
          data: {
            categoryId: newCategoryId,
            order: newOrder,
          },
        })

        return NextResponse.json({
          message: `Successfully moved ${movedRegisters.count} registers to new category`,
          count: movedRegisters.count,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing register action:", error)
    return NextResponse.json({ error: "Failed to perform register action" }, { status: 500 })
  }
}, "write") 