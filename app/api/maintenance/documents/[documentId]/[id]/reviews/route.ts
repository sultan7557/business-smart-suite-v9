import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// GET - List reviews for a document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviews = await prisma.maintenanceDocumentReview.findMany({
      where: { documentId: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        reviewDate: "desc",
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

// POST - Add a new review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewerName, reviewDetails, reviewDate, nextReviewDate } = await request.json()

    if (!reviewerName || !reviewDetails || !reviewDate) {
      return NextResponse.json(
        { error: "Reviewer name, review details, and review date are required" },
        { status: 400 }
      )
    }

    const review = await prisma.maintenanceDocumentReview.create({
      data: {
        documentId: params.id,
        reviewerName,
        reviewDetails,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get("reviewId")

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      )
    }

    await prisma.maintenanceDocumentReview.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
} 