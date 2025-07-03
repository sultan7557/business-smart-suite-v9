import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"

    const categories = await prisma.hseGuidanceCategory.findMany({
      where: { archived },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching HSE guidance categories:", error)
    return NextResponse.json({ error: "Failed to fetch HSE guidance categories" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()
    const { title } = data
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    // Get the highest order
    const highestOrderCategory = await prisma.hseGuidanceCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.hseGuidanceCategory.create({
      data: {
        ...data,
        order: newOrder,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating HSE guidance category:", error)
    return NextResponse.json({ error: "Failed to create HSE guidance category" }, { status: 500 })
  }
}, "write")
