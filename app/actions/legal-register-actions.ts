"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"

export type LegalRegisterFormData = {
  section: string
  legislation: string
  webAddress?: string
  regulator: string
  requirements: string
  applicability: string
  complianceRating: string
  furtherAction?: string
  reviewed?: Date
  regions: string[]
}

export async function createLegalRegister(data: LegalRegisterFormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const legalRegister = await prisma.legalRegister.create({
      data: {
        ...data,
        createdById: user.id as string,
      },
    })

    revalidatePath("/legal-register")
    return { success: true, data: legalRegister }
  } catch (error) {
    console.error("Error creating legal register:", error)
    return { success: false, error: "Failed to create legal register" }
  }
}

export async function updateLegalRegister(id: string, data: LegalRegisterFormData) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const legalRegister = await prisma.legalRegister.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id as string,
      },
    })

    // Create a version record
    await prisma.legalRegisterVersion.create({
      data: {
        legalRegisterId: id,
        date: new Date(),
        details: "Updated legal register item",
        updatedById: user.id as string,
      },
    })

    revalidatePath("/legal-register")
    revalidatePath(`/legal-register/${id}`)
    return { success: true, data: legalRegister }
  } catch (error) {
    console.error("Error updating legal register:", error)
    return { success: false, error: "Failed to update legal register" }
  }
}

export async function archiveLegalRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.legalRegister.update({
      where: { id },
      data: {
        archived: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/legal-register")
    return { success: true }
  } catch (error) {
    console.error("Error archiving legal register:", error)
    return { success: false, error: "Failed to archive legal register" }
  }
}

export async function unarchiveLegalRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.legalRegister.update({
      where: { id },
      data: {
        archived: false,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/legal-register")
    return { success: true }
  } catch (error) {
    console.error("Error unarchiving legal register:", error)
    return { success: false, error: "Failed to unarchive legal register" }
  }
}

export async function deleteLegalRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Delete all related documents first
    await prisma.legalRegisterDocument.deleteMany({
      where: { legalRegisterId: id },
    })

    // Delete all related versions
    await prisma.legalRegisterVersion.deleteMany({
      where: { legalRegisterId: id },
    })

    // Delete all related reviews
    await prisma.legalRegisterReview.deleteMany({
      where: { legalRegisterId: id },
    })

    // Delete the legal register
    await prisma.legalRegister.delete({
      where: { id },
    })

    revalidatePath("/legal-register")
    return { success: true }
  } catch (error) {
    console.error("Error deleting legal register:", error)
    return { success: false, error: "Failed to delete legal register" }
  }
}

export async function approveLegalRegister(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.legalRegister.update({
      where: { id },
      data: {
        approved: true,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/legal-register")
    return { success: true }
  } catch (error) {
    console.error("Error approving legal register:", error)
    return { success: false, error: "Failed to approve legal register" }
  }
}

export async function addLegalRegisterReview(
  legalRegisterId: string,
  data: {
    reviewedById: string
    details: string
    reviewDate: Date
    nextReviewDate?: Date
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const review = await prisma.legalRegisterReview.create({
      data: {
        legalRegisterId,
        ...data,
      },
    })

    // Update the reviewed date on the legal register
    await prisma.legalRegister.update({
      where: { id: legalRegisterId },
      data: {
        reviewed: data.reviewDate,
        updatedById: user.id as string,
      },
    })

    revalidatePath(`/legal-register/${legalRegisterId}`)
    revalidatePath("/legal-register")
    return { success: true, data: review }
  } catch (error) {
    console.error("Error adding legal register review:", error)
    return { success: false, error: "Failed to add legal register review" }
  }
}

export async function uploadLegalRegisterDocument(
  legalRegisterId: string,
  documentData: {
    title: string
    fileUrl: string
    fileType: string
    size: number
  }
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Use a single transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the document
      const document = await tx.legalRegisterDocument.create({
        data: {
          ...documentData,
          uploadedById: user.id as string,
          legalRegisterId,
        },
        include: {
          uploadedBy: {
            select: { name: true }
          }
        }
      })

      // Verify the document was created and fetch the updated legal register
      const updatedLegalRegister = await tx.legalRegister.findUnique({
        where: { id: legalRegisterId },
        include: {
          documents: {
            include: {
              uploadedBy: {
                select: { name: true }
              }
            },
            orderBy: {
              uploadedAt: "desc"
            }
          }
        }
      })

      if (!updatedLegalRegister) {
        throw new Error("Legal register not found")
      }

      return { document, updatedLegalRegister }
    })

    // Immediately revalidate all related paths after successful transaction
    revalidatePath(`/legal-register/${legalRegisterId}`)
    revalidatePath(`/legal-register/${legalRegisterId}/edit`)
    revalidatePath("/legal-register")
    
    return { success: true, data: result.document }
  } catch (error) {
    console.error("Error uploading legal register document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

export async function deleteLegalRegisterReview(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const review = await prisma.legalRegisterReview.delete({
      where: { id },
    })

    revalidatePath(`/legal-register/${review.legalRegisterId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting legal register review:", error)
    return { success: false, error: "Failed to delete legal register review" }
  }
}

export async function addLegalRegisterVersion(
  legalRegisterId: string,
  data: {
    date: Date
    details: string
    updatedById: string
  },
) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = await prisma.legalRegisterVersion.create({
      data: {
        legalRegisterId,
        ...data,
      },
    })

    revalidatePath(`/legal-register/${legalRegisterId}`)
    return { success: true, data: version }
  } catch (error) {
    console.error("Error adding legal register version:", error)
    return { success: false, error: "Failed to add legal register version" }
  }
}

export async function deleteLegalRegisterVersion(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const version = await prisma.legalRegisterVersion.delete({
      where: { id },
    })

    revalidatePath(`/legal-register/${version.legalRegisterId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting legal register version:", error)
    return { success: false, error: "Failed to delete legal register version" }
  }
}

export async function getLegalRegister(id: string) {
  try {
    const legalRegister = await prisma.legalRegister.findUnique({
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
        versions: {
          include: {
            updatedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        reviews: {
          include: {
            reviewedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            reviewDate: "desc",
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
    })

    if (!legalRegister) {
      return { success: false, error: "Legal register not found" }
    }

    return { success: true, data: legalRegister }
  } catch (error) {
    console.error("Error fetching legal register:", error)
    return { success: false, error: "Failed to fetch legal register" }
  }
}

export async function getLegalRegisters(archived = false) {
  try {
    const legalRegisters = await prisma.legalRegister.findMany({
      where: {
        archived,
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
        versions: {
          include: {
            updatedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        reviews: {
          include: {
            reviewedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            reviewDate: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, data: legalRegisters }
  } catch (error) {
    console.error("Error fetching legal registers:", error)
    return { success: false, error: "Failed to fetch legal registers" }
  }
}

export async function getUnapprovedLegalRegisters() {
  try {
    const legalRegisters = await prisma.legalRegister.findMany({
      where: {
        archived: false,
        approved: false,
      },
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
    })

    return { success: true, data: legalRegisters }
  } catch (error) {
    console.error("Error fetching unapproved legal registers:", error)
    return { success: false, error: "Failed to fetch unapproved legal registers" }
  }
}

export async function getArchivedLegalRegisters() {
  try {
    const legalRegisters = await prisma.legalRegister.findMany({
      where: {
        archived: true,
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
    })

    return { success: true, data: legalRegisters }
  } catch (error) {
    console.error("Error fetching archived legal registers:", error)
    return { success: false, error: "Failed to fetch archived legal registers" }
  }
}