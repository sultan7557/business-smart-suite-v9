import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const cacheKey = `dashboard:root-causes:${startDate || "all"}:${endDate || "all"}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

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

    const result = JSON.stringify(rootCauses)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching root causes:", error)
    return NextResponse.json({ error: "Failed to fetch root causes" }, { status: 500 })
  }
})

