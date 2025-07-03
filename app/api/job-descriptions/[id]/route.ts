import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const managementReview = await prisma.managementReview.findUnique({
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

    if (!managementReview) {
      return NextResponse.json({ error: "Management review not found" }, { status: 404 })
    }

    return NextResponse.json(managementReview)
  } catch (error) {
    console.error("Error fetching management review:", error)
    return NextResponse.json({ error: "Failed to fetch management review" }, { status: 500 })
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

    const managementReview = await prisma.managementReview.update({
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

    return NextResponse.json(managementReview)
  } catch (error) {
    console.error("Error updating management review:", error)
    return NextResponse.json({ error: "Failed to update management review" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // First delete all versions
    await prisma.managementReviewVersion.deleteMany({
      where: { managementReviewId: params.id },
    })

    // Then delete all reviews
    await prisma.managementReviewReview.deleteMany({
      where: { managementReviewId: params.id },
    })

    // Finally delete the management review
    await prisma.managementReview.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Management review deleted successfully" })
  } catch (error) {
    console.error("Error deleting management review:", error)
    return NextResponse.json({ error: "Failed to delete management review" }, { status: 500 })
  }
}, "delete")
