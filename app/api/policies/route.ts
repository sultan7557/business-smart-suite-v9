import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get("categoryId")
    const cacheKey = `policies:categoryId:${categoryId || 'all'}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

    let policies
    if (categoryId) {
      policies = await prisma.policy.findMany({
        where: {
          categoryId,
          archived: false,
        },
        include: {
          category: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      })
    } else {
      policies = await prisma.policy.findMany({
        where: {
          archived: false,
        },
        include: {
          category: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          {
            category: {
              order: "asc",
            },
          },
          {
            order: "asc",
          },
        ],
      })
    }
    const result = JSON.stringify(policies)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()
    const user = await request.json()

    const policy = await prisma.policy.create({
      data: {
        ...data,
        createdById: user.id,
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error creating policy:", error)
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 })
  }
}, "write")

