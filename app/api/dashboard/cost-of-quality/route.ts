import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let costOfQuality

    if (startDate && endDate) {
      // If date range is provided, filter by date
      costOfQuality = await prisma.costOfQuality.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      })
    } else {
      // Otherwise, get all cost of quality data
      costOfQuality = await prisma.costOfQuality.findMany()
    }

    return NextResponse.json(costOfQuality)
  } catch (error) {
    console.error("Error fetching cost of quality:", error)
    return NextResponse.json({ error: "Failed to fetch cost of quality" }, { status: 500 })
  }
})

