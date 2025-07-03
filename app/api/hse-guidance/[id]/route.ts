import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const hseGuidance = await prisma.hseGuidance.findUnique({
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
      },
    })

    if (!hseGuidance) {
      return NextResponse.json({ error: "HSE guidance not found" }, { status: 404 })
    }

    return NextResponse.json(hseGuidance)
  } catch (error) {
    console.error("Error fetching HSE guidance:", error)
    return NextResponse.json({ error: "Failed to fetch HSE guidance" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const nextReviewDate = formData.get("nextReviewDate") as string
    const department = formData.get("department") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !department) {
      return new NextResponse("All fields are required", { status: 400 })
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 })
    }

    const hseGuidance = await prisma.hseGuidance.update({
      where: { id: params.id },
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        highlighted,
        approved,
        updatedById: user.id as string,
      },
    })

    return NextResponse.json(hseGuidance)
  } catch (error) {
    console.error("[HSE_GUIDANCE_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const hseGuidance = await prisma.hseGuidance.delete({
      where: { id: params.id },
    })

    return NextResponse.json(hseGuidance)
  } catch (error) {
    console.error("Error deleting HSE guidance:", error)
    return NextResponse.json({ error: "Failed to delete HSE guidance" }, { status: 500 })
  }
}, "delete")
