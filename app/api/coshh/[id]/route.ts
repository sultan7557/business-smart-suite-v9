import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const coshhId = resolvedParams.id;

    const coshh = await prisma.cOSHH.findUnique({
      where: { id: coshhId },
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

    if (!coshh) {
      return NextResponse.json({ error: "COSHH not found" }, { status: 404 })
    }

    return NextResponse.json(coshh)
  } catch (error) {
    console.error("Error fetching COSHH:", error)
    return NextResponse.json({ error: "Failed to fetch COSHH" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const coshhId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, reviewDate, department, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const coshh = await prisma.cOSHH.update({
      where: { id: coshhId },
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

    return NextResponse.json(coshh)
  } catch (error) {
    console.error("Error updating COSHH:", error)
    return NextResponse.json({ error: "Failed to update COSHH" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const coshhId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const coshh = await prisma.cOSHH.update({
      where: { id: coshhId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(coshh)
  } catch (error) {
    console.error("Error deleting COSHH:", error)
    return NextResponse.json({ error: "Failed to delete COSHH" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const coshhId = resolvedParams.id;
    
    const data = await request.json()
    const { action, direction } = data

    if (action === "reorder" && direction) {
      const coshh = await prisma.cOSHH.findUnique({
        where: { id: coshhId }
      })

      if (!coshh) {
        return NextResponse.json({ error: "COSHH not found" }, { status: 404 })
      }

      if (direction === "up") {
        // Find the COSHH with the next lower order in the same category
        const prevCOSHH = await prisma.cOSHH.findFirst({
          where: {
            categoryId: coshh.categoryId,
            order: { lt: coshh.order },
            archived: coshh.archived,
          },
          orderBy: { order: "desc" },
        })

        if (prevCOSHH) {
          // Swap orders
          await prisma.$transaction([
            prisma.cOSHH.update({
              where: { id: coshh.id },
              data: { order: prevCOSHH.order },
            }),
            prisma.cOSHH.update({
              where: { id: prevCOSHH.id },
              data: { order: coshh.order },
            }),
          ])
        }
      } else if (direction === "down") {
        // Find the COSHH with the next higher order in the same category
        const nextCOSHH = await prisma.cOSHH.findFirst({
          where: {
            categoryId: coshh.categoryId,
            order: { gt: coshh.order },
            archived: coshh.archived,
          },
          orderBy: { order: "asc" },
        })

        if (nextCOSHH) {
          // Swap orders
          await prisma.$transaction([
            prisma.cOSHH.update({
              where: { id: coshh.id },
              data: { order: nextCOSHH.order },
            }),
            prisma.cOSHH.update({
              where: { id: nextCOSHH.id },
              data: { order: coshh.order },
            }),
          ])
        }
      }

      return NextResponse.json({ message: "COSHH reordered successfully" })
    }

    if (action === "toggle-highlight") {
      const updatedCOSHH = await prisma.cOSHH.update({
        where: { id: coshhId },
        data: {
          highlighted: !(await prisma.cOSHH.findUnique({ where: { id: coshhId } }))?.highlighted,
        },
      })

      return NextResponse.json(updatedCOSHH)
    }

    if (action === "approve") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedCOSHH = await prisma.cOSHH.update({
        where: { id: coshhId },
        data: {
          approved: true,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedCOSHH)
    }

    if (action === "unapprove") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedCOSHH = await prisma.cOSHH.update({
        where: { id: coshhId },
        data: {
          approved: false,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedCOSHH)
    }

    if (action === "archive") {
      const updatedCOSHH = await prisma.cOSHH.update({
        where: { id: coshhId },
        data: {
          archived: true,
        },
      })

      return NextResponse.json(updatedCOSHH)
    }

    if (action === "unarchive") {
      const updatedCOSHH = await prisma.cOSHH.update({
        where: { id: coshhId },
        data: {
          archived: false,
        },
      })

      return NextResponse.json(updatedCOSHH)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error performing COSHH action:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}, "write")