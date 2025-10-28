import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; reviewId: string }> }) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, reviewId } = await params

    // Verify the review belongs to the aspect impact
    const review = await prisma.iMSAspectImpactReview.findFirst({
      where: {
        id: reviewId,
        aspectImpactId: id,
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    await prisma.iMSAspectImpactReview.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
