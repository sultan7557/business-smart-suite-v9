"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export type ImprovementFormData = {
  category: string
  otherCategory?: string
  number: number
  numberSuffix?: string
  type: string
  description: string
  originator?: string
  evaluatedForSimilar: boolean
  requiresRiskAnalysis: boolean
  affectedPolicies: boolean
  justified: boolean
  containmentAction?: string
  rootCauseType?: string
  rootCause?: string
  correctiveAction?: string
  comments?: string
  internalOwnerId?: string | null
  externalOwner?: string
  internalRaisedById?: string | null
  externalRaisedBy?: string
  dateRaised: Date
  dateDue?: Date
  dateActionTaken?: Date
  likelihoodRating?: number
  severityRating?: number
  restrictedAccess: boolean
  restrictedUsers: string[]
  dateCompleted?: Date
  completedById?: string | null
  effectivenessOfAction?: string
  cost: number
}

export async function getNextImprovementNumber() {
  const maxNumber = await prisma.improvementRegister.aggregate({
    _max: {
      number: true,
    },
  })

  return (maxNumber._max.number || 0) + 1
}

export async function createImprovementRegister(data: ImprovementFormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Clean up the data to handle optional fields
    const cleanData = {
      ...data,
      internalOwnerId: data.internalOwnerId || null,
      internalRaisedById: data.internalRaisedById || null,
      completedById: data.completedById || null,
      dateDue: data.dateDue || null,
      dateActionTaken: data.dateActionTaken || null,
      dateCompleted: data.dateCompleted || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const improvement = await prisma.improvementRegister.create({
      data: cleanData,
    })

    revalidatePath("/improvement-register")
    return { success: true, data: improvement }
  } catch (error) {
    console.error("Error creating improvement register:", error)
    return { success: false, error: "Failed to create improvement register" }
  }
}

export async function updateImprovementRegister(id: string, data: ImprovementFormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Clean up the data to handle optional fields and foreign keys
    const cleanData = {
      ...data,
      internalOwnerId: data.internalOwnerId || null,
      internalRaisedById: data.internalRaisedById || null,
      completedById: data.completedById || null,
      dateDue: data.dateDue || null,
      dateActionTaken: data.dateActionTaken || null,
      dateCompleted: data.dateCompleted || null,
      updatedAt: new Date(),
    }

    // Only verify users if they are provided and not null
    if (data.internalOwnerId) {
      const owner = await prisma.user.findUnique({
        where: { id: data.internalOwnerId },
      })
      if (!owner) {
        throw new Error("Selected internal owner does not exist")
      }
    }

    if (data.internalRaisedById) {
      const raisedBy = await prisma.user.findUnique({
        where: { id: data.internalRaisedById },
      })
      if (!raisedBy) {
        throw new Error("Selected internal raised by user does not exist")
      }
    }

    if (data.completedById) {
      const completedBy = await prisma.user.findUnique({
        where: { id: data.completedById },
      })
      if (!completedBy) {
        throw new Error("Selected completed by user does not exist")
      }
    }

    const improvement = await prisma.improvementRegister.update({
      where: { id },
      data: cleanData,
    })

    revalidatePath("/improvement-register")
    revalidatePath(`/improvement-register/${id}`)
    return { success: true, data: improvement }
  } catch (error: any) {
    console.error("Error updating improvement register:", error)
    return { 
      success: false, 
      error: error.message || "Failed to update improvement register" 
    }
  }
}

export async function archiveImprovementRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.improvementRegister.update({
      where: { id },
      data: {
        archived: true,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/improvement-register")
    return { success: true }
  } catch (error) {
    console.error("Error archiving improvement register:", error)
    return { success: false, error: "Failed to archive improvement register" }
  }
}

export async function restoreImprovementRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.improvementRegister.update({
      where: { id },
      data: {
        archived: false,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/improvement-register")
    return { success: true }
  } catch (error) {
    console.error("Error restoring improvement register:", error)
    return { success: false, error: "Failed to restore improvement register" }
  }
}

export async function deleteImprovementRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // First delete all associated documents
    await prisma.improvementDocument.deleteMany({
      where: { improvementId: id },
    })

    // Then delete the improvement register
    await prisma.improvementRegister.delete({
      where: { id },
    })

    revalidatePath("/improvement-register")
    return { success: true }
  } catch (error) {
    console.error("Error deleting improvement register:", error)
    return { success: false, error: "Failed to delete improvement register" }
  }
}

export async function getImprovementRegister(id: string) {
  try {
    const improvement = await prisma.improvementRegister.findUnique({
      where: { id },
      include: {
        internalOwner: true,
        internalRaisedBy: true,
        completedBy: true,
        documents: {
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
          },
          orderBy: {
            uploadedAt: "desc",
          },
        },
      },
    })

    if (!improvement) {
      return { success: false, error: "Improvement register not found" }
    }

    return { success: true, data: improvement }
  } catch (error) {
    console.error("Error fetching improvement register:", error)
    return { success: false, error: "Failed to fetch improvement register" }
  }
}

