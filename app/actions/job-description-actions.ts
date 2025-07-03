




"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import type { JobDescription, JobDescriptionReview, JobDescriptionVersion } from "@prisma/client"

// Create job description
export async function createJobDescription(data: Omit<JobDescription, "id" | "createdAt" | "updatedAt">) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const jobDescription = await prisma.jobDescription.create({
      data: {
        ...data,
        createdById: user.id as string,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true, jobDescription }
  } catch (error) {
    console.error("Error creating job description:", error)
    return { success: false, error: "Failed to create job description" }
  }
}

// Update job description
export async function updateJobDescription(id: string, data: Omit<JobDescription, "id" | "createdAt" | "updatedAt">) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const jobDescription = await prisma.jobDescription.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true, jobDescription }
  } catch (error) {
    console.error("Error updating job description:", error)
    return { success: false, error: "Failed to update job description" }
  }
}

// Delete job description
export async function deleteJobDescription(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.jobDescription.delete({
      where: { id },
    })

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting job description:", error)
    return { success: false, error: "Failed to delete job description" }
  }
}

// Approve job description
export async function approveJobDescription(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.jobDescription.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error approving job description:", error)
    return { success: false, error: "Failed to approve job description" }
  }
}

// Disapprove job description
export async function disapproveJobDescription(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.jobDescription.update({
      where: { id },
      data: {
        approved: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error disapproving job description:", error)
    return { success: false, error: "Failed to disapprove job description" }
  }
}

// Reorder item
export async function reorderItem(id: string, order: number) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const jobDescription = await prisma.jobDescription.update({
      where: { id },
      data: {
        order: order,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true, jobDescription }
  } catch (error) {
    console.error("Error reordering job description:", error)
    return { success: false, error: "Failed to reorder job description" }
  }
}

// Reorder job descriptions within a category (for drag and drop)
export async function reorderJobDescriptions(categoryId: string, jobDescriptionIds: string[]) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Update the order of each job description
    const updatePromises = jobDescriptionIds.map((id, index) =>
      prisma.jobDescription.update({
        where: { id },
        data: {
          order: index,
          updatedById: user.id as string,
        },
      }),
    )

    await Promise.all(updatePromises)

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error reordering job descriptions:", error)
    return { success: false, error: "Failed to reorder job descriptions" }
  }
}

