"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Get all controls
export async function getStatementOfApplicabilityControls() {
  try {
    const controls = await prisma.statementOfApplicabilityControl.findMany({
      orderBy: [
        { section: 'asc' },
        { order: 'asc' }
      ]
    })

    return { success: true, data: controls }
  } catch (error) {
    console.error("Error fetching Statement of Applicability controls:", error)
    return { success: false, error: "Failed to fetch controls" }
  }
}

// Get controls by section
export async function getControlsBySection(section: string) {
  try {
    const controls = await prisma.statementOfApplicabilityControl.findMany({
      where: {
        section
      },
      orderBy: {
        order: 'asc'
      }
    })

    return { success: true, data: controls }
  } catch (error) {
    console.error(`Error fetching controls for section ${section}:`, error)
    return { success: false, error: "Failed to fetch controls for section" }
  }
}

// Update control
export async function updateControl(id: string, data: any) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const control = await prisma.statementOfApplicabilityControl.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    revalidatePath("/statement-of-applicability")
    return { success: true, data: control }
  } catch (error) {
    console.error("Error updating control:", error)
    return { success: false, error: "Failed to update control" }
  }
}

// Get version history
export async function getVersionHistory() {
  try {
    const versions = await prisma.statementOfApplicabilityVersion.findMany({
      orderBy: {
        number: 'asc'
      }
    })

    return { success: true, data: versions }
  } catch (error) {
    console.error("Error fetching version history:", error)
    return { success: false, error: "Failed to fetch version history" }
  }
}

// Add version
export async function addVersion(data: any) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the highest version number
    const highestVersion = await prisma.statementOfApplicabilityVersion.findFirst({
      orderBy: {
        number: 'desc'
      },
      select: {
        number: true
      }
    })

    const newVersion = await prisma.statementOfApplicabilityVersion.create({
      data: {
        ...data,
        number: (highestVersion?.number || 0) + 1
      }
    })

    revalidatePath("/statement-of-applicability")
    return { success: true, data: newVersion }
  } catch (error) {
    console.error("Error adding version:", error)
    return { success: false, error: "Failed to add version" }
  }
}

// Delete version
export async function deleteVersion(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.statementOfApplicabilityVersion.delete({
      where: { id }
    })

    revalidatePath("/statement-of-applicability")
    return { success: true }
  } catch (error) {
    console.error("Error deleting version:", error)
    return { success: false, error: "Failed to delete version" }
  }
}

// Get reviews
export async function getReviews() {
  try {
    const reviews = await prisma.statementOfApplicabilityReview.findMany({
      orderBy: {
        reviewDate: 'desc'
      }
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Add review
export async function addReview(data: any) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const newReview = await prisma.statementOfApplicabilityReview.create({
      data
    })

    revalidatePath("/statement-of-applicability")
    return { success: true, data: newReview }
  } catch (error) {
    console.error("Error adding review:", error)
    return { success: false, error: "Failed to add review" }
  }
}

// Delete review
export async function deleteReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.statementOfApplicabilityReview.delete({
      where: { id }
    })

    revalidatePath("/statement-of-applicability")
    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}