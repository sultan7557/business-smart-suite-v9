



"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "managementReview" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "managementReview") {
      const managementReview = await prisma.managementReview.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.managementReview.update({
        where: { id },
        data: {
          highlighted: !managementReview?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.managementReviewCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.managementReviewCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve management review
export async function approveManagementReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.managementReview.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error approving management review:", error)
    return { success: false, error: "Failed to approve management review" }
  }
}

// Disapprove management review
export async function disapproveManagementReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.managementReview.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving management review:", error)
    return { success: false, error: "Failed to disapprove management review" }
  }
}

// Archive management review or category
export async function archiveItem(id: string, type: "managementReview" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "managementReview") {
      await prisma.managementReview.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its management reviews
      await prisma.managementReviewCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.managementReview.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive management review or category
export async function unarchiveItem(id: string, type: "managementReview" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "managementReview") {
      await prisma.managementReview.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its management reviews
      await prisma.managementReviewCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.managementReview.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete management review or category
export async function deleteItem(id: string, type: "managementReview" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "managementReview") {
      // First delete all management review versions
      await prisma.managementReviewVersion.deleteMany({
        where: { managementReviewId: id },
      })

      // Then delete the management review
      await prisma.managementReview.delete({
        where: { id },
      })
    } else {
      // For categories, first get all management reviews in this category
      const managementReviews = await prisma.managementReview.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all management reviews in this category
      await prisma.managementReviewVersion.deleteMany({
        where: { managementReviewId: { in: managementReviews.map((mr) => mr.id) } },
      })

      // Then delete all management reviews
      await prisma.managementReview.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.managementReviewCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder management reviews within a category (for drag and drop)
export async function reorderManagementReviews(categoryId: string, managementReviewIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each management review
    const updatePromises = managementReviewIds.map((id, index) =>
      prisma.managementReview.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/management-reviews")
    return { success: true }
  } catch (error) {
    console.error("Error reordering management reviews:", error)
    return { success: false, error: "Failed to reorder management reviews" }
  }
}

// Add management review
export async function addManagementReview(data: {
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  location: string
  content: string
  categoryId: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderManagementReview = await prisma.managementReview.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderManagementReview ? highestOrderManagementReview.order + 1 : 0

    const managementReview = await prisma.managementReview.create({
      data: {
        title: data.title,
        version: data.version,
        reviewDate: new Date(data.reviewDate),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        location: data.location,
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/management-reviews")
    return { success: true, managementReview }
  } catch (error) {
    console.error("Error adding management review:", error)
    return { success: false, error: "Failed to add management review" }
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
    const highestOrderCategory = await prisma.managementReviewCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.managementReviewCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/management-reviews")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit management review
export async function editManagementReview(
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

    const managementReview = await prisma.managementReview.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/management-reviews")
    return { success: true, managementReview }
  } catch (error) {
    console.error("Error editing management review:", error)
    return { success: false, error: "Failed to edit management review" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.managementReviewCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/management-reviews")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Get management review reviews
export async function getManagementReviewReviews(managementReviewId: string) {
  try {
    const reviews = await prisma.managementReviewReview.findMany({
      where: { managementReviewId },
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
    console.error("Error fetching management review reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add management review review
export async function addManagementReviewReview(
  managementReviewId: string,
  data: {
    reviewerName: string
    reviewDate: Date
    nextReviewDate?: Date
    details: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const review = await prisma.managementReviewReview.create({
      data: {
        managementReviewId,
        reviewerName: data.reviewerName,
        reviewDate: data.reviewDate,
        nextReviewDate: data.nextReviewDate,
        details: data.details,
        reviewedById: user.id as string,
      },
    })

    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding management review review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete management review review
export async function deleteManagementReviewReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.managementReviewReview.delete({
      where: { id: reviewId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting management review review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

// Add management review version
export async function addManagementReviewVersion(managementReviewId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const managementReviewVersion = await prisma.managementReviewVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        managementReviewId,
        createdById: user.id,
        documentId,
      },
    })

    revalidatePath(`/management-reviews/${managementReviewId}`)
    return { success: true, managementReviewVersion }
  } catch (error) {
    console.error("Error adding management review version:", error)
    return { success: false, error: "Failed to add management review version" }
  }
}

