import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const businessContinuity = await prisma.businessContinuity.findUnique({
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

    if (!businessContinuity) {
      return NextResponse.json({ error: "Business continuity not found" }, { status: 404 })
    }

    return NextResponse.json(businessContinuity)
  } catch (error) {
    console.error("Error fetching business continuity:", error)
    return NextResponse.json({ error: "Failed to fetch business continuity" }, { status: 500 })
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

    const businessContinuity = await prisma.businessContinuity.update({
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

    return NextResponse.json(businessContinuity)
  } catch (error) {
    console.error("Error updating business continuity:", error)
    return NextResponse.json({ error: "Failed to update business continuity" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // First delete all versions
    await prisma.businessContinuityVersion.deleteMany({
      where: { businessContinuityId: params.id },
    })

    // Then delete all reviews
    await prisma.businessContinuityReview.deleteMany({
      where: { businessContinuityId: params.id },
    })

    // Finally delete the business continuity
    await prisma.businessContinuity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Business continuity deleted successfully" })
  } catch (error) {
    console.error("Error deleting business continuity:", error)
    return NextResponse.json({ error: "Failed to delete business continuity" }, { status: 500 })
  }
}, "delete")
