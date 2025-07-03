import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const procedureId = resolvedParams.id;

    const procedure = await prisma.procedure.findUnique({
      where: { id: procedureId },
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

    if (!procedure) {
      return NextResponse.json({ error: "Procedure not found" }, { status: 404 })
    }

    return NextResponse.json(procedure)
  } catch (error) {
    console.error("Error fetching procedure:", error)
    return NextResponse.json({ error: "Failed to fetch procedure" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const procedureId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const procedure = await prisma.procedure.update({
      where: { id: procedureId },
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

    return NextResponse.json(procedure)
  } catch (error) {
    console.error("Error updating procedure:", error)
    return NextResponse.json({ error: "Failed to update procedure" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const procedureId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const procedure = await prisma.procedure.update({
      where: { id: procedureId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(procedure)
  } catch (error) {
    console.error("Error deleting procedure:", error)
    return NextResponse.json({ error: "Failed to delete procedure" }, { status: 500 })
  }
}, "delete")