export async function getImprovementRegisters(archived = false) {
  try {
    const improvements = await prisma.improvementRegister.findMany({
      where: {
        archived,
      },
      include: {
        internalOwner: true,
        internalRaisedBy: true,
        completedBy: true,
        documents: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
            uploadedAt: true,
          },
        },
      },
      orderBy: {
        number: "desc",
      },
    })

    return { success: true, data: improvements }
  } catch (error) {
    console.error("Error fetching improvement registers:", error)
    return { success: false, error: "Failed to fetch improvement registers" }
  }
}

export async function uploadImprovementDocument(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const improvementId = formData.get("improvementId") as string

    if (!file || !title || !improvementId) {
      return { success: false, error: "Missing required fields" }
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "improvements", improvementId)
    try {
      await writeFile(join(uploadDir, "test.txt"), "")
    } catch (error) {
      // Directory doesn't exist, create it
      const fs = require("fs")
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name}`
    const filePath = join(uploadDir, fileName)
    
    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create the public URL
    const fileUrl = `/uploads/improvements/${improvementId}/${fileName}`

    // Create document
    const document = await prisma.improvementDocument.create({
      data: {
        title,
        fileUrl,
        fileType: file.type,
        size: file.size,
        improvementId,
        uploadedById: user.id,
        uploadedAt: new Date(),
        versions: {
          create: {
            version: "1",
            fileUrl,
            createdById: user.id,
            createdAt: new Date(),
          },
        },
      },
      include: {
        versions: true,
      },
    })

    revalidatePath(`/improvement-register/${improvementId}`)
    return { success: true, document }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

// Add a new version to an existing document
export async function addDocumentVersion(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const documentId = formData.get("documentId") as string
    const version = formData.get("version") as string
    const notes = formData.get("notes") as string
    const file = formData.get("file") as File

    if (!documentId || !version || !file) {
      throw new Error("Missing required fields")
    }

    // Get the document to find the improvement ID
    const document = await prisma.improvementDocument.findUnique({
      where: { id: documentId },
      select: { improvementId: true },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "improvements", document.improvementId)
    try {
      await writeFile(join(uploadDir, "test.txt"), "")
    } catch (error) {
      // Directory doesn't exist, create it
      const fs = require("fs")
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name}`
    const filePath = join(uploadDir, fileName)
    
    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create the public URL
    const fileUrl = `/uploads/improvements/${document.improvementId}/${fileName}`

    // Create document version record in database
    const documentVersion = await prisma.improvementDocumentVersion.create({
      data: {
        documentId,
        version,
        fileUrl,
        notes,
        createdById: user.id as string,
      },
    })

    revalidatePath(`/improvement-register/${document.improvementId}`)
    return { success: true, data: documentVersion }
  } catch (error) {
    console.error("Error adding document version:", error)
    return { success: false, error: "Failed to add document version" }
  }
}

// Delete a document
export async function deleteDocument(documentId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the document to find the improvement ID
    const document = await prisma.improvementDocument.findUnique({
      where: { id: documentId },
      select: { improvementId: true },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Delete all versions first
    await prisma.improvementDocumentVersion.deleteMany({
      where: { documentId },
    })

    // Then delete the document
    await prisma.improvementDocument.delete({
      where: { id: documentId },
    })

    revalidatePath(`/improvement-register/${document.improvementId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

// Improvement Register Section Version Actions
export async function getImprovementRegisterSectionVersions() {
  try {
    const versions = await prisma.improvementRegisterSectionVersion.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: versions };
  } catch (error) {
    console.error("Error fetching improvement register section versions:", error);
    return { success: false, error: "Failed to fetch improvement register section versions" };
  }
}

export async function createImprovementRegisterSectionVersion(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const version = await prisma.improvementRegisterSectionVersion.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/improvement-register");
    return { success: true, data: version };
  } catch (error) {
    console.error("Error creating improvement register section version:", error);
    return { success: false, error: "Failed to create improvement register section version" };
  }
}

export async function deleteImprovementRegisterSectionVersion(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.improvementRegisterSectionVersion.delete({ where: { id } });
    revalidatePath("/improvement-register");
    return { success: true };
  } catch (error) {
    console.error("Error deleting improvement register section version:", error);
    return { success: false, error: "Failed to delete improvement register section version" };
  }
}

// Improvement Register Section Review Actions
export async function getImprovementRegisterSectionReviews() {
  try {
    const reviews = await prisma.improvementRegisterSectionReview.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { reviewDate: "desc" },
    });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching improvement register section reviews:", error);
    return { success: false, error: "Failed to fetch improvement register section reviews" };
  }
}

export async function createImprovementRegisterSectionReview(data: any) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    const review = await prisma.improvementRegisterSectionReview.create({
      data: {
        ...data,
        createdById: user.id,
      },
    });
    revalidatePath("/improvement-register");
    return { success: true, data: review };
  } catch (error) {
    console.error("Error creating improvement register section review:", error);
    return { success: false, error: "Failed to create improvement register section review" };
  }
}

export async function deleteImprovementRegisterSectionReview(id: string) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "Unauthorized" };
    await prisma.improvementRegisterSectionReview.delete({ where: { id } });
    revalidatePath("/improvement-register");
    return { success: true };
  } catch (error) {
    console.error("Error deleting improvement register section review:", error);
    return { success: false, error: "Failed to delete improvement register section review" };
  }
}