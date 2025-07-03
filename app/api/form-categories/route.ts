import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const archived = searchParams.get("archived") === "true"

  try {
    const categories = await prisma.formCategory.findMany({
      where: { archived },
      orderBy: { order: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching form categories:", error)
    return NextResponse.json({ error: "Failed to fetch form categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, highlighted } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const category = await prisma.formCategory.create({
      data: {
        title,
        highlighted: highlighted || false,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating form category:", error)
    return NextResponse.json({ error: "Failed to create form category" }, { status: 500 })
  }
}