import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get("categoryId")

    let manuals
    if (categoryId) {
      manuals = await prisma.manual.findMany({
        where: {
          categoryId,
          archived: false,
        },
        include: {
          category: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      })
    } else {
      manuals = await prisma.manual.findMany({
        where: {
          archived: false,
        },
        include: {
          category: true,
          createdBy: {
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
          {
            order: "asc",
          },
        ],
      })
    }

    return NextResponse.json(manuals, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("Error fetching manuals:", error)
    return NextResponse.json({ error: "Failed to fetch manuals" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const manual = await prisma.manual.create({
      data: {
        ...data,
        createdById: user.id,
      },
    })

    return NextResponse.json(manual, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      })
  } catch (error) {
    console.error("Error creating manual:", error)
    return NextResponse.json({ error: "Failed to create manual" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Manual IDs are required" }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case "archive":
        updateData = { archived: true, updatedById: user.id }
        break
      case "unarchive":
        updateData = { archived: false, updatedById: user.id }
        break
      case "approve":
        updateData = { approved: true, updatedById: user.id }
        break
      case "unapprove":
        updateData = { approved: false, updatedById: user.id }
        break
      case "highlight":
        updateData = { highlighted: true, updatedById: user.id }
        break
      case "unhighlight":
        updateData = { highlighted: false, updatedById: user.id }
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

    const updatedManuals = await prisma.manual.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    revalidatePath("/manual")

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedManuals.count} manual(s)`,
      count: updatedManuals.count,
    })
  } catch (error) {
    console.error("Error bulk updating manuals:", error)
    return NextResponse.json({ error: "Failed to update manuals" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Manual IDs are required" }, { status: 400 })
    }

    // First delete all manual versions for the selected manuals
    await prisma.manualVersion.deleteMany({
      where: {
        manualId: {
          in: ids,
        },
      },
    })

    // Then delete the manuals
    const deletedManuals = await prisma.manual.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    revalidatePath("/manual")

    return NextResponse.json({
      message: `Successfully deleted ${deletedManuals.count} manual(s)`,
      count: deletedManuals.count,
    })
  } catch (error) {
    console.error("Error bulk deleting manuals:", error)
    return NextResponse.json({ error: "Failed to delete manuals" }, { status: 500 })
  }
}, "delete")