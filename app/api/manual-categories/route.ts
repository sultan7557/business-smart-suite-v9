import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async () => {
  try {
    const categories = await prisma.manualCategory.findMany({
      where: {
        archived: false,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching manual categories:", error)
    return NextResponse.json({ error: "Failed to fetch manual categories" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()

    // Get the highest order
    const highestOrderCategory = await prisma.manualCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.manualCategory.create({
      data: {
        ...data,
        order: newOrder,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating manual category:", error)
    return NextResponse.json({ error: "Failed to create manual category" }, { status: 500 })
  }
}, "write")
