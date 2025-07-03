import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get("categoryId")

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

    return NextResponse.json(policies)
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

