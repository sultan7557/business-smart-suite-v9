import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const categories = await prisma.policyCategory.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching policy categories:", error)
    return NextResponse.json({ error: "Failed to fetch policy categories" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()

    const category = await prisma.policyCategory.create({
      data,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating policy category:", error)
    return NextResponse.json({ error: "Failed to create policy category" }, { status: 500 })
  }
}, "write")

