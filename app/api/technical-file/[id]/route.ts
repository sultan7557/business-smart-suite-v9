import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const technicalFileId = resolvedParams.id;

    const technicalFile = await prisma.technicalFile.findUnique({
      where: { id: technicalFileId },
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

    if (!technicalFile) {
      return NextResponse.json({ error: "Technical File not found" }, { status: 404 })
    }

    return NextResponse.json(technicalFile)
  } catch (error) {
    console.error("Error fetching Technical File:", error)
    return NextResponse.json({ error: "Failed to fetch Technical File" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const technicalFileId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, reviewDate, department, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const technicalFile = await prisma.technicalFile.update({
      where: { id: technicalFileId },
      data: {
        title,
        version,
        reviewDate: new Date(reviewDate),
        department,
        content,
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        updatedById: user.id,
      },
    })

    return NextResponse.json(technicalFile)
  } catch (error) {
    console.error("Error updating Technical File:", error)
    return NextResponse.json({ error: "Failed to update Technical File" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const technicalFileId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const technicalFile = await prisma.technicalFile.update({
      where: { id: technicalFileId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(technicalFile)
  } catch (error) {
    console.error("Error deleting Technical File:", error)
    return NextResponse.json({ error: "Failed to delete Technical File" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const technicalFileId = resolvedParams.id;
    
    const data = await request.json()
    const { action, direction } = data

    if (action === "reorder" && direction) {
      const technicalFile = await prisma.technicalFile.findUnique({
        where: { id: technicalFileId }
      })

      if (!technicalFile) {
        return NextResponse.json({ error: "Technical File not found" }, { status: 404 })
      }

      if (direction === "up") {
        // Find the Technical File with the next lower order in the same category
        const prevTechnicalFile = await prisma.technicalFile.findFirst({
          where: {
            categoryId: technicalFile.categoryId,
            order: { lt: technicalFile.order },
            archived: technicalFile.archived,
          },
          orderBy: { order: "desc" },
        })

        if (prevTechnicalFile) {
          // Swap orders
          await prisma.$transaction([
            prisma.technicalFile.update({
              where: { id: technicalFile.id },
              data: { order: prevTechnicalFile.order },
            }),
            prisma.technicalFile.update({
              where: { id: prevTechnicalFile.id },
              data: { order: technicalFile.order },
            }),
          ])
        }
      } else if (direction === "down") {
        // Find the Technical File with the next higher order in the same category
        const nextTechnicalFile = await prisma.technicalFile.findFirst({
          where: {
            categoryId: technicalFile.categoryId,
            order: { gt: technicalFile.order },
            archived: technicalFile.archived,
          },
          orderBy: { order: "asc" },
        })

        if (nextTechnicalFile) {
          // Swap orders
          await prisma.$transaction([
            prisma.technicalFile.update({
              where: { id: technicalFile.id },
              data: { order: nextTechnicalFile.order },
            }),
            prisma.technicalFile.update({
              where: { id: nextTechnicalFile.id },
              data: { order: technicalFile.order },
            }),
          ])
        }
      }

      return NextResponse.json({ message: "Technical File reordered successfully" })
    }

    if (action === "toggle-highlight") {
      const updatedTechnicalFile = await prisma.technicalFile.update({
        where: { id: technicalFileId },
        data: {
          highlighted: !(await prisma.technicalFile.findUnique({ where: { id: technicalFileId } }))?.highlighted,
        },
      })

      return NextResponse.json(updatedTechnicalFile)
    }

    if (action === "approve") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedTechnicalFile = await prisma.technicalFile.update({
        where: { id: technicalFileId },
        data: {
          approved: true,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedTechnicalFile)
    }

    if (action === "unapprove") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedTechnicalFile = await prisma.technicalFile.update({
        where: { id: technicalFileId },
        data: {
          approved: false,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedTechnicalFile)
    }

    if (action === "archive") {
      const updatedTechnicalFile = await prisma.technicalFile.update({
        where: { id: technicalFileId },
        data: {
          archived: true,
        },
      })

      return NextResponse.json(updatedTechnicalFile)
    }

    if (action === "unarchive") {
      const updatedTechnicalFile = await prisma.technicalFile.update({
        where: { id: technicalFileId },
        data: {
          archived: false,
        },
      })

      return NextResponse.json(updatedTechnicalFile)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error performing Technical File action:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}, "write")