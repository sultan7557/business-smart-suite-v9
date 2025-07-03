import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const riskAssessment = await prisma.riskAssessment.findUnique({
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
            reviewDate: "desc",
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

    if (!riskAssessment) {
      return NextResponse.json({ error: "Risk assessment not found" }, { status: 404 })
    }

    return NextResponse.json(riskAssessment)
  } catch (error) {
    console.error("Error fetching risk assessment:", error)
    return NextResponse.json({ error: "Failed to fetch risk assessment" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, version, reviewDate, nextReviewDate, department, content, categoryId, highlighted, approved } = body

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const riskAssessment = await prisma.riskAssessment.update({
      where: { id: params.id },
      data: {
        title,
        version,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content,
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        updatedById: user.id,
      },
    })

    return NextResponse.json(riskAssessment)
  } catch (error) {
    console.error("Error updating risk assessment:", error)
    return NextResponse.json({ error: "Failed to update risk assessment" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // First delete all versions
    await prisma.riskAssessmentVersion.deleteMany({
      where: { riskAssessmentId: params.id },
    })

    // Then delete all reviews
    await prisma.riskAssessmentReview.deleteMany({
      where: { riskAssessmentId: params.id },
    })

    // Finally delete the risk assessment
    await prisma.riskAssessment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Risk assessment deleted successfully" })
  } catch (error) {
    console.error("Error deleting risk assessment:", error)
    return NextResponse.json({ error: "Failed to delete risk assessment" }, { status: 500 })
  }
}, "delete")
