

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "environmentalGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "environmentalGuidance") {
      const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.environmentalGuidance.update({
        where: { id },
        data: {
          highlighted: !environmentalGuidance?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.environmentalGuidanceCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.environmentalGuidanceCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve environmental guidance
export async function approveEnvironmentalGuidance(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.environmentalGuidance.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error approving environmental guidance:", error)
    return { success: false, error: "Failed to approve environmental guidance" }
  }
}

// Disapprove environmental guidance
export async function disapproveEnvironmentalGuidance(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.environmentalGuidance.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving environmental guidance:", error)
    return { success: false, error: "Failed to disapprove environmental guidance" }
  }
}

// Archive environmental guidance or category
export async function archiveItem(id: string, type: "environmentalGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "environmentalGuidance") {
      await prisma.environmentalGuidance.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its environmental guidances
      await prisma.environmentalGuidanceCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.environmentalGuidance.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive environmental guidance or category
export async function unarchiveItem(id: string, type: "environmentalGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "environmentalGuidance") {
      await prisma.environmentalGuidance.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its environmental guidances
      await prisma.environmentalGuidanceCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.environmentalGuidance.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete environmental guidance or category
export async function deleteItem(id: string, type: "environmentalGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "environmentalGuidance") {
      // First delete all environmental guidance versions
      await prisma.environmentalGuidanceVersion.deleteMany({
        where: { environmentalGuidanceId: id },
      })

      // Delete all reviews
      await prisma.environmentalGuidanceReview.deleteMany({
        where: { environmentalGuidanceId: id },
      })

      // Then delete the environmental guidance
      await prisma.environmentalGuidance.delete({
        where: { id },
      })
    } else {
      // For categories, first get all environmental guidances in this category
      const environmentalGuidances = await prisma.environmentalGuidance.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all environmental guidances in this category
      await prisma.environmentalGuidanceVersion.deleteMany({
        where: { environmentalGuidanceId: { in: environmentalGuidances.map((eg) => eg.id) } },
      })

      // Delete all reviews for all environmental guidances in this category
      await prisma.environmentalGuidanceReview.deleteMany({
        where: { environmentalGuidanceId: { in: environmentalGuidances.map((eg) => eg.id) } },
      })

      // Then delete all environmental guidances
      await prisma.environmentalGuidance.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.environmentalGuidanceCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder environmental guidances within a category (for drag and drop)
export async function reorderEnvironmentalGuidances(categoryId: string, environmentalGuidanceIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each environmental guidance
    const updatePromises = environmentalGuidanceIds.map((id, index) =>
      prisma.environmentalGuidance.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error reordering environmental guidances:", error)
    return { success: false, error: "Failed to reorder environmental guidances" }
  }
}

// Add environmental guidance
export async function addEnvironmentalGuidance(data: {
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  location: string
  content?: string
  categoryId: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderEnvironmentalGuidance = await prisma.environmentalGuidance.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderEnvironmentalGuidance ? highestOrderEnvironmentalGuidance.order + 1 : 0

    const environmentalGuidance = await prisma.environmentalGuidance.create({
      data: {
        title: data.title,
        version: data.version,
        reviewDate: new Date(data.reviewDate),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        department: data.location, // Using department field to store location
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/environmental-guidance")
    return { success: true, environmentalGuidance }
  } catch (error) {
    console.error("Error adding environmental guidance:", error)
    return { success: false, error: "Failed to add environmental guidance" }
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
    const highestOrderCategory = await prisma.environmentalGuidanceCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.environmentalGuidanceCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/environmental-guidance")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit environmental guidance
export async function editEnvironmentalGuidance(
  id: string,
  data: {
    title?: string
    version?: string
    reviewDate?: Date
    nextReviewDate?: Date
    location?: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const updateData: any = {
      updatedById: user.id as string,
    }

    if (data.title) updateData.title = data.title
    if (data.version) updateData.version = data.version
    if (data.reviewDate) updateData.reviewDate = data.reviewDate
    if (data.nextReviewDate) updateData.nextReviewDate = data.nextReviewDate
    if (data.location) updateData.department = data.location // Using department field to store location

    const environmentalGuidance = await prisma.environmentalGuidance.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/environmental-guidance")
    return { success: true, environmentalGuidance }
  } catch (error) {
    console.error("Error editing environmental guidance:", error)
    return { success: false, error: "Failed to edit environmental guidance" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.environmentalGuidanceCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/environmental-guidance")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Add environmental guidance review
export async function addEnvironmentalGuidanceReview(
  environmentalGuidanceId: string,
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

    const review = await prisma.environmentalGuidanceReview.create({
      data: {
        environmentalGuidanceId,
        reviewedById: user.id,
        reviewerName: data.reviewerName,
        details: data.details,
        reviewDate: data.reviewDate,
        nextReviewDate: data.nextReviewDate,
      },
      include: {
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    revalidatePath(`/environmental-guidance/${environmentalGuidanceId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding environmental guidance review:", error)
    return { success: false, error: "Failed to add environmental guidance review" }
  }
}

// Delete environmental guidance review
export async function deleteEnvironmentalGuidanceReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.environmentalGuidanceReview.delete({
      where: { id },
    })

    revalidatePath("/environmental-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error deleting environmental guidance review:", error)
    return { success: false, error: "Failed to delete environmental guidance review" }
  }
}

// Get environmental guidance reviews
export async function getEnvironmentalGuidanceReviews(environmentalGuidanceId: string) {
  try {
    const reviews = await prisma.environmentalGuidanceReview.findMany({
      where: { environmentalGuidanceId },
      orderBy: { reviewDate: "desc" },
      include: {
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching environmental guidance reviews:", error)
    return { success: false, error: "Failed to fetch environmental guidance reviews" }
  }
}

// Add environmental guidance version
export async function addEnvironmentalGuidanceVersion(environmentalGuidanceId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const environmentalGuidanceVersion = await prisma.environmentalGuidanceVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        environmentalGuidanceId,
        documentId,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/environmental-guidance/${environmentalGuidanceId}`)
    return { success: true, environmentalGuidanceVersion }
  } catch (error) {
    console.error("Error adding environmental guidance version:", error)
    return { success: false, error: "Failed to add version" }
  }
}

