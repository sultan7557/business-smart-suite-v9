"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Existing functions
export async function createProcedure(formData: FormData) {
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
    const procedure = await prisma.procedure.create({
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
      },
    })

    revalidatePath("/procedures")
    return { success: true, procedure }
  } catch (error) {
    console.error("Error creating procedure:", error)
    return { error: "Failed to create procedure" }
  }
}

export async function updateProcedure(procedureId: string, formData: FormData) {
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
    const procedure = await prisma.procedure.update({
      where: { id: procedureId },
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

    revalidatePath("/procedures")
    revalidatePath(`/procedures/${procedureId}`)
    return { success: true, procedure }
  } catch (error) {
    console.error("Error updating procedure:", error)
    return { error: "Failed to update procedure" }
  }
}

export async function deleteProcedure(procedureId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedure.delete({
      where: { id: procedureId },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error deleting procedure:", error)
    return { error: "Failed to delete procedure" }
  }
}

export async function archiveProcedure(procedureId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedure.update({
      where: { id: procedureId },
      data: {
        archived: true,
        updatedById: user.id,
      },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error archiving procedure:", error)
    return { error: "Failed to archive procedure" }
  }
}

export async function unarchiveProcedure(procedureId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedure.update({
      where: { id: procedureId },
      data: {
        archived: false,
        updatedById: user.id,
      },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving procedure:", error)
    return { error: "Failed to unarchive procedure" }
  }
}

export async function addProcedureVersion(procedureId: string, formData: FormData) {
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
    const procedureVersion = await prisma.procedureVersion.create({
      data: {
        procedureId,
        version,
        issueDate: new Date(issueDate),
        notes,
        createdById: user.id,
        documentId: documentId || undefined,
      },
    })

    // Update the procedure with the new version
    await prisma.procedure.update({
      where: { id: procedureId },
      data: {
        version,
        issueDate: new Date(issueDate),
        updatedById: user.id,
      },
    })

    revalidatePath(`/procedures/${procedureId}`)
    return { success: true, procedureVersion }
  } catch (error) {
    console.error("Error adding procedure version:", error)
    return { error: "Failed to add procedure version" }
  }
}

export async function getProcedureCategories() {
  try {
    const categories = await prisma.procedureCategory.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
    })
    return categories
  } catch (error) {
    console.error("Error fetching procedure categories:", error)
    return []
  }
}

export async function createProcedureCategory(formData: FormData) {
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
    const category = await prisma.procedureCategory.create({
      data: {
        title,
        highlighted,
      },
    })

    revalidatePath("/procedures")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating procedure category:", error)
    return { error: "Failed to create procedure category" }
  }
}

export async function updateProcedureCategory(categoryId: string, formData: FormData) {
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
    const category = await prisma.procedureCategory.update({
      where: { id: categoryId },
      data: {
        title,
        highlighted,
      },
    })

    revalidatePath("/procedures")
    return { success: true, category }
  } catch (error) {
    console.error("Error updating procedure category:", error)
    return { error: "Failed to update procedure category" }
  }
}

export async function deleteProcedureCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get all procedures in this category
    const procedures = await prisma.procedure.findMany({
      where: { categoryId },
      select: { id: true },
    })

    const procedureIds = procedures.map(p => p.id)

    // Delete all reviews for all procedures in this category
    await prisma.procedureReview.deleteMany({
      where: { procedureId: { in: procedureIds } },
    })

    // Delete all versions for all procedures in this category
    await prisma.procedureVersion.deleteMany({
      where: { procedureId: { in: procedureIds } },
    })

    // Delete all procedures in this category
    await prisma.procedure.deleteMany({
      where: { categoryId },
    })

    // Finally, delete the category
    await prisma.procedureCategory.delete({
      where: { id: categoryId },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error deleting procedure category:", error)
    return { error: "Failed to delete procedure category" }
  }
}

export async function archiveProcedureCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedureCategory.update({
      where: { id: categoryId },
      data: {
        archived: true,
      },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error archiving procedure category:", error)
    return { error: "Failed to archive procedure category" }
  }
}

export async function unarchiveProcedureCategory(categoryId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedureCategory.update({
      where: { id: categoryId },
      data: {
        archived: false,
      },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving procedure category:", error)
    return { error: "Failed to unarchive procedure category" }
  }
}

// New functions adapted from manual-actions.ts

// Toggle highlight status
export async function toggleHighlight(id: string, type: "procedure" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "procedure") {
      const procedure = await prisma.procedure.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.procedure.update({
        where: { id },
        data: {
          highlighted: !procedure?.highlighted,
          updatedById: user.id,
        },
      })
    } else {
      const category = await prisma.procedureCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.procedureCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Reorder procedure or category
export async function reorderItem(id: string, type: "procedure" | "category", direction: "up" | "down") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "procedure") {
      const procedure = await prisma.procedure.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!procedure) {
        throw new Error("Procedure not found")
      }

      const currentOrder = procedure.order
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

      // Find procedure at the new order position
      const procedureAtNewOrder = await prisma.procedure.findFirst({
        where: {
          categoryId: procedure.categoryId,
          order: newOrder,
          archived: false,
        },
      })

      if (procedureAtNewOrder) {
        // Swap orders
        await prisma.procedure.update({
          where: { id: procedureAtNewOrder.id },
          data: { order: currentOrder },
        })

        await prisma.procedure.update({
          where: { id },
          data: {
            order: newOrder,
            updatedById: user.id,
          },
        })
      }
    } else {
      const category = await prisma.procedureCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      const currentOrder = category.order
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

      // Find category at the new order position
      const categoryAtNewOrder = await prisma.procedureCategory.findFirst({
        where: {
          order: newOrder,
          archived: false,
        },
      })

      if (categoryAtNewOrder) {
        // Swap orders
        await prisma.procedureCategory.update({
          where: { id: categoryAtNewOrder.id },
          data: { order: currentOrder },
        })

        await prisma.procedureCategory.update({
          where: { id },
          data: { order: newOrder },
        })
      }
    }

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Permanently delete procedure or category (compared to soft-delete)
export async function permanentlyDeleteItem(id: string, type: "procedure" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "procedure") {
      // First delete all procedure versions
      await prisma.procedureVersion.deleteMany({
        where: { procedureId: id },
      })
      
      // Then delete the procedure
      await prisma.procedure.delete({
        where: { id },
      })
    } else {
      // For categories, first get all procedures in this category
      const procedures = await prisma.procedure.findMany({
        where: { categoryId: id },
        select: { id: true },
      })
      
      // Delete all versions for all procedures in this category
      await prisma.procedureVersion.deleteMany({
        where: { procedureId: { in: procedures.map(p => p.id) } },
      })
      
      // Then delete all procedures
      await prisma.procedure.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.procedureCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item permanently:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

export async function addProcedureReview(procedureId: string, formData: FormData) {
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
    const review = await prisma.procedureReview.create({
      data: {
        procedureId,
        reviewedById: user.id,
        reviewerName,
        details,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
      },
    })

    revalidatePath(`/procedures/${procedureId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding procedure review:", error)
    return { error: "Failed to add review" }
  }
}

export async function deleteProcedureReview(reviewId: string) {
  const user = await getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.procedureReview.delete({
      where: { id: reviewId },
    })

    revalidatePath("/procedures")
    return { success: true }
  } catch (error) {
    console.error("Error deleting procedure review:", error)
    return { error: "Failed to delete review" }
  }
}

export async function getProcedureReviews(procedureId: string) {
  try {
    const reviews = await prisma.procedureReview.findMany({
      where: { procedureId },
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
    console.error("Error fetching procedure reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}