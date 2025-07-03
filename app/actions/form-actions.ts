



"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Form management functions
export async function createForm(formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const version = formData.get("version") as string
  const issueDate = formData.get("issueDate") as string
  const location = formData.get("location") as string
  const content = formData.get("content") as string
  const retentionPeriod = formData.get("retentionPeriod") as string
  const categoryId = formData.get("categoryId") as string
  const highlighted = formData.has("highlighted")
  const approved = formData.has("approved")

  if (!title || !version || !issueDate || !location || !categoryId) {
    return { error: "Missing required fields" }
  }

  try {
    // Get the highest order in this category
    const highestOrderForm = await prisma.form.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderForm ? highestOrderForm.order + 1 : 1

    const form = await prisma.form.create({
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        retentionPeriod,
        categoryId,
        createdById: user.id,
        highlighted,
        approved,
        order: newOrder,
      },
    })

    revalidatePath("/forms")
    return { success: true, form }
  } catch (error) {
    console.error("Error creating form:", error)
    return { error: "Failed to create form" }
  }
}

export async function updateForm(formId: string, formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const title = formData.get("title") as string
  const version = formData.get("version") as string
  const issueDate = formData.get("issueDate") as string
  const location = formData.get("location") as string
  const content = formData.get("content") as string
  const retentionPeriod = formData.get("retentionPeriod") as string
  const categoryId = formData.get("categoryId") as string
  const highlighted = formData.has("highlighted")
  const approved = formData.has("approved")

  if (!title || !version || !issueDate || !location || !categoryId) {
    return { error: "Missing required fields" }
  }

  try {
    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        retentionPeriod,
        categoryId,
        updatedById: user.id,
        highlighted,
        approved,
      },
    })

    revalidatePath("/forms")
    revalidatePath(`/forms/${formId}`)
    return { success: true, form }
  } catch (error) {
    console.error("Error updating form:", error)
    return { error: "Failed to update form" }
  }
}

export async function deleteForm(formId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // First delete all form versions
    await prisma.formVersion.deleteMany({
      where: { formId },
    })

    await prisma.form.delete({
      where: { id: formId },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error deleting form:", error)
    return { error: "Failed to delete form" }
  }
}

export async function archiveForm(formId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.form.update({
      where: { id: formId },
      data: {
        archived: true,
        updatedById: user.id,
      },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error archiving form:", error)
    return { error: "Failed to archive form" }
  }
}

export async function unarchiveForm(formId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.form.update({
      where: { id: formId },
      data: {
        archived: false,
        updatedById: user.id,
      },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving form:", error)
    return { error: "Failed to unarchive form" }
  }
}

// Approve form
export async function approveForm(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.form.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error approving form:", error)
    return { success: false, error: "Failed to approve form" }
  }
}

export async function addFormVersion(formId: string, formData: FormData) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const version = formData.get("version") as string
  const issueDate = formData.get("issueDate") as string
  const notes = formData.get("notes") as string
  const documentId = (formData.get("documentId") as string) || null

  if (!version || !issueDate) {
    return { error: "Missing required fields" }
  }

  try {
    const formVersion = await prisma.formVersion.create({
      data: {
        formId,
        version,
        issueDate: new Date(issueDate),
        notes,
        createdById: user.id,
        documentId: documentId || undefined,
      },
    })

    // Update the form with the new version
    await prisma.form.update({
      where: { id: formId },
      data: {
        version,
        issueDate: new Date(issueDate),
        updatedById: user.id,
      },
    })

    revalidatePath(`/forms/${formId}`)
    return { success: true, formVersion }
  } catch (error) {
    console.error("Error adding form version:", error)
    return { error: "Failed to add form version" }
  }
}

export async function getFormCategories() {
  try {
    const categories = await prisma.formCategory.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
    })
    return categories
  } catch (error) {
    console.error("Error fetching form categories:", error)
    return []
  }
}

export async function createFormCategory(formData: FormData) {
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
    const highestOrderCategory = await prisma.formCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.formCategory.create({
      data: {
        title,
        highlighted,
        order: newOrder,
      },
    })

    revalidatePath("/forms")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating form category:", error)
    return { error: "Failed to create form category" }
  }
}

