import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const manual = await prisma.manual.findUnique({
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
        versions: {
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            document: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
        },
        reviews: {
          include: {
            reviewedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            reviewDate: "desc",
          },
        },
      },
    })

    if (!manual) {
      return NextResponse.json({ error: "Manual not found" }, { status: 404 })
    }

    return NextResponse.json(manual)
  } catch (error) {
    console.error("Error fetching manual:", error)
    return NextResponse.json({ error: "Failed to fetch manual" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const data = await request.json()
    const user = await getUser();

    const manual = await prisma.manual.update({
      where: {
        id: params.id,
      },
      data: {
        ...data,
        updatedById: user.id,
      },
    })

    return NextResponse.json(manual)
  } catch (error) {
    console.error("Error updating manual:", error)
    return NextResponse.json({ error: "Failed to update manual" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Soft delete by setting archived to true
    const manual = await prisma.manual.update({
      where: {
        id: params.id,
      },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(manual)
  } catch (error) {
    console.error("Error deleting manual:", error)
    return NextResponse.json({ error: "Failed to delete manual" }, { status: 500 })
  }
}, "delete")
