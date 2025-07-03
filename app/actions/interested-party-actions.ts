"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Create a new interested party
export async function createInterestedParty(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const needsExpectations = formData.get("needsExpectations") as string
    const initialLikelihood = parseInt(formData.get("initialLikelihood") as string) || 3
    const initialSeverity = parseInt(formData.get("initialSeverity") as string) || 3
    const controlsRecommendations = formData.get("controlsRecommendations") as string
    const residualLikelihood = parseInt(formData.get("residualLikelihood") as string) || 1
    const residualSeverity = parseInt(formData.get("residualSeverity") as string) || 3

    // Calculate risk levels
    const riskLevel = initialLikelihood * initialSeverity
    const residualRiskLevel = residualLikelihood * residualSeverity

    // Create the interested party
    const interestedParty = await prisma.interestedParty.create({
      data: {
        name,
        description,
        needsExpectations,
        initialLikelihood,
        initialSeverity,
        controlsRecommendations,
        residualLikelihood,
        residualSeverity,
        riskLevel,
        residualRiskLevel,
        createdById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true, id: interestedParty.id }
  } catch (error) {
    console.error("Error creating interested party:", error)
    return { success: false, error: "Failed to create interested party" }
  }
}

// Update an existing interested party
export async function updateInterestedParty(id: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const needsExpectations = formData.get("needsExpectations") as string
    const initialLikelihood = parseInt(formData.get("initialLikelihood") as string) || 3
    const initialSeverity = parseInt(formData.get("initialSeverity") as string) || 3
    const controlsRecommendations = formData.get("controlsRecommendations") as string
    const residualLikelihood = parseInt(formData.get("residualLikelihood") as string) || 1
    const residualSeverity = parseInt(formData.get("residualSeverity") as string) || 3

    // Calculate risk levels
    const riskLevel = initialLikelihood * initialSeverity
    const residualRiskLevel = residualLikelihood * residualSeverity

    // Update the interested party
    const interestedParty = await prisma.interestedParty.update({
      where: { id },
      data: {
        name,
        description,
        needsExpectations,
        initialLikelihood,
        initialSeverity,
        controlsRecommendations,
        residualLikelihood,
        residualSeverity,
        riskLevel,
        residualRiskLevel,
        updatedById: user.id,
      },
    })

    revalidatePath("/interested-parties")
    revalidatePath(`/interested-parties/${id}`)
    return { success: true, id: interestedParty.id }
  } catch (error) {
    console.error("Error updating interested party:", error)
    return { success: false, error: "Failed to update interested party" }
  }
}

// Delete an interested party
export async function deleteInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Delete the interested party
    await prisma.interestedParty.delete({
      where: { id },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error deleting interested party:", error)
    return { success: false, error: "Failed to delete interested party" }
  }
}

