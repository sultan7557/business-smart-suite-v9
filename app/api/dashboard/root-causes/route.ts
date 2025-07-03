import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let rootCauses

    if (startDate && endDate) {
      // If date range is provided, filter by date
      rootCauses = await prisma.rootCause.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      })
    } else {
      // Otherwise, get all root causes
      rootCauses = await prisma.rootCause.findMany()
    }

    return NextResponse.json(rootCauses)
  } catch (error) {
    console.error("Error fetching root causes:", error)
    return NextResponse.json({ error: "Failed to fetch root causes" }, { status: 500 })
  }
})

