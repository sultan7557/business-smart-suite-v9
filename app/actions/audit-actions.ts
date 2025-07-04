"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { saveFile } from "@/lib/file-storage"


// Create a new audit
export async function createAudit(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const title = formData.get("title") as string
    const plannedStartDate = formData.get("plannedStartDate") as string
    const actualStartDate = formData.get("actualStartDate") as string
    const followUpDate = formData.get("followUpDate") as string
    const auditorId = formData.get("auditorId") as string
    const externalAuditor = formData.get("externalAuditor") as string
    const dateCompleted = formData.get("dateCompleted") as string
    const createNextAudit = formData.has("createNextAudit")
    const nextAuditDate = formData.get("nextAuditDate") as string
    let status = formData.get("status") as string || "not_started"

    // Set status to in_progress if actualStartDate is today or earlier and not completed
    if (actualStartDate && status !== "completed") {
      const today = new Date()
      const actual = new Date(actualStartDate)
      today.setHours(0,0,0,0)
      actual.setHours(0,0,0,0)
      if (actual <= today) {
        status = "in_progress"
      }
    }
    if (dateCompleted) {
      status = "completed"
    }

    // Get selected documents
    const procedures = formData.getAll("procedures") as string[]
    const manuals = formData.getAll("manuals") as string[]
    const registers = formData.getAll("registers") as string[]

    // Combine all documents
    const documents = [
      ...procedures.map(doc => ({ docType: "procedure", docId: doc, docName: doc })),
      ...manuals.map(doc => ({ docType: "manual", docId: doc, docName: doc })),
      ...registers.map(doc => ({ docType: "register", docId: doc, docName: doc })),
    ]

    // Find the next available audit number
    const maxAudit = await prisma.audit.findFirst({
      orderBy: { number: "desc" },
      select: { number: true },
    })
    const nextNumber = maxAudit && maxAudit.number ? maxAudit.number + 1 : 1

    // Create the audit
    const audit = await prisma.audit.create({
      data: {
        number: nextNumber,
        title,
        plannedStartDate: new Date(plannedStartDate),
        actualStartDate: actualStartDate ? new Date(actualStartDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        auditorId: auditorId || null,
        externalAuditor: externalAuditor || null,
        dateCompleted: dateCompleted ? new Date(dateCompleted) : null,
        createNextAudit,
        nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : null,
        createdById: user.id as string,
        status,
        hasGeneratedNextAudit: false,
      },
    })

    // Create audit documents
    if (documents.length > 0) {
      const auditDocuments = documents.map(doc => ({
        auditId: audit.id,
        docType: doc.docType,
        docId: doc.docId,
        docName: doc.docName,
      }))

      await prisma.auditDocument.createMany({
        data: auditDocuments,
      })
    }

    // Handle next audit creation if needed
    if (
      createNextAudit &&
      nextAuditDate &&
      status === "completed" &&
      !audit.hasGeneratedNextAudit
    ) {
      // Create next audit with copied fields
      const nextAudit = await prisma.audit.create({
        data: {
          number: nextNumber + 1,
          title,
          plannedStartDate: new Date(nextAuditDate),
          auditorId: auditorId || null,
          externalAuditor: externalAuditor || null,
          createdById: user.id as string,
          status: "not_started",
          hasGeneratedNextAudit: false,
        },
      })
      // Copy audit documents to next audit
      if (documents.length > 0) {
        const nextAuditDocuments = documents.map(doc => ({
          auditId: nextAudit.id,
          docType: doc.docType,
          docId: doc.docId,
          docName: doc.docName,
        }))
        await prisma.auditDocument.createMany({
          data: nextAuditDocuments,
        })
      }
      // Mark original audit as having generated next audit
      await prisma.audit.update({
        where: { id: audit.id },
        data: { hasGeneratedNextAudit: true },
      })
    }

    revalidatePath("/audit-schedule")
    return { success: true, id: audit.id }
  } catch (error) {
    console.error("Error creating audit:", error)
    return { success: false, error: `Failed to create audit: ${error}` }
  }
}

