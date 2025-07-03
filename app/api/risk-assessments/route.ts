import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")

    const riskAssessments = await prisma.riskAssessment.findMany({
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

    return NextResponse.json(riskAssessments)
  } catch (error) {
    console.error("Error fetching risk assessments:", error)
    return NextResponse.json({ error: "Failed to fetch risk assessments" }, { status: 500 })
  }
})

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const nextReviewDate = formData.get("nextReviewDate") as string
    const department = formData.get("department") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !department) {
      return new NextResponse("All fields are required", { status: 400 })
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      return new NextResponse("Invalid date format", { status: 400 })
    }

    // Get the highest order in this category
    const highestOrderRiskAssessment = await prisma.riskAssessment.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderRiskAssessment ? highestOrderRiskAssessment.order + 1 : 1

    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        highlighted,
        approved,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    return NextResponse.json(riskAssessment)
  } catch (error) {
    console.error("[RISK_ASSESSMENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const user = await getUser()
    const { ids, action, data } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Risk assessment IDs are required" }, { status: 400 })
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

    const updatedRiskAssessments = await prisma.riskAssessment.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: updateData,
    })

    return NextResponse.json({
      message: `Successfully ${action}d ${updatedRiskAssessments.count} risk assessment(s)`,
      count: updatedRiskAssessments.count,
    })
  } catch (error) {
    console.error("Error bulk updating risk assessments:", error)
    return NextResponse.json({ error: "Failed to update risk assessments" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { ids, permanent } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Risk assessment IDs are required" }, { status: 400 })
    }

    if (permanent) {
      // Permanent deletion - only for admin users
      const deletedRiskAssessments = await prisma.riskAssessment.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })

      return NextResponse.json({
        message: `Successfully deleted ${deletedRiskAssessments.count} risk assessment(s) permanently`,
        count: deletedRiskAssessments.count,
      })
    } else {
      // Soft delete - archive the risk assessments
      const archivedRiskAssessments = await prisma.riskAssessment.updateMany({
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
        message: `Successfully archived ${archivedRiskAssessments.count} risk assessment(s)`,
        count: archivedRiskAssessments.count,
      })
    }
  } catch (error) {
    console.error("Error deleting risk assessments:", error)
    return NextResponse.json({ error: "Failed to delete risk assessments" }, { status: 500 })
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

        // Reset order numbers for risk assessments in a category
        const riskAssessments = await prisma.riskAssessment.findMany({
          where: { categoryId, archived: false },
          orderBy: { order: "asc" },
        })

        const updatePromises = riskAssessments.map((ra, index) =>
          prisma.riskAssessment.update({
            where: { id: ra.id },
            data: { order: index + 1 },
          })
        )

        await Promise.all(updatePromises)

        return NextResponse.json({
          message: `Successfully reordered ${riskAssessments.length} risk assessments in category`,
          count: riskAssessments.length,
        })

      case "move-category":
        if (!categoryId || !newCategoryId) {
          return NextResponse.json(
            { error: "Both category ID and new category ID are required for moving" },
            { status: 400 }
          )
        }

        // Get the highest order in the new category
        const highestOrderRiskAssessment = await prisma.riskAssessment.findFirst({
          where: { categoryId: newCategoryId },
          orderBy: { order: "desc" },
          select: { order: true },
        })

        const newOrder = highestOrderRiskAssessment ? highestOrderRiskAssessment.order + 1 : 1

        // Move risk assessments to the new category
        const movedRiskAssessments = await prisma.riskAssessment.updateMany({
          where: { categoryId },
          data: {
            categoryId: newCategoryId,
            order: newOrder,
          },
        })

        return NextResponse.json({
          message: `Successfully moved ${movedRiskAssessments.count} risk assessments to new category`,
          count: movedRiskAssessments.count,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing risk assessment action:", error)
    return NextResponse.json({ error: "Failed to perform risk assessment action" }, { status: 500 })
  }
}, "write")
