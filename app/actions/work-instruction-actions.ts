




"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Get work instruction reviews
export async function getWorkInstructionReviews(workInstructionId: string) {
  try {
    const reviews = await prisma.workInstructionReview.findMany({
      where: { workInstructionId },
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
    console.error("Error fetching work instruction reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add work instruction review
export async function addWorkInstructionReview(
  workInstructionId: string,
  data: {
    details: string
    reviewDate: Date
    nextReviewDate?: Date
    reviewerName: string
  }
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const review = await prisma.workInstructionReview.create({
      data: {
        ...data,
        workInstructionId,
        reviewedById: user.id as string,
      },
    })

    revalidatePath(`/work-instructions/${workInstructionId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding work instruction review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete work instruction review
export async function deleteWorkInstructionReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.workInstructionReview.delete({
      where: { id: reviewId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting work instruction review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

// Add work instruction version
export async function addWorkInstructionVersion(workInstructionId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const workInstructionVersion = await prisma.workInstructionVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        workInstructionId,
        documentId,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/work-instructions/${workInstructionId}`)
    return { success: true, workInstructionVersion }
  } catch (error) {
    console.error("Error adding work instruction version:", error)
    return { success: false, error: "Failed to add version" }
  }
}

// Toggle highlight
export async function toggleHighlight(id: string, type: "category" | "workInstruction") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      const category = await prisma.workInstructionCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.workInstructionCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    } else {
      const workInstruction = await prisma.workInstruction.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.workInstruction.update({
        where: { id },
        data: {
          highlighted: !workInstruction?.highlighted,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight" }
  }
}

// Archive item
export async function archiveItem(id: string, type: "category" | "workInstruction") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      // For categories, we archive the category and all its work instructions
      await prisma.workInstructionCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.workInstruction.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.workInstruction.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive item
export async function unarchiveItem(id: string, type: "category" | "workInstruction") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      // For categories, we unarchive the category and all its work instructions
      await prisma.workInstructionCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.workInstruction.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.workInstruction.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete item
export async function deleteItem(id: string, type: "category" | "workInstruction") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "workInstruction") {
      // First delete all work instruction versions
      await prisma.workInstructionVersion.deleteMany({
        where: { workInstructionId: id },
      })
      
      // Then delete the work instruction
      await prisma.workInstruction.delete({
        where: { id },
      })
    } else {
      // For categories, first get all work instructions in this category
      const workInstructions = await prisma.workInstruction.findMany({
        where: { categoryId: id },
        select: { id: true },
      })
      
      // Delete all versions for all work instructions in this category
      await prisma.workInstructionVersion.deleteMany({
        where: { workInstructionId: { in: workInstructions.map(wi => wi.id) } },
      })
      
      // Then delete all work instructions
      await prisma.workInstruction.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.workInstructionCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder work instructions within a category (for drag and drop)
export async function reorderWorkInstructions(categoryId: string, workInstructionIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each work instruction
    const updatePromises = workInstructionIds.map((id, index) =>
      prisma.workInstruction.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error reordering work instructions:", error)
    return { success: false, error: "Failed to reorder work instructions" }
  }
}

// Add work instruction
export async function addWorkInstruction(data: {
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
    const highestOrderWorkInstruction = await prisma.workInstruction.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderWorkInstruction ? highestOrderWorkInstruction.order + 1 : 0

    const workInstruction = await prisma.workInstruction.create({
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

    revalidatePath("/work-instructions")
    return { success: true, workInstruction }
  } catch (error) {
    console.error("Error adding work instruction:", error)
    return { success: false, error: "Failed to add work instruction" }
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
    const highestOrderCategory = await prisma.workInstructionCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.workInstructionCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/work-instructions")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.workInstructionCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/work-instructions")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Approve work instruction
export async function approveWorkInstruction(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.workInstruction.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error approving work instruction:", error)
    return { success: false, error: "Failed to approve work instruction" }
  }
}

// Disapprove work instruction
export async function disapproveWorkInstruction(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.workInstruction.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/work-instructions")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving work instruction:", error)
    return { success: false, error: "Failed to disapprove work instruction" }
  }
}
