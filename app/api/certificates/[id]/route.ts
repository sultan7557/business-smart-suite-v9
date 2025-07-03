import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const certificateId = resolvedParams.id;

    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
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

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error fetching certificate:", error)
    return NextResponse.json({ error: "Failed to fetch certificate" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const certificateId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const certificate = await prisma.certificate.update({
      where: { id: certificateId },
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

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error updating certificate:", error)
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const certificateId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const certificate = await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error deleting certificate:", error)
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const certificateId = resolvedParams.id;
    
    const data = await request.json()
    const { action, direction } = data

    if (action === "reorder" && direction) {
      const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId }
      })

      if (!certificate) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
      }

      if (direction === "up") {
        // Find the certificate with the next lower order in the same category
        const prevCertificate = await prisma.certificate.findFirst({
          where: {
            categoryId: certificate.categoryId,
            order: { lt: certificate.order },
            archived: certificate.archived,
          },
          orderBy: { order: "desc" },
        })

        if (prevCertificate) {
          // Swap orders
          await prisma.$transaction([
            prisma.certificate.update({
              where: { id: certificate.id },
              data: { order: prevCertificate.order },
            }),
            prisma.certificate.update({
              where: { id: prevCertificate.id },
              data: { order: certificate.order },
            }),
          ])
        }
      } else if (direction === "down") {
        // Find the certificate with the next higher order in the same category
        const nextCertificate = await prisma.certificate.findFirst({
          where: {
            categoryId: certificate.categoryId,
            order: { gt: certificate.order },
            archived: certificate.archived,
          },
          orderBy: { order: "asc" },
        })

        if (nextCertificate) {
          // Swap orders
          await prisma.$transaction([
            prisma.certificate.update({
              where: { id: certificate.id },
              data: { order: nextCertificate.order },
            }),
            prisma.certificate.update({
              where: { id: nextCertificate.id },
              data: { order: certificate.order },
            }),
          ])
        }
      }

      return NextResponse.json({ message: "Certificate reordered successfully" })
    }

    if (action === "toggle-highlight") {
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          highlighted: { not: {} },
        },
      })

      return NextResponse.json(updatedCertificate)
    }

    if (action === "approve") {
      const user = await getUser();
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          approved: true,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedCertificate)
    }

    if (action === "unapprove") {
      const user = await getUser();
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          approved: false,
          updatedById: user.id,
        },
      })

      return NextResponse.json(updatedCertificate)
    }

    if (action === "archive") {
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          archived: true,
        },
      })

      return NextResponse.json(updatedCertificate)
    }

    if (action === "unarchive") {
      const updatedCertificate = await prisma.certificate.update({
        where: { id: certificateId },
        data: {
          archived: false,
        },
      })

      return NextResponse.json(updatedCertificate)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error performing certificate action:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}, "write")