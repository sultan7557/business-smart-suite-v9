

"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function addRegister(formData: FormData | Record<string, any>) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Helper function to get value from either FormData or plain object
    const getValue = (key: string): string => {
      if (formData instanceof FormData) {
        return formData.get(key) as string
      }
      return formData[key] as string
    }

    const title = getValue("title")
    const version = getValue("version")
    const reviewDate = new Date(getValue("reviewDate"))
    const department = getValue("department")
    const content = getValue("content")
    const categoryId = getValue("categoryId")

    // Get the highest order in this category
    const highestOrderRegister = await prisma.register.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderRegister ? highestOrderRegister.order + 1 : 1

    const register = await prisma.register.create({
      data: {
        title,
        version,
        reviewDate,
        department,
        content,
        categoryId,
        createdById: user.id,
        order: newOrder,
      },
    })

    revalidatePath("/registers")
    return { success: true, data: register }
  } catch (error) {
    console.error("Error adding register:", error)
    return { success: false, error: "Failed to add register" }
  }
}

export async function updateRegister(id: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const nextReviewDate = formData.get("nextReviewDate") as string
    const department = formData.get("department") as string
    const content = formData.get("content") as string

    if (!title || !categoryId || !version || !reviewDate || !department) {
      throw new Error("All fields are required")
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format")
    }

    const register = await prisma.register.update({
      where: {
        id,
      },
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        updatedById: user.id as string,
      },
    })

    revalidatePath("/registers")
    return { success: true, register }
  } catch (error) {
    console.error("[REGISTER_UPDATE]", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteRegister(id: string, permanent = false) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (permanent) {
      await prisma.register.delete({
        where: {
          id,
        },
      })
    } else {
      await prisma.register.update({
        where: {
          id,
        },
        data: {
          archived: true,
        },
      })
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("[REGISTER_DELETE]", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function toggleHighlight(id: string, type: "category" | "register") {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (type === "category") {
      const category = await prisma.registerCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })
      if (!category) {
        return { success: false, error: "Category not found" }
      }

      await prisma.registerCategory.update({
        where: { id },
        data: { highlighted: !category.highlighted },
      })
    } else {
      const register = await prisma.register.findUnique({
        where: { id },
        select: { highlighted: true },
      })
      if (!register) {
        return { success: false, error: "Register not found" }
      }

      await prisma.register.update({
        where: { id },
        data: {
          highlighted: !register.highlighted,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight" }
  }
}

export async function archiveItem(id: string, type: "category" | "register") {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (type === "category") {
      await prisma.registerCategory.update({
        where: { id },
        data: { archived: true },
      })

      // Also archive all registers in this category
      await prisma.register.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.register.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

export async function unarchiveItem(id: string, type: "category" | "register") {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (type === "category") {
      await prisma.registerCategory.update({
        where: { id },
        data: { archived: false },
      })

      // Also unarchive all registers in this category
      await prisma.register.updateMany({
        where: { categoryId: id },
        data: { archived: false },
      })
    } else {
      await prisma.register.update({
        where: { id },
        data: { archived: false },
      })
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

export async function deleteItem(id: string, type: "category" | "register") {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    if (type === "category") {
      // For categories, first get all registers in this category
      const registers = await prisma.register.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all reviews for all registers in this category
      await prisma.registerReview.deleteMany({
        where: { registerId: { in: registers.map((r) => r.id) } },
      })

      // Then delete all registers
      await prisma.register.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.registerCategory.delete({
        where: { id },
      })
    } else {
      // First delete all reviews for this register
      await prisma.registerReview.deleteMany({
        where: { registerId: id },
      })

      // Then delete the register
      await prisma.register.delete({
        where: { id },
      })
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder register or category to a specific position
export async function reorderItem(id: string, type: "category" | "register", newPosition: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "register") {
      const register = await prisma.register.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!register) {
        throw new Error("Register not found")
      }

      // Get all registers in the same category, ordered by their current order
      const allRegisters = await prisma.register.findMany({
        where: {
          categoryId: register.categoryId,
          archived: false,
        },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allRegisters.findIndex((r) => r.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedRegisters = [...allRegisters]
      const [movedRegister] = reorderedRegisters.splice(currentPosition, 1)
      reorderedRegisters.splice(newPosition, 0, movedRegister)

      // Update all registers with their new order
      const updatePromises = reorderedRegisters.map((register, index) =>
        prisma.register.update({
          where: { id: register.id },
          data: {
            order: index + 1,
            ...(register.id === id ? { updatedById: user.id as string } : {}),
          },
        }),
      )

      await Promise.all(updatePromises)
    } else {
      const category = await prisma.registerCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get all categories, ordered by their current order
      const allCategories = await prisma.registerCategory.findMany({
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
        prisma.registerCategory.update({
          where: { id: category.id },
          data: { order: index + 1 },
        }),
      )

      await Promise.all(updatePromises)
    }

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

export async function addCategory(title: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the highest order
    const highestOrderCategory = await prisma.registerCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    const category = await prisma.registerCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/registers")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

export async function editCategory(id: string, title: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const category = await prisma.registerCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/registers")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

export async function approveRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const register = await prisma.register.findUnique({
      where: { id },
      select: { approved: true },
    })
    if (!register) {
      return { success: false, error: "Register not found" }
    }

    await prisma.register.update({
      where: { id },
      data: {
        approved: !register.approved,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/registers")
    return { success: true }
  } catch (error) {
    console.error("Error toggling approval:", error)
    return { success: false, error: "Failed to toggle approval" }
  }
}

export async function getRegisterReviews(registerId: string) {
  try {
    const reviews = await prisma.registerReview.findMany({
      where: { registerId },
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
    console.error("Error getting reviews:", error)
    return { success: false, error: "Failed to get reviews" }
  }
}

export async function addRegisterReview(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const registerId = formData.get("registerId") as string
    const reviewerName = formData.get("reviewerName") as string
    const reviewDate = new Date(formData.get("reviewDate") as string)
    const nextReviewDate = formData.get("nextReviewDate") ? new Date(formData.get("nextReviewDate") as string) : null
    const details = formData.get("details") as string

    const review = await prisma.registerReview.create({
      data: {
        registerId,
        reviewerName,
        reviewDate,
        nextReviewDate,
        details,
        reviewedById: user.id,
      },
    })

    revalidatePath(`/registers/${registerId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

export async function deleteRegisterReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const review = await prisma.registerReview.findUnique({
      where: { id: reviewId },
    })
    if (!review) {
      return { success: false, error: "Review not found" }
    }

    await prisma.registerReview.delete({
      where: { id: reviewId },
    })

    revalidatePath(`/registers/${review.registerId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}