export async function updateFormCategory(categoryId: string, formData: FormData) {
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
    const category = await prisma.formCategory.update({
      where: { id: categoryId },
      data: {
        title,
        highlighted,
      },
    })

    revalidatePath("/forms")
    return { success: true, category }
  } catch (error) {
    console.error("Error updating form category:", error)
    return { error: "Failed to update form category" }
  }
}

export async function deleteFormCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // For categories, first get all forms in this category
    const forms = await prisma.form.findMany({
      where: { categoryId },
      select: { id: true },
    })

    // Delete all versions for all forms in this category
    await prisma.formVersion.deleteMany({
      where: { formId: { in: forms.map((f) => f.id) } },
    })

    // Then delete all forms
    await prisma.form.deleteMany({
      where: { categoryId },
    })

    // Finally delete the category
    await prisma.formCategory.delete({
      where: { id: categoryId },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error deleting form category:", error)
    return { error: "Failed to delete form category" }
  }
}

export async function archiveFormCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.formCategory.update({
      where: { id: categoryId },
      data: {
        archived: true,
      },
    })

    // Also archive all forms in this category
    await prisma.form.updateMany({
      where: { categoryId },
      data: {
        archived: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error archiving form category:", error)
    return { error: "Failed to archive form category" }
  }
}

export async function unarchiveFormCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.formCategory.update({
      where: { id: categoryId },
      data: {
        archived: false,
      },
    })

    // Also unarchive all forms in this category
    await prisma.form.updateMany({
      where: { categoryId },
      data: { archived: false },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving form category:", error)
    return { error: "Failed to unarchive form category" }
  }
}

// UI-related functions
export async function toggleHighlight(id: string, type: "form" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "form") {
      const form = await prisma.form.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.form.update({
        where: { id },
        data: {
          highlighted: !form?.highlighted,
          updatedById: user.id,
        },
      })
    } else {
      const category = await prisma.formCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.formCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Reorder form or category to a specific position
export async function reorderItem(id: string, type: "form" | "category", newPosition: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "form") {
      const form = await prisma.form.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!form) {
        throw new Error("Form not found")
      }

      // Get all forms in the same category, ordered by their current order
      const allForms = await prisma.form.findMany({
        where: {
          categoryId: form.categoryId,
          archived: false,
        },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allForms.findIndex((f) => f.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedForms = [...allForms]
      const [movedForm] = reorderedForms.splice(currentPosition, 1)
      reorderedForms.splice(newPosition, 0, movedForm)

      // Update all forms with their new order
      const updatePromises = reorderedForms.map((form, index) =>
        prisma.form.update({
          where: { id: form.id },
          data: {
            order: index + 1,
            ...(form.id === id ? { updatedById: user.id as string } : {}),
          },
        }),
      )

      await Promise.all(updatePromises)
    } else {
      const category = await prisma.formCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get all categories, ordered by their current order
      const allCategories = await prisma.formCategory.findMany({
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
        prisma.formCategory.update({
          where: { id: category.id },
          data: { order: index + 1 },
        }),
      )

      await Promise.all(updatePromises)
    }

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Add review
export async function addFormReview(
  formId: string,
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

    const review = await prisma.formReview.create({
      data: {
        formId,
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

    revalidatePath(`/forms/${formId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding form review:", error)
    return { success: false, error: "Failed to add form review" }
  }
}

// Delete review
export async function deleteFormReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.formReview.delete({
      where: { id },
    })

    revalidatePath("/forms")
    return { success: true }
  } catch (error) {
    console.error("Error deleting form review:", error)
    return { success: false, error: "Failed to delete form review" }
  }
}

// Get reviews
export async function getFormReviews(formId: string) {
  try {
    const reviews = await prisma.formReview.findMany({
      where: { formId },
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
    console.error("Error fetching form reviews:", error)
    return { success: false, error: "Failed to fetch form reviews" }
  }
}
