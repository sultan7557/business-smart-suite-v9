

"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Create Corrective Action
export async function createCorrectiveAction(formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const version = formData.get("version") as string
  const issueDate = formData.get("issueDate") as string
  const location = formData.get("location") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("categoryId") as string
  const highlighted = formData.has("highlighted")
  const approved = formData.has("approved")

  if (!title || !version || !issueDate || !location || !categoryId) {
    return { error: "Missing required fields" }
  }

  try {
    // Get the highest order in this category
    const highestOrderCorrectiveAction = await prisma.correctiveAction.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCorrectiveAction ? highestOrderCorrectiveAction.order + 1 : 1

    const correctiveAction = await prisma.correctiveAction.create({
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        createdById: user.id,
        highlighted,
        approved,
        order: newOrder,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true, correctiveAction }
  } catch (error) {
    console.error("Error creating corrective action:", error)
    return { error: "Failed to create corrective action" }
  }
}

export async function updateCorrectiveAction(correctiveActionId: string, formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const version = formData.get("version") as string
  const issueDate = formData.get("issueDate") as string
  const location = formData.get("location") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("categoryId") as string
  const highlighted = formData.has("highlighted")
  const approved = formData.has("approved")

  if (!title || !version || !issueDate || !location || !categoryId) {
    return { error: "Missing required fields" }
  }

  try {
    const correctiveAction = await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        updatedById: user.id,
        highlighted,
        approved,
      },
    })

    revalidatePath("/corrective-actions")
    revalidatePath(`/corrective-actions/${correctiveActionId}`)
    return { success: true, correctiveAction }
  } catch (error) {
    console.error("Error updating corrective action:", error)
    return { error: "Failed to update corrective action" }
  }
}

export async function deleteCorrectiveAction(correctiveActionId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // First delete all corrective action versions
    await prisma.correctiveActionVersion.deleteMany({
      where: { correctiveActionId },
    })

    // Then delete the corrective action
    await prisma.correctiveAction.delete({
      where: { id: correctiveActionId },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting corrective action:", error)
    return { error: "Failed to delete corrective action" }
  }
}

export async function archiveCorrectiveAction(correctiveActionId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        archived: true,
        updatedById: user.id,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error archiving corrective action:", error)
    return { error: "Failed to archive corrective action" }
  }
}

export async function unarchiveCorrectiveAction(correctiveActionId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        archived: false,
        updatedById: user.id,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving corrective action:", error)
    return { error: "Failed to unarchive corrective action" }
  }
}