// Update an existing audit
export async function updateAudit(id: string, formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const title = formData.get("title") as string
    const plannedStartDate = formData.get("plannedStartDate") as string
    const actualStartDate = formData.get("actualStartDate") as string
    const followUpDate = formData.get("followUpDate") as string
    const auditorId = formData.get("auditorId") as string
    const externalAuditor = formData.get("externalAuditor") as string
    const dateCompleted = formData.get("dateCompleted") as string
    const createNextAudit = formData.has("createNextAudit")
    const nextAuditDate = formData.get("nextAuditDate") as string
    let status = formData.get("status") as string || "not_started"

    // Set status to in_progress if actualStartDate is today or earlier and not completed
    if (actualStartDate && status !== "completed") {
      const today = new Date()
      const actual = new Date(actualStartDate)
      today.setHours(0,0,0,0)
      actual.setHours(0,0,0,0)
      if (actual <= today) {
        status = "in_progress"
      }
    }
    if (dateCompleted) {
      status = "completed"
    }

    // Get selected documents
    const procedures = formData.getAll("procedures") as string[]
    const manuals = formData.getAll("manuals") as string[]
    const registers = formData.getAll("registers") as string[]

    // Combine all documents
    const documents = [
      ...procedures.map(doc => ({ docType: "procedure", docId: doc, docName: doc })),
      ...manuals.map(doc => ({ docType: "manual", docId: doc, docName: doc })),
      ...registers.map(doc => ({ docType: "register", docId: doc, docName: doc })),
    ]

    // Fetch the current audit to check hasGeneratedNextAudit
    const currentAudit = await prisma.audit.findUnique({ where: { id } })

    // Update the audit
    const audit = await prisma.audit.update({
      where: { id },
      data: {
        title,
        plannedStartDate: new Date(plannedStartDate),
        actualStartDate: actualStartDate ? new Date(actualStartDate) : null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        auditorId: auditorId || null,
        externalAuditor: externalAuditor || null,
        dateCompleted: dateCompleted ? new Date(dateCompleted) : null,
        createNextAudit,
        nextAuditDate: nextAuditDate ? new Date(nextAuditDate) : null,
        updatedById: user.id as string,
        status,
        hasGeneratedNextAudit: currentAudit?.hasGeneratedNextAudit || false,
      },
    })

    // Update audit documents
    await prisma.auditDocument.deleteMany({
      where: { auditId: id },
    })
    if (documents.length > 0) {
      const auditDocuments = documents.map(doc => ({
        auditId: audit.id,
        docType: doc.docType,
        docId: doc.docId,
        docName: doc.docName,
      }))
      await prisma.auditDocument.createMany({
        data: auditDocuments,
      })
    }

    // Handle next audit creation if needed
    if (
      createNextAudit &&
      nextAuditDate &&
      status === "completed" &&
      !audit.hasGeneratedNextAudit
    ) {
      // Find the next available audit number
      const maxAudit = await prisma.audit.findFirst({
        orderBy: { number: "desc" },
        select: { number: true },
      })
      const nextNumber = maxAudit && maxAudit.number ? maxAudit.number + 1 : 1
      // Create next audit with copied fields
      const nextAudit = await prisma.audit.create({
        data: {
          number: nextNumber,
          title,
          plannedStartDate: new Date(nextAuditDate),
          auditorId: auditorId || null,
          externalAuditor: externalAuditor || null,
          createdById: user.id as string,
          status: "not_started",
          hasGeneratedNextAudit: false,
        },
      })
      // Copy audit documents to next audit
      if (documents.length > 0) {
        const nextAuditDocuments = documents.map(doc => ({
          auditId: nextAudit.id,
          docType: doc.docType,
          docId: doc.docId,
          docName: doc.docName,
        }))
        await prisma.auditDocument.createMany({
          data: nextAuditDocuments,
        })
      }
      // Mark original audit as having generated next audit
      await prisma.audit.update({
        where: { id: audit.id },
        data: { hasGeneratedNextAudit: true },
      })
    }

    revalidatePath("/audit-schedule")
    revalidatePath(`/audit-schedule/${id}`)
    return { success: true, id: audit.id }
  } catch (error) {
    console.error("Error updating audit:", error)
    return { success: false, error: `Failed to update audit: ${error}` }
  }
}

// Delete an audit
export async function deleteAudit(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // First delete related audit documents
    await prisma.auditDocument.deleteMany({
      where: { auditId: id },
    })

    // Then delete the audit
    await prisma.audit.delete({
      where: { id },
    })

    revalidatePath("/audit-schedule")
    return { success: true }
  } catch (error) {
    console.error("Error deleting audit:", error)
    return { success: false, error: "Failed to delete audit" }
  }
}

// Update audit status
export async function updateAuditStatus(id: string, status: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    await prisma.audit.update({
      where: { id },
      data: {
        status,
        updatedById: user.id as string,
      },
    })

    revalidatePath("/audit-schedule")
    return { success: true }
  } catch (error) {
    console.error("Error updating audit:", error)
    return { 
      success: false, 
      error: `Failed to update audit: ${error}` 
    }
  }
}

// Upload audit documents
export async function uploadAuditDocument(formData: FormData) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      throw new Error("Unauthorized or invalid user")
    }

    const auditId = formData.get("auditId") as string
    if (!auditId) {
      throw new Error("Audit ID is required")
    }

    // Check if audit exists
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    })

    if (!audit) {
      throw new Error("Audit not found")
    }

    // Get files from form data
    const files = formData.getAll("files") as File[]
    if (!files || files.length === 0) {
      throw new Error("No files provided")
    }

    // Process each file
    for (const file of files) {
      try {
        // Save the file to the local filesystem
        const savedFile = await saveFile(file)
        console.log("File saved:", savedFile)
        
        // Create document record
        await prisma.document.create({
          data: {
            title: file.name,
            fileUrl: savedFile.path, // Use the public path
            fileType: savedFile.mimeType,
            size: savedFile.size,
            uploadedById: user.id as string,
            relatedEntityId: auditId,
            relatedEntityType: "audit",
          },
        })
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    revalidatePath(`/audit-schedule/${auditId}/edit`)
    return { success: true }
  } catch (error) {
    console.error("Error uploading audit documents:", error)
    return { success: false, error: `Failed to upload documents: ${error}` }
  }
}

// Toggle archive status of an audit
export async function toggleAuditArchive(id: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
    })

    if (!audit) {
      return { success: false, error: "Audit not found" }
    }

    await prisma.audit.update({
      where: { id },
      data: {
        archived: !audit.archived,
        updatedById: user.id,
      },
    })

    revalidatePath("/audit-schedule")
    return { success: true }
  } catch (error) {
    console.error("Error toggling audit archive status:", error)
    return { success: false, error: "Failed to update audit archive status" }
  }
}