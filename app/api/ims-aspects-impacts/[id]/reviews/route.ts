import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reviews = await prisma.iMSAspectImpactReview.findMany({
      where: { aspectImpactId: id },
      orderBy: { reviewDate: "desc" },
    })

    return NextResponse.json({ data: reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { reviewerName, reviewDetails, reviewDate, nextReviewDate } = body

    const review = await prisma.iMSAspectImpactReview.create({
      data: {
        aspectImpactId: id,
        reviewerName,
        reviewDetails,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        createdById: user.id,
      },
    })

    return NextResponse.json({ data: review }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
