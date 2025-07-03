import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get("categoryId")

    let manuals
    if (categoryId) {
      manuals = await prisma.manual.findMany({
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
      manuals = await prisma.manual.findMany({
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

    return NextResponse.json(manuals)
  } catch (error) {
    console.error("Error fetching manuals:", error)
    return NextResponse.json({ error: "Failed to fetch manuals" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json()
    const user = await request.json()

    const manual = await prisma.manual.create({
      data: {
        ...data,
        createdById: user.id,
      },
    })

    return NextResponse.json(manual)
  } catch (error) {
    console.error("Error creating manual:", error)
    return NextResponse.json({ error: "Failed to create manual" }, { status: 500 })
  }
}, "write")
