"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Calculate risk level based on likelihood and severity
function calculateRiskLevel(likelihood: number, severity: number): number {
  return likelihood * severity;
}

// Get all objectives
export async function getObjectives(includeArchived: boolean = false, showCompleted: boolean = false) {
  try {
    const objectives = await prisma.objective.findMany({
      where: {
        archived: includeArchived ? undefined : false,
        completed: showCompleted,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return { success: true, data: objectives };
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return { success: false, error: "Failed to fetch objectives" };
  }
}

// Get a single objective by ID
export async function getObjectiveById(id: string) {
  try {
    const objective = await prisma.objective.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
      },
    });
    
    if (!objective) {
      return { success: false, error: "Objective not found" };
    }
    
    return { success: true, data: objective };
  } catch (error) {
    console.error("Error fetching objective:", error);
    return { success: false, error: "Failed to fetch objective" };
  }
}

// Create a new objective
export async function createObjective(data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate risk level
    const riskLevel = calculateRiskLevel(data.likelihood, data.severity);

    const objective = await prisma.objective.create({
      data: {
        ...data,
        riskLevel,
        createdById: user.id as string,
      },
    });

    revalidatePath("/objectives");
    return { success: true, data: objective };
  } catch (error) {
    console.error("Error creating objective:", error);
    return { success: false, error: "Failed to create objective" };
  }
}

// Update an existing objective
export async function updateObjective(id: string, data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate risk level
    const riskLevel = calculateRiskLevel(data.likelihood, data.severity);

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        ...data,
        riskLevel,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/objectives");
    revalidatePath(`/objectives/${id}`);
    return { success: true, data: objective };
  } catch (error) {
    console.error("Error updating objective:", error);
    return { success: false, error: "Failed to update objective" };
  }
}

// Mark objective as completed
export async function completeObjective(id: string, dateCompleted: Date) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const objective = await prisma.objective.update({
      where: { id },
      data: {
        completed: true,
        dateCompleted,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/objectives");
    return { success: true, data: objective };
  } catch (error) {
    console.error("Error completing objective:", error);
    return { success: false, error: "Failed to complete objective" };
  }
}

// Archive/unarchive an objective
export async function toggleArchiveObjective(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const objective = await prisma.objective.findUnique({
      where: { id },
      select: { archived: true },
    });

    if (!objective) {
      return { success: false, error: "Objective not found" };
    }

    const updatedObjective = await prisma.objective.update({
      where: { id },
      data: {
        archived: !objective.archived,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/objectives");
    return { success: true, data: updatedObjective };
  } catch (error) {
    console.error("Error toggling archive status:", error);
    return { success: false, error: "Failed to toggle archive status" };
  }
}

// Delete an objective
export async function deleteObjective(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.objective.delete({
      where: { id },
    });

    revalidatePath("/objectives");
    return { success: true };
  } catch (error) {
    console.error("Error deleting objective:", error);
    return { success: false, error: "Failed to delete objective" };
  }
}

export async function toggleShowArchivedView(currentState: boolean) {
  "use server"
  
  try {
    return {
      success: true,
      data: !currentState,
      error: undefined
    }
  } catch (error: any) {
    return {
      success: false,
      data: currentState,
      error: error.message || "Failed to toggle archived view state"
    }
  }
}

// Objective Section Version Actions
export async function getObjectiveSectionVersions() {
  try {
    const versions = await prisma.objectiveSectionVersion.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: versions };
  } catch (error) {
    console.error("Error fetching objective section versions:", error);
    return { success: false, error: "Failed to fetch objective section versions" };
  }
}

export async function createObjectiveSectionVersion(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const version = await prisma.objectiveSectionVersion.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/objectives");
    return { success: true, data: version };
  } catch (error) {
    console.error("Error creating objective section version:", error);
    return { success: false, error: "Failed to create objective section version" };
  }
}

export async function deleteObjectiveSectionVersion(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.objectiveSectionVersion.delete({ where: { id } });
    revalidatePath("/objectives");
    return { success: true };
  } catch (error) {
    console.error("Error deleting objective section version:", error);
    return { success: false, error: "Failed to delete objective section version" };
  }
}

// Objective Section Review Actions
export async function getObjectiveSectionReviews() {
  try {
    const reviews = await prisma.objectiveSectionReview.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { reviewDate: "desc" },
    });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching objective section reviews:", error);
    return { success: false, error: "Failed to fetch objective section reviews" };
  }
}

export async function createObjectiveSectionReview(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const review = await prisma.objectiveSectionReview.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/objectives");
    return { success: true, data: review };
  } catch (error) {
    console.error("Error creating objective section review:", error);
    return { success: false, error: "Failed to create objective section review" };
  }
}

export async function deleteObjectiveSectionReview(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.objectiveSectionReview.delete({ where: { id } });
    revalidatePath("/objectives");
    return { success: true };
  } catch (error) {
    console.error("Error deleting objective section review:", error);
    return { success: false, error: "Failed to delete objective section review" };
  }
}