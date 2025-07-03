import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")

    const certificates = await prisma.certificate.findMany({
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

    return NextResponse.json(certificates)
  } catch (error) {
    console.error("Error fetching certificates:", error)
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 })
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
    const highestOrderCertificate = await prisma.certificate.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCertificate ? highestOrderCertificate.order + 1 : 1

    const certificate = await prisma.certificate.create({
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

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("Error creating certificate:", error)
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 })
  }
}, "write")

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Certificate IDs are required" }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    let updateData: any = {}

    switch (action) {
      case "archive":
        updateData = { archived: true }
        break
      case "unarchive":
        updateData = { archived: false }
        break
      case "approve":
        updateData = { approved: true, updatedById: user.id }
        break
      case "unapprove":
        updateData = { approved: false, updatedById: user.id }
        break
      case "highlight":
        updateData = { highlighted: true }
        break
      case "unhighlight":
        updateData = { highlighted: false }
        break
      case "update":
        if (!data) {
          return NextResponse.json({ error: "Update data is required" }, { status: 400 })
        }
        updateData = { ...data, updatedById: user.id }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updatedCertificates = await prisma.certificate.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedCertificates.count} certificate(s)`,
      count: updatedCertificates.count,
    })
  } catch (error) {
    console.error("Error bulk updating certificates:", error)
    return NextResponse.json({ error: "Failed to update certificates" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Certificate IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedCertificates = await prisma.certificate.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedCertificates.count} certificate(s) permanently`,
        count: deletedCertificates.count,
      })
    } else {
      // Soft delete - archive the certificates
      const archivedCertificates = await prisma.certificate.updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          archived: true,
        },
      })

      return NextResponse.json({
        message: `Successfully archived ${archivedCertificates.count} certificate(s)`,
        count: archivedCertificates.count,
      })
    }
  } catch (error) {
    console.error("Error deleting certificates:", error)
    return NextResponse.json({ error: "Failed to delete certificates" }, { status: 500 })
  }
}, "delete")

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { action, categoryId, newCategoryId } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    switch (action) {
      case "reorder-category":
        if (!categoryId) {
          return NextResponse.json({ error: "Category ID is required for reordering" }, { status: 400 })
        }

        // Reset order numbers for certificates in a category
        const certificates = await prisma.certificate.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = certificates.map((cert, index) =>
          prisma.certificate.update({
            where: { id: cert.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${certificates.length} certificates in category`,
          count: certificates.length,
        })

      case "move-to-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both current and new category IDs are required" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderInNewCategory = await prisma.certificate.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const startingOrder = highestOrderInNewCategory ? highestOrderInNewCategory.order + 1 : 1

        // Get certificates to move
        const certificatesToMove = await prisma.certificate.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        // Move certificates to new category with new order
        const movePromises = certificatesToMove.map((cert, index) =>
          prisma.certificate.update({
            where: { id: cert.id },
            data: {
              categoryId: newCategoryId,
              order: startingOrder + index,
            },
          })
        )

        await Promise.all(movePromises)

        return NextResponse.json({
          message: `Successfully moved ${certificatesToMove.length} certificates to new category`,
          count: certificatesToMove.length,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing certificate operation:", error)
    return NextResponse.json({ error: "Failed to perform operation" }, { status: 500 })
  }
}, "write")