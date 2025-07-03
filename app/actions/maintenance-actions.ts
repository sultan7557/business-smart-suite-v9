"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

// Get all maintenance items
export async function getMaintenanceItems(includeArchived: boolean = false, showCompleted: boolean = false, category?: string, subCategory?: string) {
  try {
    const whereClause: any = {
      archived: includeArchived ? undefined : false,
      completed: showCompleted,
    };

    if (category) {
      whereClause.category = category;
    }

    if (subCategory) {
      whereClause.subCategory = subCategory;
    }

    const items = await prisma.maintenance.findMany({
      where: whereClause,
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
        documents: {
          include: {
            uploadedBy: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });
    
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching maintenance items:", error);
    return { success: false, error: "Failed to fetch maintenance items" };
  }
}

// Get a single maintenance item by ID
export async function getMaintenanceItemById(id: string) {
  try {
    const item = await prisma.maintenance.findUnique({
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
        documents: {
          include: {
            uploadedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    });
    
    if (!item) {
      return { success: false, error: "Maintenance item not found" };
    }
    
    return { success: true, data: item };
  } catch (error) {
    console.error("Error fetching maintenance item:", error);
    return { success: false, error: "Failed to fetch maintenance item" };
  }
}

// Get all subcategories
export async function getSubCategories(category?: string) {
  try {
    const items = await prisma.maintenance.findMany({
      where: category ? { category } : undefined,
      select: {
        subCategory: true,
      },
      distinct: ['subCategory'],
    });
    
    const subCategories = items.map((item: { subCategory: string }) => item.subCategory);
    return { success: true, data: subCategories };
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return { success: false, error: "Failed to fetch subcategories" };
  }
}

// Create a new maintenance item
export async function createMaintenanceItem(data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await prisma.maintenance.create({
      data: {
        ...data,
        createdById: user.id as string,
      },
    });

    revalidatePath("/maintenance");
    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating maintenance item:", error);
    return { success: false, error: "Failed to create maintenance item" };
  }
}

// Update an existing maintenance item
export async function updateMaintenanceItem(id: string, data: any) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await prisma.maintenance.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${id}`);
    return { success: true, data: item };
  } catch (error) {
    console.error("Error updating maintenance item:", error);
    return { success: false, error: "Failed to update maintenance item" };
  }
}

// Mark maintenance item as completed
export async function completeMaintenanceItem(id: string, dateCompleted: Date, createNext: boolean, nextDueDate?: Date) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const currentItem = await prisma.maintenance.findUnique({
      where: { id },
    });

    if (!currentItem) {
      return { success: false, error: "Maintenance item not found" };
    }

    // Update the current item
    const item = await prisma.maintenance.update({
      where: { id },
      data: {
        completed: true,
        dateCompleted,
        createNext,
        nextDueDate,
        updatedById: user.id as string,
      },
    });

    // If createNext is true, create a new maintenance item
    if (createNext) {
      // Calculate next due date if not provided
      let calculatedNextDueDate = nextDueDate;
      if (!calculatedNextDueDate) {
        calculatedNextDueDate = new Date(currentItem.dueDate);
        
        // Add time based on frequency
        switch (currentItem.frequency.toLowerCase()) {
          case 'daily':
            calculatedNextDueDate.setDate(calculatedNextDueDate.getDate() + 1);
            break;
          case 'weekly':
            calculatedNextDueDate.setDate(calculatedNextDueDate.getDate() + 7);
            break;
          case 'monthly':
            calculatedNextDueDate.setMonth(calculatedNextDueDate.getMonth() + 1);
            break;
          case 'quarterly':
            calculatedNextDueDate.setMonth(calculatedNextDueDate.getMonth() + 3);
            break;
          case 'yearly':
          case 'annually':
            calculatedNextDueDate.setFullYear(calculatedNextDueDate.getFullYear() + 1);
            break;
          case 'two yearly':
          case 'bi-annually':
            calculatedNextDueDate.setFullYear(calculatedNextDueDate.getFullYear() + 2);
            break;
          case 'threeyearly':
            calculatedNextDueDate.setFullYear(calculatedNextDueDate.getFullYear() + 3);
            break;
          default:
            calculatedNextDueDate.setFullYear(calculatedNextDueDate.getFullYear() + 1);
        }
      }

      // Create new maintenance item
      await prisma.maintenance.create({
        data: {
          name: currentItem.name,
          category: currentItem.category,
          subCategory: currentItem.subCategory,
          supplier: currentItem.supplier,
          serialNumber: currentItem.serialNumber,
          reference: currentItem.reference,
          actionRequired: currentItem.actionRequired,
          frequency: currentItem.frequency,
          dueDate: calculatedNextDueDate,
          owner: currentItem.owner,
          allocatedTo: currentItem.allocatedTo,
          createdById: user.id as string,
        },
      });
    }

    revalidatePath("/maintenance");
    return { success: true, data: item };
  } catch (error) {
    console.error("Error completing maintenance item:", error);
    return { success: false, error: "Failed to complete maintenance item" };
  }
}

// Archive/unarchive a maintenance item
export async function toggleArchiveMaintenanceItem(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const item = await prisma.maintenance.findUnique({
      where: { id },
      select: { archived: true },
    });

    if (!item) {
      return { success: false, error: "Maintenance item not found" };
    }

    const updatedItem = await prisma.maintenance.update({
      where: { id },
      data: {
        archived: !item.archived,
        updatedById: user.id as string,
      },
    });

    revalidatePath("/maintenance");
    return { success: true, data: updatedItem };
  } catch (error) {
    console.error("Error toggling archive status:", error);
    return { success: false, error: "Failed to toggle archive status" };
  }
}

// Delete a maintenance item
export async function deleteMaintenanceItem(id: string) {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.maintenance.delete({
      where: { id },
    });

    revalidatePath("/maintenance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting maintenance item:", error);
    return { success: false, error: "Failed to delete maintenance item" };
  }
}

// Upload document for maintenance item
export async function uploadMaintenanceDocument(
  maintenanceId: string,
  file: File,
  title: string,
  notes?: string,
  existingDocumentId?: string
) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    if (notes) formData.append("notes", notes);
    if (existingDocumentId) formData.append("documentId", existingDocumentId);

    const response = await fetch(`/api/maintenance/${maintenanceId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

// Get document by ID
export async function getDocumentById(id: string) {
  try {
    const document = await prisma.maintenanceDocument.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
        versions: {
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        maintenance: true,
      },
    });
    
    if (!document) {
      return { success: false, error: "Document not found" };
    }
    
    // Ensure the fileUrl is properly formatted
    if (document.fileUrl && !document.fileUrl.startsWith('/api/')) {
      document.fileUrl = `/api/documents/download/${document.fileUrl.split('/').pop()}`;
    }
    
    // Ensure version URLs are properly formatted
    if (document.versions && document.versions.length > 0) {
      document.versions = document.versions.map((version: any) => {
        if (version.fileUrl && !version.fileUrl.startsWith('/api/')) {
          version.fileUrl = `/api/documents/download/${version.fileUrl.split('/').pop()}`;
        }
        return version;
      });
    }
    
    return { success: true, data: document };
  } catch (error) {
    console.error("Error fetching document:", error);
    return { success: false, error: "Failed to fetch document" };
  }
}

export async function getDocumentVersions(documentId: string) {
  try {
    const response = await fetch(`/api/maintenance/documents/${documentId}/versions`);
    if (!response.ok) {
      throw new Error("Failed to fetch document versions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching document versions:", error);
    throw error;
  }
}

export async function getDocumentVersion(documentId: string, versionId: string) {
  try {
    const response = await fetch(`/api/maintenance/documents/${documentId}/versions/${versionId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch document version");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching document version:", error);
    throw error;
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

// Maintenance Section Version Actions
export async function getMaintenanceSectionVersions() {
  try {
    const versions = await prisma.maintenanceSectionVersion.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: versions };
  } catch (error) {
    console.error("Error fetching maintenance section versions:", error);
    return { success: false, error: "Failed to fetch maintenance section versions" };
  }
}

export async function createMaintenanceSectionVersion(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const version = await prisma.maintenanceSectionVersion.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/maintenance");
    return { success: true, data: version };
  } catch (error) {
    console.error("Error creating maintenance section version:", error);
    return { success: false, error: "Failed to create maintenance section version" };
  }
}

export async function deleteMaintenanceSectionVersion(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.maintenanceSectionVersion.delete({ where: { id } });
    revalidatePath("/maintenance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting maintenance section version:", error);
    return { success: false, error: "Failed to delete maintenance section version" };
  }
}

// Maintenance Section Review Actions
export async function getMaintenanceSectionReviews() {
  try {
    const reviews = await prisma.maintenanceSectionReview.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { reviewDate: "desc" },
    });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching maintenance section reviews:", error);
    return { success: false, error: "Failed to fetch maintenance section reviews" };
  }
}

export async function createMaintenanceSectionReview(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const review = await prisma.maintenanceSectionReview.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/maintenance");
    return { success: true, data: review };
  } catch (error) {
    console.error("Error creating maintenance section review:", error);
    return { success: false, error: "Failed to create maintenance section review" };
  }
}

export async function deleteMaintenanceSectionReview(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.maintenanceSectionReview.delete({ where: { id } });
    revalidatePath("/maintenance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting maintenance section review:", error);
    return { success: false, error: "Failed to delete maintenance section review" };
  }
}