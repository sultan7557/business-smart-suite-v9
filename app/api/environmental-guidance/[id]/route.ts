import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const environmentalGuidanceId = resolvedParams.id;

    const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
      where: { id: environmentalGuidanceId },
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

    if (!environmentalGuidance) {
      return NextResponse.json({ error: "Environmental Guidance not found" }, { status: 404 })
    }

    return NextResponse.json(environmentalGuidance)
  } catch (error) {
    console.error("Error fetching Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to fetch Environmental Guidance" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const environmentalGuidanceId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, reviewDate, department, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const environmentalGuidance = await prisma.environmentalGuidance.update({
      where: { id: environmentalGuidanceId },
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

    return NextResponse.json(environmentalGuidance)
  } catch (error) {
    console.error("Error updating Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to update Environmental Guidance" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const environmentalGuidanceId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const environmentalGuidance = await prisma.environmentalGuidance.update({
      where: { id: environmentalGuidanceId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(environmentalGuidance)
  } catch (error) {
    console.error("Error deleting Environmental Guidance:", error)
    return NextResponse.json({ error: "Failed to delete Environmental Guidance" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const environmentalGuidanceId = resolvedParams.id;
    
    const data = await request.json()
    const { action, direction } = data

    if (action === "reorder" && direction) {
      const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
        where: { id: environmentalGuidanceId }
      })

      if (!environmentalGuidance) {
        return NextResponse.json({ error: "Environmental Guidance not found" }, { status: 404 })
      }

      if (direction === "up") {
        // Find the Environmental Guidance with the next lower order in the same category
        const prevEnvironmentalGuidance = await prisma.environmentalGuidance.findFirst({
          where: {
            categoryId: environmentalGuidance.categoryId,
            order: { lt: environmentalGuidance.order },
            archived: environmentalGuidance.archived,
          },
          orderBy: { order: "desc" },
        })

        if (prevEnvironmentalGuidance) {
          // Swap orders
          await prisma.$transaction([
            prisma.environmentalGuidance.update({
              where: { id: environmentalGuidance.id },
              data: { order: prevEnvironmentalGuidance.order },
            }),
            prisma.environmentalGuidance.update({
              where: { id: prevEnvironmentalGuidance.id },
              data: { order: environmentalGuidance.order },
            }),
          ])
        }
      } else if (direction === "down") {
        // Find the Environmental Guidance with the next higher order in the same category
        const nextEnvironmentalGuidance = await prisma.environmentalGuidance.findFirst({
          where: {
            categoryId: environmentalGuidance.categoryId,
            order: { gt: environmentalGuidance.order },
            archived: environmentalGuidance.archived,
          },
          orderBy: { order: "asc" },
        })

        if (nextEnvironmentalGuidance) {
          // Swap orders
          await prisma.$transaction([
            prisma.environmentalGuidance.update({
              where: { id: environmentalGuidance.id },
              data: { order: nextEnvironmentalGuidance.order },
            }),
            prisma.environmentalGuidance.update({
              where: { id: nextEnvironmentalGuidance.id },
              data: { order: environmentalGuidance.order },
            }),
          ])
        }
      }

      return NextResponse.json({ message: "Environmental Guidance reordered successfully" })
    }

    if (action === "toggle-highlight") {
      const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
        where: { id: environmentalGuidanceId },
        data: {
          highlighted: !(await prisma.environmentalGuidance.findUnique({ where: { id: environmentalGuidanceId } }))?.highlighted,
        },
      })

      return NextResponse.json(updatedEnvironmentalGuidance)
    }

    if (action === "approve") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
        where: { id: environmentalGuidanceId },
        data: {
          approved: true,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedEnvironmentalGuidance)
    }

    if (action === "unapprove") {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
        where: { id: environmentalGuidanceId },
        data: {
          approved: false,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedEnvironmentalGuidance)
    }

    if (action === "archive") {
      const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
        where: { id: environmentalGuidanceId },
        data: {
          archived: true,
        },
      })

      return NextResponse.json(updatedEnvironmentalGuidance)
    }

    if (action === "unarchive") {
      const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
        where: { id: environmentalGuidanceId },
        data: {
          archived: false,
        },
      })

      return NextResponse.json(updatedEnvironmentalGuidance)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error performing Environmental Guidance action:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}, "write")