// Get job description reviews
export async function getJobDescriptionReviews(jobDescriptionId: string) {
  try {
    const reviews = await prisma.jobDescriptionReview.findMany({
      where: { jobDescriptionId },
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
    console.error("Error fetching job description reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add job description review
export async function addJobDescriptionReview(
  jobDescriptionId: string,
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

    const review = await prisma.jobDescriptionReview.create({
      data: {
        ...data,
        jobDescriptionId,
        reviewedById: user.id as string,
      },
    })

    revalidatePath(`/job-descriptions/${jobDescriptionId}`)
    return { success: true, review }
  } catch (error) {
    console.error("Error adding job description review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete job description review
export async function deleteJobDescriptionReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.jobDescriptionReview.delete({
      where: { id: reviewId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting job description review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

// Add job description version
export async function addJobDescriptionVersion(jobDescriptionId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const notes = formData.get("notes") as string
    const documentId = formData.get("documentId") as string | undefined

    const jobDescriptionVersion = await prisma.jobDescriptionVersion.create({
      data: {
        version,
        reviewDate: new Date(reviewDate),
        notes,
        jobDescriptionId,
        documentId,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/job-descriptions/${jobDescriptionId}`)
    return { success: true, jobDescriptionVersion }
  } catch (error) {
    console.error("Error adding job description version:", error)
    return { success: false, error: "Failed to add version" }
  }
}

// Toggle highlight
export async function toggleHighlight(id: string, type: "category" | "jobDescription") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      const category = await prisma.jobDescriptionCategory.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.jobDescriptionCategory.update({
        where: { id },
        data: { highlighted: !category?.highlighted },
      })
    } else {
      const jobDescription = await prisma.jobDescription.findUnique({
        where: { id },
        select: { highlighted: true },
      })

      await prisma.jobDescription.update({
        where: { id },
        data: {
          highlighted: !jobDescription?.highlighted,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error toggling highlight:", error)
    return { success: false, error: "Failed to toggle highlight" }
  }
}

// Archive item
export async function archiveItem(id: string, type: "category" | "jobDescription") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      // For categories, we archive the category and all its job descriptions
      await prisma.jobDescriptionCategory.update({
        where: { id },
        data: { archived: true },
      })

      await prisma.jobDescription.updateMany({
        where: { categoryId: id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.jobDescription.update({
        where: { id },
        data: {
          archived: true,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error archiving item:", error)
    return { success: false, error: "Failed to archive item" }
  }
}

// Unarchive item
export async function unarchiveItem(id: string, type: "category" | "jobDescription") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "category") {
      // For categories, we unarchive the category and all its job descriptions
      await prisma.jobDescriptionCategory.update({
        where: { id },
        data: { archived: false },
      })

      await prisma.jobDescription.updateMany({
        where: { categoryId: id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    } else {
      await prisma.jobDescription.update({
        where: { id },
        data: {
          archived: false,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving item:", error)
    return { success: false, error: "Failed to unarchive item" }
  }
}

// Delete item
export async function deleteItem(id: string, type: "category" | "jobDescription") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    if (type === "jobDescription") {
      // First delete all job description versions
      await prisma.jobDescriptionVersion.deleteMany({
        where: { jobDescriptionId: id },
      })
      
      // Then delete the job description
      await prisma.jobDescription.delete({
        where: { id },
      })
    } else {
      // For categories, first get all job descriptions in this category
      const jobDescriptions = await prisma.jobDescription.findMany({
        where: { categoryId: id },
        select: { id: true },
      })
      
      // Delete all versions for all job descriptions in this category
      await prisma.jobDescriptionVersion.deleteMany({
        where: { jobDescriptionId: { in: jobDescriptions.map(jd => jd.id) } },
      })
      
      // Then delete all job descriptions
      await prisma.jobDescription.deleteMany({
        where: { categoryId: id },
      })

      // Finally delete the category
      await prisma.jobDescriptionCategory.delete({
        where: { id },
      })
    }

    revalidatePath("/job-descriptions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}

// Add job description
export async function addJobDescription(data: {
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
    const highestOrderJobDescription = await prisma.jobDescription.findFirst({
      where: { categoryId: data.categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderJobDescription ? highestOrderJobDescription.order + 1 : 0

    const jobDescription = await prisma.jobDescription.create({
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

    revalidatePath("/job-descriptions")
    return { success: true, jobDescription }
  } catch (error) {
    console.error("Error adding job description:", error)
    return { success: false, error: "Failed to add job description" }
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
    const highestOrderCategory = await prisma.jobDescriptionCategory.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCategory ? highestOrderCategory.order + 1 : 0

    const category = await prisma.jobDescriptionCategory.create({
      data: {
        title,
        order: newOrder,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true, category }
  } catch (error) {
    console.error("Error adding category:", error)
    return { success: false, error: "Failed to add category" }
  }
}

// Edit category
export async function editCategory(id: string, title: string) {
  try {
    const category = await prisma.jobDescriptionCategory.update({
      where: { id },
      data: { title },
    })

    revalidatePath("/job-descriptions")
    return { success: true, category }
  } catch (error) {
    console.error("Error editing category:", error)
    return { success: false, error: "Failed to edit category" }
  }
}

// Edit job description
export async function editJobDescription(
  id: string,
  data: {
    title?: string
    version?: string
    reviewDate?: Date
    nextReviewDate?: Date
    department?: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const jobDescription = await prisma.jobDescription.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/job-descriptions")
    return { success: true, jobDescription }
  } catch (error) {
    console.error("Error editing job description:", error)
    return { success: false, error: "Failed to edit job description" }
  }
}
