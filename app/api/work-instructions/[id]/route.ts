import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const workInstruction = await prisma.workInstruction.findUnique({
      where: { id: params.id },
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
          orderBy: {
            issueDate: "desc",
          },
          include: {
            document: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
        reviews: {
          orderBy: {
            reviewDate: "desc",
          },
          include: {
            reviewedBy: {
              select: {
                name: true,
              },
            },
          },
        },
        documents: true,
      },
    })

    if (!workInstruction) {
      return NextResponse.json({ error: "Work instruction not found" }, { status: 404 })
    }

    return NextResponse.json(workInstruction)
  } catch (error) {
    console.error("Error fetching work instruction:", error)
    return NextResponse.json({ error: "Failed to fetch work instruction" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = body

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const workInstruction = await prisma.workInstruction.update({
      where: { id: params.id },
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        updatedById: user.id,
      },
    })

    return NextResponse.json(workInstruction)
  } catch (error) {
    console.error("Error updating work instruction:", error)
    return NextResponse.json({ error: "Failed to update work instruction" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // First delete all versions
    await prisma.workInstructionVersion.deleteMany({
      where: { workInstructionId: params.id },
    })

    // Then delete all reviews
    await prisma.workInstructionReview.deleteMany({
      where: { workInstructionId: params.id },
    })

    // Finally delete the work instruction
    await prisma.workInstruction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Work instruction deleted successfully" })
  } catch (error) {
    console.error("Error deleting work instruction:", error)
    return NextResponse.json({ error: "Failed to delete work instruction" }, { status: 500 })
  }
}, "delete")
