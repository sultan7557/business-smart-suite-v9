



"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "technicalFile" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "technicalFile") {
      const technicalFile = await prisma.technicalFile.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.technicalFile.update({
        where: { id },
        data: {
          highlighted: !technicalFile?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.technicalFileCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.technicalFileCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve technical file
export async function approveTechnicalFile(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.technicalFile.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error approving technical file:", error)
    return { success: false, error: "Failed to approve technical file" }
  }
}

// Disapprove technical file
export async function disapproveTechnicalFile(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.technicalFile.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving technical file:", error)
    return { success: false, error: "Failed to disapprove technical file" }
  }
}

// Archive technical file or category
export async function archiveItem(id: string, type: "technicalFile" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "technicalFile") {
      await prisma.technicalFile.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.technicalFileCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.technicalFile.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive technical file or category
export async function unarchiveItem(id: string, type: "technicalFile" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "technicalFile") {
      await prisma.technicalFile.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.technicalFileCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.technicalFile.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete technical file or category
export async function deleteItem(id: string, type: "technicalFile" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "technicalFile") {
      await prisma.technicalFileVersion.deleteMany({
        where: { technicalFileId: id },
      })

      await prisma.technicalFile.delete({
        where: { id },
      })
    } else {
      const technicalFiles = await prisma.technicalFile.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      await prisma.technicalFileVersion.deleteMany({
        where: { technicalFileId: { in: technicalFiles.map((tf) => tf.id) } },
      })

      await prisma.technicalFile.deleteMany({
        where: { categoryId: id },
      })

      await prisma.technicalFileCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder technical files within a category (for drag and drop)
export async function reorderTechnicalFiles(categoryId: string, technicalFileIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const updatePromises = technicalFileIds.map((id, index) =>
      prisma.technicalFile.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/technical-file")
    return { success: true }
  } catch (error) {
    console.error("Error reordering technical files:", error)
    return { success: false, error: "Failed to reorder technical files" }
  }
}

// Add technical file
export async function addTechnicalFile(data: {
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

    const highestOrderTechnicalFile = await prisma.technicalFile.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderTechnicalFile ? highestOrderTechnicalFile.order + 1 : 0

    const technicalFile = await prisma.technicalFile.create({
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

    revalidatePath("/technical-file")
    return { success: true, technicalFile }
  } catch (error) {
    console.error("Error adding technical file:", error)
    return { success: false, error: "Failed to add technical file" }
  }
}

// Add category
export async function addCategory(title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const highestOrderCategory = await prisma.technicalFileCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.technicalFileCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/technical-file")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.technicalFileCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/technical-file")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Uncomment and export the review functions
export async function addTechnicalFileReview(technicalFileId: string, data: { reviewerName: string, reviewDate: Date, nextReviewDate?: Date, details: string }) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }
    const review = await prisma.technicalFileReview.create({
      data: {
        technicalFileId,
        reviewerName: data.reviewerName,
        reviewDate: data.reviewDate,
        nextReviewDate: data.nextReviewDate,
        details: data.details,
        reviewedById: user.id,
      },
    })
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding Technical File review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

export async function getTechnicalFileReviews(technicalFileId: string) {
  try {
    const reviews = await prisma.technicalFileReview.findMany({
      where: { technicalFileId },
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
    console.error("Error fetching Technical File reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

export async function deleteTechnicalFileReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }
    await prisma.technicalFileReview.delete({
      where: { id: reviewId },
    })
    return { success: true }
  } catch (error) {
    console.error("Error deleting Technical File review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}
