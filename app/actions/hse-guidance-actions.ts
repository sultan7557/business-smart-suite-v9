


"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "hseGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "hseGuidance") {
      const hseGuidance = await prisma.hseGuidance.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.hseGuidance.update({
        where: { id },
        data: {
          highlighted: !hseGuidance?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.hseGuidanceCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.hseGuidanceCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve HSE guidance
export async function approveHseGuidance(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.hseGuidance.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error approving HSE guidance:", error)
    return { success: false, error: "Failed to approve HSE guidance" }
  }
}

// Disapprove HSE guidance
export async function disapproveHseGuidance(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.hseGuidance.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving HSE guidance:", error)
    return { success: false, error: "Failed to disapprove HSE guidance" }
  }
}

// Archive HSE guidance or category
export async function archiveItem(id: string, type: "hseGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "hseGuidance") {
      await prisma.hseGuidance.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its HSE guidances
      await prisma.hseGuidanceCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.hseGuidance.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive HSE guidance or category
export async function unarchiveItem(id: string, type: "hseGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "hseGuidance") {
      await prisma.hseGuidance.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its HSE guidances
      await prisma.hseGuidanceCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.hseGuidance.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete HSE guidance or category
export async function deleteItem(id: string, type: "hseGuidance" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "hseGuidance") {
      // First delete all HSE guidance versions
      await prisma.hseGuidanceVersion.deleteMany({
        where: { hseGuidanceId: id },
      })

      // Then delete the HSE guidance
      await prisma.hseGuidance.delete({
        where: { id },
      })
    } else {
      // For categories, first get all HSE guidances in this category
      const hseGuidances = await prisma.hseGuidance.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all HSE guidances in this category
      await prisma.hseGuidanceVersion.deleteMany({
        where: { hseGuidanceId: { in: hseGuidances.map((hg) => hg.id) } },
      })

      // Then delete all HSE guidances
      await prisma.hseGuidance.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.hseGuidanceCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder HSE guidances within a category (for drag and drop)
export async function reorderHseGuidances(categoryId: string, hseGuidanceIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each HSE guidance
    const updatePromises = hseGuidanceIds.map((id, index) =>
      prisma.hseGuidance.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error reordering HSE guidances:", error)
    return { success: false, error: "Failed to reorder HSE guidances" }
  }
}

// Add HSE guidance
export async function addHseGuidance(data: {
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  department: string
  content?: string
  categoryId: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderHseGuidance = await prisma.hseGuidance.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderHseGuidance ? highestOrderHseGuidance.order + 1 : 0

    const hseGuidance = await prisma.hseGuidance.create({
      data: {
        title: data.title,
        version: data.version,
        reviewDate: new Date(data.reviewDate),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        department: data.department,
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/hse-guidance")
    return { success: true, hseGuidance }
  } catch (error) {
    console.error("Error adding HSE guidance:", error)
    return { success: false, error: "Failed to add HSE guidance" }
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
    const highestOrderCategory = await prisma.hseGuidanceCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.hseGuidanceCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/hse-guidance")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit HSE guidance
export async function editHseGuidance(
  id: string,
  data: {
    title?: string
    version?: string
    reviewDate?: Date
    nextReviewDate?: Date
    department?: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const hseGuidance = await prisma.hseGuidance.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/hse-guidance")
    return { success: true, hseGuidance }
  } catch (error) {
    console.error("Error editing HSE guidance:", error)
    return { success: false, error: "Failed to edit HSE guidance" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.hseGuidanceCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/hse-guidance")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Add HSE guidance review
export async function addHseGuidanceReview(
  hseGuidanceId: string,
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

    const review = await prisma.hseGuidanceReview.create({
      data: {
        hseGuidanceId,
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

    revalidatePath(`/hse-guidance/${hseGuidanceId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding HSE guidance review:", error)
    return { success: false, error: "Failed to add HSE guidance review" }
  }
}

// Delete HSE guidance review
export async function deleteHseGuidanceReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.hseGuidanceReview.delete({
      where: { id },
    })

    revalidatePath("/hse-guidance")
    return { success: true }
  } catch (error) {
    console.error("Error deleting HSE guidance review:", error)
    return { success: false, error: "Failed to delete HSE guidance review" }
  }
}

// Get HSE guidance reviews
export async function getHseGuidanceReviews(hseGuidanceId: string) {
  try {
    const reviews = await prisma.hseGuidanceReview.findMany({
      where: { hseGuidanceId },
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
    console.error("Error fetching HSE guidance reviews:", error)
    return { success: false, error: "Failed to fetch HSE guidance reviews" }
  }
}

// Add HSE guidance version
export async function addHseGuidanceVersion(hseGuidanceId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const hseGuidanceVersion = await prisma.hseGuidanceVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        hseGuidanceId,
        documentId,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/hse-guidance/${hseGuidanceId}`)
    return { success: true, hseGuidanceVersion }
  } catch (error) {
    console.error("Error adding HSE guidance version:", error)
    return { success: false, error: "Failed to add version" }
  }
}
