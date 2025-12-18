

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "policy" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "policy") {
      const policy = await prisma.policy.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.policy.update({
        where: { id },
        data: {
          highlighted: !policy?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.policyCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.policyCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve policy
export async function approvePolicy(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.policy.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error approving policy:", error)
    return { success: false, error: "Failed to approve policy" }
  }
}

// Unapprove policy
export async function unapprovePolicy(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.policy.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error unapproving policy:", error)
    return { success: false, error: "Failed to unapprove policy" }
  }
}

// Archive policy or category
export async function archiveItem(id: string, type: "policy" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "policy") {
      await prisma.policy.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its policies
      await prisma.policyCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.policy.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive policy or category
export async function unarchiveItem(id: string, type: "category" | "policy") {
  try {
    if (type === "category") {
      await prisma.policyCategory.update({
        where: { id },
        data: { archived: false },
      })

      // Also unarchive all policies in this category
      await prisma.policy.updateMany({
        where: { categoryId: id },
        data: { archived: false },
      })
    } else if (type === "policy") {
      await prisma.policy.update({
        where: { id },
        data: { archived: false },
      })
    }

    revalidatePath("/policies")
  } catch (error) {
    console.error("Error unarchiving item:", error)
  }
}

// Delete policy or category
export async function deleteItem(id: string, type: "policy" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "policy") {
      const policies = await prisma.policy.findMany({ where: { id }, select: { id: true } })
      const policyIds = policies.map((p) => p.id)
      await prisma.policyVersion.deleteMany({ where: { policyId: { in: policyIds } } })
      await prisma.policy.delete({ where: { id } })
    } else {
      // For categories, we delete the category and all its policies
      const policies = await prisma.policy.findMany({ where: { categoryId: id }, select: { id: true } })
      const policyIds = policies.map((p) => p.id)
      await prisma.policyVersion.deleteMany({ where: { policyId: { in: policyIds } } })
      await prisma.policy.deleteMany({ where: { categoryId: id } })

      await prisma.policyCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder policy or category to a specific position
export async function reorderItem(id: string, type: "policy" | "category", newPosition: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "policy") {
      const policy = await prisma.policy.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!policy) {
        throw new Error("Policy not found")
      }

      // Get all policies in the same category, ordered by their current order
      const allPolicies = await prisma.policy.findMany({
        where: {
          categoryId: policy.categoryId,
          archived: false,
        },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allPolicies.findIndex((p) => p.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedPolicies = [...allPolicies]
      const [movedPolicy] = reorderedPolicies.splice(currentPosition, 1)
      reorderedPolicies.splice(newPosition, 0, movedPolicy)

      // Update all policies with their new order
      const updatePromises = reorderedPolicies.map((policy, index) =>
        prisma.policy.update({
          where: { id: policy.id },
          data: {
            order: index + 1,
            ...(policy.id === id ? { updatedById: user.id as string } : {}),
          },
        }),
      )

      await Promise.all(updatePromises)
    } else {
      const category = await prisma.policyCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get all categories, ordered by their current order
      const allCategories = await prisma.policyCategory.findMany({
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
        prisma.policyCategory.update({
          where: { id: category.id },
          data: { order: index + 1 },
        }),
      )

      await Promise.all(updatePromises)
    }

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Add new policy
export async function addPolicy(categoryId: string, title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderPolicy = await prisma.policy.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderPolicy ? highestOrderPolicy.order + 1 : 1

    await prisma.policy.create({
      data: {
        title,
        version: "1",
        issueDate: new Date(),
        location: "IMS",
        categoryId,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error adding policy:", error)
    return { success: false, error: "Failed to add policy" }
  }
}

// Add new category
export async function addCategory(title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order
    const highestOrderCategory = await prisma.policyCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    await prisma.policyCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit policy
export async function editPolicy(
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

    await prisma.policy.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath(`/policies/${id}`)
    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error editing policy:", error)
    return { success: false, error: "Failed to edit policy" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.policyCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/policies")
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Get policy reviews
export async function getPolicyReviews(policyId: string) {
  try {
    const reviews = await (prisma as any).policyReview.findMany({
      where: { policyId },
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
    console.error("Error fetching policy reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add policy review
export async function addPolicyReview(
  policyId: string,
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

    const review = await (prisma as any).policyReview.create({
      data: {
        ...data,
        policyId,
        reviewedById: user.id as string,
      },
    })

    revalidatePath(`/policies/${policyId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding policy review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete policy review
export async function deletePolicyReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await (prisma as any).policyReview.delete({
      where: { id: reviewId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting policy review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}
