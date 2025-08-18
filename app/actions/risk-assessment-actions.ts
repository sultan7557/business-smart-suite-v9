


"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Get risk assessment reviews
export async function getRiskAssessmentReviews(riskAssessmentId: string) {
  try {
    const reviews = await prisma.riskAssessmentReview.findMany({
      where: { riskAssessmentId },
      orderBy: { reviewDate: "desc" },
      include: {
        reviewedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching risk assessment reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add risk assessment review
export async function addRiskAssessmentReview(
  riskAssessmentId: string,
  data: {
    details: string
    reviewDate: Date
    nextReviewDate?: Date
    reviewerName: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const review = await prisma.riskAssessmentReview.create({
      data: {
        ...data,
        riskAssessmentId,
        reviewedById: user.id as string,
      },
    })

    revalidatePath(`/risk-assessments/${riskAssessmentId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding risk assessment review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete risk assessment review
export async function deleteRiskAssessmentReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.riskAssessmentReview.delete({
      where: { id: reviewId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting risk assessment review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

// Add risk assessment version
export async function addRiskAssessmentVersion(riskAssessmentId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const riskAssessmentVersion = await prisma.riskAssessmentVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        riskAssessmentId,
        documentId,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/risk-assessments/${riskAssessmentId}`)
    return { success: true, riskAssessmentVersion }
  } catch (error) {
    console.error("Error adding risk assessment version:", error)
    return { success: false, error: "Failed to add version" }
  }
}

// Toggle highlight status
export async function toggleHighlight(id: string, type: "riskAssessment" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "riskAssessment") {
      const riskAssessment = await prisma.riskAssessment.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.riskAssessment.update({
        where: { id },
        data: {
          highlighted: !riskAssessment?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      // Categories don't have highlighted property in current schema
      // This functionality will be added after database migration
      throw new Error("Highlight functionality not available for categories yet")
    }

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve risk assessment
export async function approveRiskAssessment(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.riskAssessment.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error approving risk assessment:", error)
    return { success: false, error: "Failed to approve risk assessment" }
  }
}

// Disapprove risk assessment
export async function disapproveRiskAssessment(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.riskAssessment.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving risk assessment:", error)
    return { success: false, error: "Failed to disapprove risk assessment" }
  }
}

// Archive risk assessment or category
export async function archiveItem(id: string, type: "riskAssessment" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "riskAssessment") {
      await prisma.riskAssessment.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its risk assessments
      await prisma.riskAssessmentCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.riskAssessment.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive risk assessment or category
export async function unarchiveItem(id: string, type: "riskAssessment" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "riskAssessment") {
      await prisma.riskAssessment.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its risk assessments
      await prisma.riskAssessmentCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.riskAssessment.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete risk assessment or category
export async function deleteItem(id: string, type: "riskAssessment" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "riskAssessment") {
      // First delete all risk assessment versions
      await prisma.riskAssessmentVersion.deleteMany({
        where: { riskAssessmentId: id },
      })

      // Then delete the risk assessment
      await prisma.riskAssessment.delete({
        where: { id },
      })
    } else {
      // For categories, first get all risk assessments in this category
      const riskAssessments = await prisma.riskAssessment.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all risk assessments in this category
      await prisma.riskAssessmentVersion.deleteMany({
        where: { riskAssessmentId: { in: riskAssessments.map((ra) => ra.id) } },
      })

      // Then delete all risk assessments
      await prisma.riskAssessment.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.riskAssessmentCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder risk assessments within a category (for drag and drop)
export async function reorderRiskAssessments(categoryId: string, riskAssessmentIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each risk assessment
    const updatePromises = riskAssessmentIds.map((id, index) =>
      prisma.riskAssessment.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/risk-assessments")
    return { success: true }
  } catch (error) {
    console.error("Error reordering risk assessments:", error)
    return { success: false, error: "Failed to reorder risk assessments" }
  }
}

// Add risk assessment
export async function addRiskAssessment(data: {
  title: string
  version: string
  reviewDate: string
  department: string
  content: string
  categoryId: string
  whoMayBeHarmed?: any
  ppeRequirements?: any
  assessmentDetails?: any
  additionalRequirements?: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderRiskAssessment = await prisma.riskAssessment.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderRiskAssessment ? highestOrderRiskAssessment.order + 1 : 0

    // Create the risk assessment with template data
    const riskAssessment = await prisma.riskAssessment.create({
      data: {
        title: data.title,
        version: data.version,
        reviewDate: new Date(data.reviewDate),
        department: data.department,
        content: data.content || "",
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
        additionalRequirements: data.additionalRequirements,
        whoMayBeHarmed: data.whoMayBeHarmed ? {
          create: data.whoMayBeHarmed
        } : undefined,
        ppeRequirements: data.ppeRequirements ? {
          create: data.ppeRequirements
        } : undefined,
        assessmentDetails: data.assessmentDetails ? {
          create: data.assessmentDetails.map((detail: any, index: number) => ({
            ...detail,
            order: index + 1
          }))
        } : undefined
      },
    })

    revalidatePath("/risk-assessments")
    return { success: true, riskAssessment }
  } catch (error) {
    console.error("Error adding risk assessment:", error)
    return { success: false, error: "Failed to add risk assessment" }
  }
}

// Add category
export async function addCategory(title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order
    const highestOrderCategory = await prisma.riskAssessmentCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.riskAssessmentCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/risk-assessments")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.riskAssessmentCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/risk-assessments")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}
