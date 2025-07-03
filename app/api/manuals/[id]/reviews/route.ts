import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const POST = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const resolvedParams = await params
    const data = await request.json()
    const user = await getUser()

    const review = await prisma.manualReview.create({
      data: {
        ...data,
        manualId: resolvedParams.id,
        reviewedById: user.id,
      },
      include: {
        reviewedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error adding review:", error)
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const resolvedParams = await params
    const reviewId = request.nextUrl.searchParams.get("reviewId")
    
    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    await prisma.manualReview.delete({
      where: {
        id: reviewId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}, "write") 