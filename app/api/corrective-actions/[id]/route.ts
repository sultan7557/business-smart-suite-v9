import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const correctiveActionId = resolvedParams.id;

    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id: correctiveActionId },
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
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
          include: {
            uploadedBy: {
              select: {
                name: true,
              },
            },
          },
        },
        versions: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            document: true,
          },
        },
      },
    })

    if (!correctiveAction) {
      return NextResponse.json({ error: "Corrective action not found" }, { status: 404 })
    }

    return NextResponse.json(correctiveAction)
  } catch (error) {
    console.error("Error fetching corrective action:", error)
    return NextResponse.json({ error: "Failed to fetch corrective action" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const correctiveActionId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const correctiveAction = await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        updatedById: user.id,
      },
    })

    return NextResponse.json(correctiveAction)
  } catch (error) {
    console.error("Error updating corrective action:", error)
    return NextResponse.json({ error: "Failed to update corrective action" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const correctiveActionId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const correctiveAction = await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(correctiveAction)
  } catch (error) {
    console.error("Error deleting corrective action:", error)
    return NextResponse.json({ error: "Failed to delete corrective action" }, { status: 500 })
  }
}, "delete")