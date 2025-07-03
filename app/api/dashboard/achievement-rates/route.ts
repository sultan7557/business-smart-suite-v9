import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let achievementRates

    if (startDate && endDate) {
      // If date range is provided, filter by date
      achievementRates = await prisma.achievementRate.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      })
    } else {
      // Otherwise, get all achievement rates
      achievementRates = await prisma.achievementRate.findMany()
    }

    return NextResponse.json(achievementRates)
  } catch (error) {
    console.error("Error fetching achievement rates:", error)
    return NextResponse.json({ error: "Failed to fetch achievement rates" }, { status: 500 })
  }
})

