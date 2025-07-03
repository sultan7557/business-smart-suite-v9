"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "manual" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "manual") {
      const manual = await prisma.manual.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.manual.update({
        where: { id },
        data: {
          highlighted: !manual?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.manualCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.manualCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve manual
export async function approveManual(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.manual.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error approving manual:", error)
    return { success: false, error: "Failed to approve manual" }
  }
}

// Archive manual or category
export async function archiveItem(id: string, type: "manual" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "manual") {
      await prisma.manual.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its manuals
      await prisma.manualCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.manual.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive manual or category
export async function unarchiveItem(id: string, type: "manual" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "manual") {
      await prisma.manual.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its manuals
      await prisma.manualCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.manual.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete manual or category
export async function deleteItem(id: string, type: "manual" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "manual") {
      // First delete all manual versions
      await prisma.manualVersion.deleteMany({
        where: { manualId: id },
      })
      
      // Then delete the manual
      await prisma.manual.delete({
        where: { id },
      })
    } else {
      // For categories, first get all manuals in this category
      const manuals = await prisma.manual.findMany({
        where: { categoryId: id },
        select: { id: true },
      })
      
      // Delete all versions for all manuals in this category
      await prisma.manualVersion.deleteMany({
        where: { manualId: { in: manuals.map(m => m.id) } },
      })
      
      // Then delete all manuals
      await prisma.manual.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.manualCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder manual or category
export async function reorderItem(id: string, type: "manual" | "category", direction: "up" | "down") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "manual") {
      const manual = await prisma.manual.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!manual) {
        throw new Error("Manual not found")
      }

      const currentOrder = manual.order
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

      // Find manual at the new order position
      const manualAtNewOrder = await prisma.manual.findFirst({
        where: {
          categoryId: manual.categoryId,
          order: newOrder,
          archived: false,
        },
      })

      if (manualAtNewOrder) {
        // Swap orders
        await prisma.manual.update({
          where: { id: manualAtNewOrder.id },
          data: { order: currentOrder },
        })

        await prisma.manual.update({
          where: { id },
          data: {
            order: newOrder,
            updatedById: user.id as string,
          },
        })
      }
    } else {
      const category = await prisma.manualCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      const currentOrder = category.order
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

      // Find category at the new order position
      const categoryAtNewOrder = await prisma.manualCategory.findFirst({
        where: {
          order: newOrder,
          archived: false,
        },
      })

      if (categoryAtNewOrder) {
        // Swap orders
        await prisma.manualCategory.update({
          where: { id: categoryAtNewOrder.id },
          data: { order: currentOrder },
        })

        await prisma.manualCategory.update({
          where: { id },
          data: { order: newOrder },
        })
      }
    }

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Add new manual
export async function addManual(data: {
  title: string
  version: string
  issueDate: string
  location: string
  content: string
  categoryId: string
  order: number
  highlighted: boolean
  approved: boolean
  archived: boolean
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderManual = await prisma.manual.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderManual ? highestOrderManual.order + 1 : 1

    const manual = await prisma.manual.create({
      data: {
        title: data.title,
        version: data.version,
        issueDate: new Date(data.issueDate),
        location: data.location,
        content: data.content,
        categoryId: data.categoryId,
        createdById: user.id as string,
        order: newOrder,
        highlighted: data.highlighted,
        approved: data.approved,
        archived: data.archived,
      },
    })

    revalidatePath("/manual")
    return { success: true, manual }
  } catch (error) {
    console.error("Error adding manual:", error)
    return { success: false, error: "Failed to add manual" }
  }
}

// Add new category
export async function addCategory(title: string) {
  try {
    // Get the highest order
    const highestOrderCategory = await prisma.manualCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    await prisma.manualCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit manual
export async function editManual(
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

    await prisma.manual.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath(`/manual/${id}`)
    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error editing manual:", error)
    return { success: false, error: "Failed to edit manual" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    await prisma.manualCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/manual")
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}
