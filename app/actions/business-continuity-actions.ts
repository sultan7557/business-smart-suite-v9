

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "businessContinuity" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "businessContinuity") {
      const businessContinuity = await prisma.businessContinuity.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.businessContinuity.update({
        where: { id },
        data: {
          highlighted: !businessContinuity?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.businessContinuityCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.businessContinuityCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve business continuity
export async function approveBusinessContinuity(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.businessContinuity.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error approving business continuity:", error)
    return { success: false, error: "Failed to approve business continuity" }
  }
}

// Disapprove business continuity
export async function disapproveBusinessContinuity(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.businessContinuity.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving business continuity:", error)
    return { success: false, error: "Failed to disapprove business continuity" }
  }
}

// Archive business continuity or category
export async function archiveItem(id: string, type: "businessContinuity" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "businessContinuity") {
      await prisma.businessContinuity.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its business continuities
      await prisma.businessContinuityCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.businessContinuity.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive business continuity or category
export async function unarchiveItem(id: string, type: "businessContinuity" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "businessContinuity") {
      await prisma.businessContinuity.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its business continuities
      await prisma.businessContinuityCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.businessContinuity.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete business continuity or category
export async function deleteItem(id: string, type: "businessContinuity" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "businessContinuity") {
      // First delete all business continuity versions
      await prisma.businessContinuityVersion.deleteMany({
        where: { businessContinuityId: id },
      })

      // Then delete the business continuity
      await prisma.businessContinuity.delete({
        where: { id },
      })
    } else {
      // For categories, first get all business continuities in this category
      const businessContinuities = await prisma.businessContinuity.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all business continuities in this category
      await prisma.businessContinuityVersion.deleteMany({
        where: { businessContinuityId: { in: businessContinuities.map((bc) => bc.id) } },
      })

      // Then delete all business continuities
      await prisma.businessContinuity.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.businessContinuityCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder business continuities within a category (for drag and drop)
export async function reorderBusinessContinuities(categoryId: string, businessContinuityIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each business continuity
    const updatePromises = businessContinuityIds.map((id, index) =>
      prisma.businessContinuity.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error reordering business continuities:", error)
    return { success: false, error: "Failed to reorder business continuities" }
  }
}

// Add business continuity
export async function addBusinessContinuity(data: {
  title: string
  version: string
  issueDate: string
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
    const highestOrderBusinessContinuity = await prisma.businessContinuity.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderBusinessContinuity ? highestOrderBusinessContinuity.order + 1 : 0

    const businessContinuity = await prisma.businessContinuity.create({
      data: {
        title: data.title,
        version: data.version,
        issueDate: new Date(data.issueDate),
        location: data.location,
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/business-continuity")
    return { success: true, businessContinuity }
  } catch (error) {
    console.error("Error adding business continuity:", error)
    return { success: false, error: "Failed to add business continuity" }
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
    const highestOrderCategory = await prisma.businessContinuityCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.businessContinuityCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/business-continuity")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit business continuity
export async function editBusinessContinuity(
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

    const businessContinuity = await prisma.businessContinuity.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/business-continuity")
    return { success: true, businessContinuity }
  } catch (error) {
    console.error("Error editing business continuity:", error)
    return { success: false, error: "Failed to edit business continuity" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.businessContinuityCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/business-continuity")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Add business continuity review
export async function addBusinessContinuityReview(
  businessContinuityId: string,
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

    const review = await prisma.businessContinuityReview.create({
      data: {
        businessContinuityId,
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

    revalidatePath(`/business-continuity/${businessContinuityId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding business continuity review:", error)
    return { success: false, error: "Failed to add business continuity review" }
  }
}

// Delete business continuity review
export async function deleteBusinessContinuityReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.businessContinuityReview.delete({
      where: { id },
    })

    revalidatePath("/business-continuity")
    return { success: true }
  } catch (error) {
    console.error("Error deleting business continuity review:", error)
    return { success: false, error: "Failed to delete business continuity review" }
  }
}

// Get business continuity reviews
export async function getBusinessContinuityReviews(businessContinuityId: string) {
  try {
    const reviews = await prisma.businessContinuityReview.findMany({
      where: { businessContinuityId },
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
    console.error("Error fetching business continuity reviews:", error)
    return { success: false, error: "Failed to fetch business continuity reviews" }
  }
}



