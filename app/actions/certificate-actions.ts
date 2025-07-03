

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Toggle highlight status
export async function toggleHighlight(id: string, type: "certificate" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "certificate") {
      const certificate = await prisma.certificate.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.certificate.update({
        where: { id },
        data: {
          highlighted: !certificate?.highlighted,
          updatedById: user.id as string,
        },
      })
    } else {
      const category = await prisma.certificateCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.certificateCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    }

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight status" }
  }
}

// Approve/unapprove certificate (toggle)
export async function approveCertificate(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      select: { approved: true },
    })

    await prisma.certificate.update({
      where: { id },
      data: {
        approved: !certificate?.approved,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error toggling approval:", error)
    return { success: false, error: "Failed to toggle approval status" }
  }
}

// Archive certificate or category
export async function archiveItem(id: string, type: "certificate" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "certificate") {
      await prisma.certificate.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we archive the category and all its certificates
      await prisma.certificateCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.certificate.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive certificate or category
export async function unarchiveItem(id: string, type: "certificate" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "certificate") {
      await prisma.certificate.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      // For categories, we unarchive the category and all its certificates
      await prisma.certificateCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.certificate.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete certificate or category
export async function deleteItem(id: string, type: "certificate" | "category") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "certificate") {
      // First delete all certificate versions
      await prisma.certificateVersion.deleteMany({
        where: { certificateId: id },
      })

      // Then delete the certificate
      await prisma.certificate.delete({
        where: { id },
      })
    } else {
      // For categories, first get all certificates in this category
      const certificates = await prisma.certificate.findMany({
        where: { categoryId: id },
        select: { id: true },
      })

      // Delete all versions for all certificates in this category
      await prisma.certificateVersion.deleteMany({
        where: { certificateId: { in: certificates.map((c) => c.id) } },
      })

      // Then delete all certificates
      await prisma.certificate.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.certificateCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Reorder certificate or category to a specific position
export async function reorderItem(id: string, type: "certificate" | "category", newPosition: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "certificate") {
      const certificate = await prisma.certificate.findUnique({
        where: { id },
        select: { order: true, categoryId: true },
      })

      if (!certificate) {
        throw new Error("Certificate not found")
      }

      // Get all certificates in the same category, ordered by their current order
      const allCertificates = await prisma.certificate.findMany({
        where: {
          categoryId: certificate.categoryId,
          archived: false,
        },
        orderBy: { order: "asc" },
        select: { id: true, order: true },
      })

      // Find current position
      const currentPosition = allCertificates.findIndex((c) => c.id === id)

      if (currentPosition === -1 || newPosition === currentPosition) {
        return { success: true } // No change needed
      }

      // Reorder the array
      const reorderedCertificates = [...allCertificates]
      const [movedCertificate] = reorderedCertificates.splice(currentPosition, 1)
      reorderedCertificates.splice(newPosition, 0, movedCertificate)

      // Update all certificates with their new order
      const updatePromises = reorderedCertificates.map((certificate, index) =>
        prisma.certificate.update({
          where: { id: certificate.id },
          data: {
            order: index + 1,
            ...(certificate.id === id ? { updatedById: user.id as string } : {}),
          },
        }),
      )

      await Promise.all(updatePromises)
    } else {
      const category = await prisma.certificateCategory.findUnique({
        where: { id },
        select: { order: true },
      })

      if (!category) {
        throw new Error("Category not found")
      }

      // Get all categories, ordered by their current order
      const allCategories = await prisma.certificateCategory.findMany({
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
        prisma.certificateCategory.update({
          where: { id: category.id },
          data: { order: index + 1 },
        }),
      )

      await Promise.all(updatePromises)
    }

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error reordering item:", error)
    return { success: false, error: "Failed to reorder item" }
  }
}

// Add a new certificate to a category
export async function addCertificate(categoryId: string, title: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest order in this category
    const highestOrderCertificate = await prisma.certificate.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCertificate ? highestOrderCertificate.order + 1 : 1

    const newCertificate = await prisma.certificate.create({
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

    revalidatePath("/certificate")
    return { success: true, certificate: newCertificate }
  } catch (error) {
    console.error("Error adding certificate:", error)
    return { success: false, error: "Failed to add certificate" }
  }
}

// Add new category
export async function addCategory(title: string) {
  try {
    // Get the highest order
    const highestOrderCategory = await prisma.certificateCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 1

    await prisma.certificateCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit certificate
export async function editCertificate(
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

    await prisma.certificate.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath(`/certificate/${id}`)
    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error editing certificate:", error)
    return { success: false, error: "Failed to edit certificate" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    await prisma.certificateCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Add review
export async function addCertificateReview(
  certificateId: string,
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

    const review = await prisma.certificateReview.create({
      data: {
        certificateId,
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

    revalidatePath(`/certificate/${certificateId}`)
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding certificate review:", error)
    return { success: false, error: "Failed to add certificate review" }
  }
}

// Delete review
export async function deleteCertificateReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.certificateReview.delete({
      where: { id },
    })

    revalidatePath("/certificate")
    return { success: true }
  } catch (error) {
    console.error("Error deleting certificate review:", error)
    return { success: false, error: "Failed to delete certificate review" }
  }
}

// Get reviews
export async function getCertificateReviews(certificateId: string) {
  try {
    const reviews = await prisma.certificateReview.findMany({
      where: { certificateId },
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
    console.error("Error fetching certificate reviews:", error)
    return { success: false, error: "Failed to fetch certificate reviews" }
  }
}