// Toggle highlight status
export async function toggleHighlight(id: string, type: "correctiveAction" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "correctiveAction") {
      const correctiveAction = await prisma.correctiveAction.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.correctiveAction.update({
        where: { id },
        data: {
          highlighted: !correctiveAction?.highlighted,
          updatedById: user.id,
        },
      })
    } else {
      const category = await prisma.correctiveActionCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.correctiveActionCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve/unapprove corrective action (toggle)
export async function approveCorrectiveAction(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id },
      select: { approved: true },
    })

    await prisma.correctiveAction.update({
      where: { id },
      data: {
        approved: !correctiveAction?.approved,
        updatedById: user.id,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error toggling approval:", error)
    return { success: false, error: "Failed to toggle approval status" }
  }
}

// Archive corrective action or category
export async function archiveItem(id: string, type: "correctiveAction" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "correctiveAction") {
      await prisma.correctiveAction.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id,
        },
      })
    } else {
      // For categories, we archive the category and all its corrective actions
      await prisma.correctiveActionCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.correctiveAction.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id,
        },
      })
    }

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive corrective action or category
export async function unarchiveItem(id: string, type: "correctiveAction" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "correctiveAction") {
      await prisma.correctiveAction.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id,
        },
      })
    } else {
      // For categories, we unarchive the category and all its corrective actions
      await prisma.correctiveActionCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.correctiveAction.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id,
        },
      })
    }

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete corrective action or category
export async function deleteItem(id: string, type: "correctiveAction" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "correctiveAction") {
      // First delete all corrective action versions
      await prisma.correctiveActionVersion.deleteMany({
        where: { correctiveActionId: id },
      })

      // Then delete the corrective action
      await prisma.correctiveAction.delete({
        where: { id },
      })
    } else {
      // For categories, first get all corrective actions in this category
      const correctiveActions = await prisma.correctiveAction.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all corrective actions in this category
      await prisma.correctiveActionVersion.deleteMany({
        where: { correctiveActionId: { in: correctiveActions.map((ca) => ca.id) } },
      })

      // Then delete all corrective actions
      await prisma.correctiveAction.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.correctiveActionCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder corrective action or category to a specific position
export async function reorderItem(id: string, type: "correctiveAction" | "category", newPosition: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "correctiveAction") {
      const correctiveAction = await prisma.correctiveAction.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!correctiveAction) {
        throw new Error("Corrective action not found")
      }

      // Get all corrective actions in the same category, ordered by their current order
      const allCorrectiveActions = await prisma.correctiveAction.findMany({
        where: {
          categoryId: correctiveAction.categoryId,
          archived: false,
        },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allCorrectiveActions.findIndex((ca) => ca.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedCorrectiveActions = [...allCorrectiveActions]
      const [movedCorrectiveAction] = reorderedCorrectiveActions.splice(currentPosition, 1)
      reorderedCorrectiveActions.splice(newPosition, 0, movedCorrectiveAction)

      // Update all corrective actions with their new order
      const updatePromises = reorderedCorrectiveActions.map((correctiveAction, index) =>
        prisma.correctiveAction.update({
          where: { id: correctiveAction.id },
          data: {
            order: index + 1,
            ...(correctiveAction.id === id ? { updatedById: user.id } : {}),
          },
        }),
      )

      await Promise.all(updatePromises)
    } else {
      const category = await prisma.correctiveActionCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get all categories, ordered by their current order
      const allCategories = await prisma.correctiveActionCategory.findMany({
        where: { archived: false },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allCategories.findIndex((c) => c.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedCategories = [...allCategories]
      const [movedCategory] = reorderedCategories.splice(currentPosition, 1)
      reorderedCategories.splice(newPosition, 0, movedCategory)

      // Update all categories with their new order
      const updatePromises = reorderedCategories.map((category, index) =>
        prisma.correctiveActionCategory.update({
          where: { id: category.id },
          data: { order: index + 1 },
        }),
      )

      await Promise.all(updatePromises)
    }

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Add new corrective action
export async function addCorrectiveAction(categoryId: string, title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderCorrectiveAction = await prisma.correctiveAction.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCorrectiveAction ? highestOrderCorrectiveAction.order + 1 : 1

    const newCorrectiveAction = await prisma.correctiveAction.create({
      data: {
        title,
        version: "1",
        issueDate: new Date(),
        location: "Default Location",
        approved: false,
        highlighted: false,
        categoryId,
        createdById: user.id,
        order: newOrder,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true, correctiveAction: newCorrectiveAction }
  } catch (error) {
    console.error("Error adding corrective action:", error)
    return { success: false, error: "Failed to add corrective action" }
  }
}

// Add new category
export async function addCategory(title: string) {
  try {
    // Get the highest order
    const highestOrderCategory = await prisma.correctiveActionCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    await prisma.correctiveActionCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit corrective action
export async function editCorrectiveAction(
  id: string,
  data: {
    title?: string
    version?: string
    issueDate?: Date
    location?: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.correctiveAction.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id,
      },
    })

    revalidatePath(`/corrective-actions/${id}`)
    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error editing corrective action:", error)
    return { success: false, error: "Failed to edit corrective action" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    await prisma.correctiveActionCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

export async function getCorrectiveActionCategories() {
  try {
    const categories = await prisma.correctiveActionCategory.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
    })
    return categories
  } catch (error) {
    console.error("Error fetching corrective action categories:", error)
    return []
  }
}

export async function createCorrectiveActionCategory(formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const highlighted = formData.has("highlighted")

  if (!title) {
    return { error: "Title is required" }
  }

  try {
    // Get the highest order
    const highestOrderCategory = await prisma.correctiveActionCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.correctiveActionCategory.create({
      data: {
        title,
        highlighted,
        order: newOrder,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating corrective action category:", error)
    return { error: "Failed to create corrective action category" }
  }
}

export async function updateCorrectiveActionCategory(categoryId: string, formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const highlighted = formData.has("highlighted")

  if (!title) {
    return { error: "Title is required" }
  }

  try {
    const category = await prisma.correctiveActionCategory.update({
      where: { id: categoryId },
      data: {
        title,
        highlighted,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true, category }
  } catch (error) {
    console.error("Error updating corrective action category:", error)
    return { error: "Failed to update corrective action category" }
  }
}

export async function deleteCorrectiveActionCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // For categories, first get all corrective actions in this category
    const correctiveActions = await prisma.correctiveAction.findMany({
      where: { categoryId },
      select: { id: true },
    })

    // Delete all versions for all corrective actions in this category
    await prisma.correctiveActionVersion.deleteMany({
      where: { correctiveActionId: { in: correctiveActions.map((ca) => ca.id) } },
    })

    // Then delete all corrective actions
    await prisma.correctiveAction.deleteMany({
      where: { categoryId },
    })

    // Finally delete the category
    await prisma.correctiveActionCategory.delete({
      where: { id: categoryId },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting corrective action category:", error)
    return { error: "Failed to delete corrective action category" }
  }
}

export async function archiveCorrectiveActionCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.correctiveActionCategory.update({
      where: { id: categoryId },
      data: {
        archived: true,
      },
    })

    // Also archive all corrective actions in this category
    await prisma.correctiveAction.updateMany({
      where: { categoryId },
      data: {
        archived: true,
        updatedById: user.id,
      },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error archiving corrective action category:", error)
    return { error: "Failed to archive corrective action category" }
  }
}

export async function unarchiveCorrectiveActionCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.correctiveActionCategory.update({
      where: { id: categoryId },
      data: {
        archived: false,
      },
    })

    // Also unarchive all corrective actions in this category
    await prisma.correctiveAction.updateMany({
      where: { categoryId },
      data: { archived: false },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving corrective action category:", error)
    return { error: "Failed to unarchive corrective action category" }
  }
}

export async function addCorrectiveActionReview(correctiveActionId: string, formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const details = formData.get("details") as string
  const reviewDate = formData.get("reviewDate") as string
  const nextReviewDate = formData.get("nextReviewDate") as string
  const reviewerName = formData.get("reviewerName") as string

  if (!details || !reviewDate) {
    return { error: "Missing required fields" }
  }

  try {
    const review = await prisma.correctiveActionReview.create({
      data: {
        correctiveActionId,
        reviewedById: user.id,
        reviewerName,
        details,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
      },
    })

    revalidatePath(`/corrective-actions/${correctiveActionId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding corrective action review:", error)
    return { error: "Failed to add review" }
  }
}

export async function deleteCorrectiveActionReview(reviewId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.correctiveActionReview.delete({
      where: { id: reviewId },
    })

    revalidatePath("/corrective-actions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting corrective action review:", error)
    return { error: "Failed to delete review" }
  }
}

export async function getCorrectiveActionReviews(correctiveActionId: string) {
  try {
    const reviews = await prisma.correctiveActionReview.findMany({
      where: { correctiveActionId },
      include: {
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { reviewDate: "desc" },
    })
    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching corrective action reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}
