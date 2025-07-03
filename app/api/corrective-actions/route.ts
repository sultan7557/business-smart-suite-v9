import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")

    const correctiveActions = await prisma.correctiveAction.findMany({
      where: {
        archived,
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
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
        { order: "asc" },
        { title: "asc" },
      ],
    })

    return NextResponse.json(correctiveActions)
  } catch (error) {
    console.error("Error fetching corrective actions:", error)
    return NextResponse.json({ error: "Failed to fetch corrective actions" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = body

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderCorrectiveAction = await prisma.correctiveAction.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCorrectiveAction ? highestOrderCorrectiveAction.order + 1 : 1

    const correctiveAction = await prisma.correctiveAction.create({
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        createdById: user.id,
        highlighted: highlighted || false,
        approved: approved || false,
        order: newOrder,
      },
    })

    return NextResponse.json(correctiveAction)
  } catch (error) {
    console.error("Error creating corrective action:", error)
    return NextResponse.json({ error: "Failed to create corrective action" }, { status: 500 })
  }
}, "write")