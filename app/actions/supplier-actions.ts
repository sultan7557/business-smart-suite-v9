// app/actions/supplier-actions.ts

"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { toast } from "@/components/ui/use-toast"
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function getSuppliers(includeArchived: boolean = false) {
  try {
    const where = includeArchived ? {} : { archived: false }
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            expiryDate: true,
            assignedUserId: true,
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    })
    return { success: true, data: suppliers }
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return { success: false, error: "Failed to fetch suppliers" }
  }
}

export async function getSupplier(id: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
            fileType: true,
            size: true,
            uploadedAt: true,
            expiryDate: true,
            assignedUserId: true,
            assignedUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { uploadedAt: 'desc' }
        },
        reviews: {
          orderBy: { reviewDate: "desc" },
        },
      },
    })
    
    if (!supplier) {
      return { success: false, error: "Supplier not found" }
    }
    
    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return { success: false, error: "Failed to fetch supplier" }
  }
}

export async function createSupplier(data: any) {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        name: data.name,
        provisionOf: data.provisionOf,
        certifications: data.certifications,
        contactName: data.contactName,
        address: data.address,
        contactNumber: data.contactNumber,
        website: data.website,
        dateAdded: data.dateAdded ? new Date(data.dateAdded) : new Date(),
        reviewFrequency: data.reviewFrequency,
        lastReviewDate: data.lastReviewDate ? new Date(data.lastReviewDate) : null,
        lastReviewedBy: data.lastReviewedBy,
        riskLikelihood: parseInt(data.riskLikelihood) || 1,
        riskSeverity: parseInt(data.riskSeverity) || 1,
        controlsRecommendations: data.controlsRecommendations,
        residualLikelihood: parseInt(data.residualLikelihood) || 1,
        residualSeverity: parseInt(data.residualSeverity) || 1,
      },
    })
    
    revalidatePath("/suppliers")
    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error creating supplier:", error)
    return { success: false, error: "Failed to create supplier" }
  }
}

export async function updateSupplier(id: string, data: any) {
  try {
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: data.name,
        provisionOf: data.provisionOf,
        certifications: data.certifications,
        contactName: data.contactName,
        address: data.address,
        contactNumber: data.contactNumber,
        website: data.website,
        dateAdded: data.dateAdded ? new Date(data.dateAdded) : undefined,
        reviewFrequency: data.reviewFrequency,
        lastReviewDate: data.lastReviewDate ? new Date(data.lastReviewDate) : null,
        lastReviewedBy: data.lastReviewedBy,
        riskLikelihood: data.riskLikelihood !== undefined ? parseInt(data.riskLikelihood) : undefined,
        riskSeverity: data.riskSeverity !== undefined ? parseInt(data.riskSeverity) : undefined,
        controlsRecommendations: data.controlsRecommendations,
        residualLikelihood: data.residualLikelihood !== undefined ? parseInt(data.residualLikelihood) : undefined,
        residualSeverity: data.residualSeverity !== undefined ? parseInt(data.residualSeverity) : undefined,
      },
    })
    
    revalidatePath("/suppliers")
    revalidatePath(`/suppliers/${id}`)
    return { success: true, data: supplier }
  } catch (error) {
    console.error("Error updating supplier:", error)
    return { success: false, error: "Failed to update supplier" }
  }
}

export async function archiveSupplier(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.supplier.update({
      where: { id },
      data: { archived: true },
    })
    
    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Error archiving supplier:", error)
    return { success: false, error: "Failed to archive supplier" }
  }
}

export async function unarchiveSupplier(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.supplier.update({
      where: { id },
      data: { archived: false },
    })
    
    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving supplier:", error)
    return { success: false, error: "Failed to unarchive supplier" }
  }
}

export async function getSupplierVersions() {
  try {
    const versions = await prisma.supplierVersion.findMany({
      orderBy: { number: "desc" },
    })
    return { success: true, data: versions }
  } catch (error) {
    console.error("Error fetching supplier versions:", error)
    return { success: false, error: "Failed to fetch supplier versions" }
  }
}

export async function addSupplierVersion(data: {
  date: string
  details: string
  updatedBy: string
}) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the highest version number
    const highestVersion = await prisma.supplierVersion.findFirst({
      orderBy: { number: "desc" },
    })
    
    const newVersionNumber = highestVersion ? highestVersion.number + 1 : 1
    
    const version = await prisma.supplierVersion.create({
      data: {
        number: newVersionNumber,
        date: new Date(data.date),
        details: data.details,
        updatedBy: data.updatedBy,
      },
    })
    
    revalidatePath("/suppliers")
    return { success: true, data: version }
  } catch (error) {
    console.error("Error adding supplier version:", error)
    return { success: false, error: "Failed to add supplier version" }
  }
}

export async function deleteSupplierVersion(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.supplierVersion.delete({
      where: { id },
    })
    
    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting supplier version:", error)
    return { success: false, error: "Failed to delete supplier version" }
  }
}

export async function getSupplierDocument(documentId: string) {
  try {
    const document = await prisma.supplierDocument.findUnique({
      where: { id: documentId },
      include: {
        uploadedBy: true,
        versions: {
          include: {
            createdBy: true
          },
          orderBy: {
            version: 'desc'
          }
        }
      }
    })
    
    if (!document) {
      return { success: false, error: "Document not found" }
    }
    
    return { success: true, data: document }
  } catch (error) {
    console.error("Error fetching document:", error)
    return { success: false, error: "Failed to fetch document" }
  }
}


export async function uploadSupplierDocument(supplierId: string, formData: FormData) {
  try {
    const user = await getUser();
    
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
    
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" };
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filePath = join(uploadDir, filename);
    
    // Ensure the uploads directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory exists already
    }
    
    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Get expiry date from form data
    const expiryDateStr = formData.get("expiryDate") as string;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
    
    // Create document record
    const document = await prisma.supplierDocument.create({
      data: {
        supplierId,
        title: file.name,
        fileUrl: `/uploads/${filename}`,
        fileType: file.type,
        size: file.size,
        uploadedById: user.id,
        expiryDate,
        versions: {
          create: {
            version: "1",
            fileUrl: `/uploads/${filename}`,
            createdById: user.id
          }
        }
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Don't revalidate immediately to avoid UI flicker
    // The optimistic update will handle the UI, and the next page load will show fresh data
    
    return { success: true, data: document };
  } catch (error) {
    console.error("Error uploading document:", error);
    return { success: false, error: "Failed to upload document" };
  }
}

export async function deleteSupplierDocument(documentId: string) {
  try {
    const user = await getUser()
    
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }
    
    const document = await prisma.supplierDocument.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return { success: false, error: "Document not found" }
    }
    
    // Delete file from storage
    await fetch(`/api/documents/delete/${document.fileUrl}`, {
      method: "DELETE"
    })
    
    // Delete document record
    await prisma.supplierDocument.delete({
      where: { id: documentId }
    })
    
    revalidatePath(`/suppliers/${document.supplierId}/documents`)
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

export async function deleteSupplier(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await prisma.supplier.delete({
      where: { id },
    })
    
    revalidatePath("/suppliers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return { success: false, error: "Failed to delete supplier" }
  }
}