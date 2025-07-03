import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const register = await prisma.register.findUnique({
      where: {
        id: params.id,
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
    })

    if (!register) {
      return NextResponse.json({ error: "Register not found" }, { status: 404 })
    }

    return NextResponse.json(register)
  } catch (error) {
    console.error("Error fetching register:", error)
    return NextResponse.json({ error: "Failed to fetch register" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, version, reviewDate, nextReviewDate, department, content, categoryId } = body

    if (!title || !version || !reviewDate || !department) {
      return new NextResponse("All fields are required", { status: 400 })
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 })
    }

    const register = await prisma.register.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        categoryId,
        updatedById: user.id as string,
      },
    })

    return NextResponse.json(register)
  } catch (error) {
    console.error("[REGISTERS_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const { permanent } = body

    if (permanent) {
      // Permanent deletion - only for admin users
      await prisma.register.delete({
        where: {
          id: params.id,
        },
      })

      return NextResponse.json({
        message: "Successfully deleted register permanently",
      })
    } else {
      // Soft delete - archive the register
      await prisma.register.update({
        where: {
          id: params.id,
        },
        data: {
          archived: true,
        },
      })

      return NextResponse.json({
        message: "Successfully archived register",
      })
    }
  } catch (error) {
    console.error("Error deleting register:", error)
    return NextResponse.json({ error: "Failed to delete register" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    switch (action) {
      case "approve":
        await prisma.register.update({
          where: {
            id: params.id,
          },
          data: {
            approved: true,
          },
        })
        break

      case "unapprove":
        await prisma.register.update({
          where: {
            id: params.id,
          },
          data: {
            approved: false,
          },
        })
        break

      case "highlight":
        await prisma.register.update({
          where: {
            id: params.id,
          },
          data: {
            highlighted: true,
          },
        })
        break

      case "unhighlight":
        await prisma.register.update({
          where: {
            id: params.id,
          },
          data: {
            highlighted: false,
          },
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({
      message: `Successfully ${action}d register`,
    })
  } catch (error) {
    console.error("Error performing register action:", error)
    return NextResponse.json({ error: "Failed to perform register action" }, { status: 500 })
  }
}, "write") 