// Archive an interested party
export async function archiveInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedParty.update({
      where: { id },
      data: {
        archived: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error archiving interested party:", error)
    return { 
      success: false, 
      error: `Failed to archive interested party: ${error}` 
    }
  }
}

// Unarchive an interested party
export async function unarchiveInterestedParty(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedParty.update({
      where: { id },
      data: {
        archived: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving interested party:", error)
    return { 
      success: false, 
      error: `Failed to unarchive interested party: ${error}` 
    }
  }
}

// Reorder interested party
export async function reorderInterestedParty(id: string, direction: "up" | "down") {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const interestedParty = await prisma.interestedParty.findUnique({
      where: { id },
      select: { order: true },
    })

    if (!interestedParty) {
      throw new Error("Interested party not found")
    }

    const currentOrder = interestedParty.order
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    // Find interested party at the new order position
    const interestedPartyAtNewOrder = await prisma.interestedParty.findFirst({
      where: {
        order: newOrder,
        archived: false,
      },
    })

    if (interestedPartyAtNewOrder) {
      // Swap orders
      await prisma.interestedParty.update({
        where: { id: interestedPartyAtNewOrder.id },
        data: { order: currentOrder },
      })

      await prisma.interestedParty.update({
        where: { id },
        data: {
          order: newOrder,
          updatedById: user.id as string,
        },
      })
    }

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error reordering interested party:", error)
    return { success: false, error: "Failed to reorder interested party" }
  }
}

// Create a new version of an interested party
export async function createInterestedPartyVersion(interestedPartyId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const interestedParty = await prisma.interestedParty.findUnique({
      where: { id: interestedPartyId }
    })

    if (!interestedParty) {
      throw new Error("Interested party not found")
    }

    // Get the latest version number
    const latestVersion = await prisma.interestedPartyVersion.findFirst({
      where: { interestedPartyId },
      orderBy: { createdAt: 'desc' }
    })

    const versionNumber = latestVersion ? 
      (parseInt(latestVersion.version) + 1).toString() : 
      "1"

    const amendmentDetails = formData.get("amendmentDetails") as string

    // Create the version
    const version = await prisma.interestedPartyVersion.create({
      data: {
        interestedPartyId,
        version: versionNumber,
        name: interestedParty.name,
        description: interestedParty.description,
        needsExpectations: interestedParty.needsExpectations,
        initialLikelihood: interestedParty.initialLikelihood,
        initialSeverity: interestedParty.initialSeverity,
        controlsRecommendations: interestedParty.controlsRecommendations,
        residualLikelihood: interestedParty.residualLikelihood,
        residualSeverity: interestedParty.residualSeverity,
        riskLevel: interestedParty.riskLevel,
        residualRiskLevel: interestedParty.residualRiskLevel,
        amendmentDetails,
        createdById: user.id,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true, id: version.id }
  } catch (error) {
    console.error("Error creating interested party version:", error)
    return { success: false, error: "Failed to create version" }
  }
}

// Get versions for an interested party
export async function getInterestedPartyVersions(interestedPartyId: string) {
  try {
    const versions = await prisma.interestedPartyVersion.findMany({
      where: { interestedPartyId },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, versions }
  } catch (error) {
    console.error("Error fetching interested party versions:", error)
    return { success: false, error: "Failed to fetch versions" }
  }
}

// Create a new review for an interested party
export async function createInterestedPartyReview(interestedPartyId: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const reviewerName = formData.get("reviewerName") as string
    const reviewDetails = formData.get("reviewDetails") as string
    const reviewDate = new Date(formData.get("reviewDate") as string)
    const nextReviewDate = formData.get("nextReviewDate") ? 
      new Date(formData.get("nextReviewDate") as string) : 
      null

    // Create the review
    const review = await prisma.interestedPartyReview.create({
      data: {
        interestedPartyId,
        reviewerName,
        reviewDetails,
        reviewDate,
        nextReviewDate,
        createdById: user.id,
      },
    })

    revalidatePath("/interested-parties")
    return { success: true, id: review.id }
  } catch (error) {
    console.error("Error creating interested party review:", error)
    return { success: false, error: "Failed to create review" }
  }
}

// Get reviews for an interested party
export async function getInterestedPartyReviews(interestedPartyId: string) {
  try {
    const reviews = await prisma.interestedPartyReview.findMany({
      where: { interestedPartyId },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { reviewDate: 'desc' },
    })

    return { success: true, reviews }
  } catch (error) {
    console.error("Error fetching interested party reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

// Delete an interested party version
export async function deleteInterestedPartyVersion(versionId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedPartyVersion.delete({
      where: { id: versionId },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error deleting interested party version:", error)
    return { success: false, error: "Failed to delete version" }
  }
}

// Delete an interested party review
export async function deleteInterestedPartyReview(reviewId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.interestedPartyReview.delete({
      where: { id: reviewId },
    })

    revalidatePath("/interested-parties")
    return { success: true }
  } catch (error) {
    console.error("Error deleting interested party review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}