import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { saveFile } from "@/lib/file-storage"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const entityId = formData.get("entityId") as string
    const entityType = formData.get("entityType") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Save the file to the local filesystem
    const savedFile = await saveFile(file)
    console.log("File saved:", savedFile)

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        fileUrl: savedFile.path, // Use the public path
        fileType: savedFile.mimeType,
        size: savedFile.size,
        uploadedById: user.id as string,
        relatedEntityId: entityId,
        relatedEntityType: entityType,
        policyId: entityType === "policy" ? entityId : undefined,
        manualId: entityType === "manual" ? entityId : undefined,
        procedureId: entityType === "procedure" ? entityId : undefined,
        formId: entityType === "form" ? entityId : undefined,
        certificateId: entityType === "certificate" ? entityId : undefined,
        correctiveActionId: entityType === "correctiveAction" ? entityId : undefined,
        businessContinuityId: entityType === "businessContinuity" ? entityId : undefined,
        managementReviewId: entityType === "managementReview" ? entityId : undefined,
        jobDescriptionId: entityType === "jobDescription" ? entityId : undefined,
        workInstructionId: entityType === "workInstruction" ? entityId : undefined,
        coshhId: entityType === "coshh" ? entityId : undefined,
        riskAssessmentId: entityType === "riskAssessment" ? entityId : undefined,
        registerId: entityType === "register" ? entityId : undefined,
        hseGuidanceId: entityType === "hseGuidance" ? entityId : undefined,
        technicalFileId: entityType === "technicalFile" ? entityId : undefined,
        environmentalGuidanceId: entityType === "environmentalGuidance" ? entityId : undefined,
        customSectionId: entityType === "customSection" ? entityId : undefined,
      },
    })

    console.log("Document created:", document)

    // If this is an IMS Aspect Impact document, create audit log
    if (entityType === "imsAspectImpact" && entityId) {
      try {
        await prisma.iMSAspectImpactDocumentAudit.create({
          data: {
            aspectImpactId: entityId,
            documentId: document.id,
            action: "UPLOAD",
            userId: user.id as string,
          },
        })
        console.log("IMS Aspect Impact document audit created")
      } catch (error) {
        console.error("Error creating IMS audit log:", error)
      }
    }

    // If this is a technical file document, create a new technical file version
    if (entityType === "technicalFile" && entityId) {
      const technicalFile = await prisma.technicalFile.findUnique({
        where: { id: entityId },
      })

      if (technicalFile) {
        // Increment version number
        const newVersion = (Number.parseInt(technicalFile.version || "0") + 1).toString()

        // Create new technical file version
        const technicalFileVersion = await prisma.technicalFileVersion.create({
          data: {
            technicalFileId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Technical file version created:", technicalFileVersion)

        // Update technical file with new version
        const updatedTechnicalFile = await prisma.technicalFile.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Technical file updated:", updatedTechnicalFile)
      }
    }

    // If this is an environmental guidance document, create a new environmental guidance version
    if (entityType === "environmentalGuidance" && entityId) {
      const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
        where: { id: entityId },
      })

      if (environmentalGuidance) {
        // Increment version number
        const newVersion = (Number.parseInt(environmentalGuidance.version || "0") + 1).toString()

        // Create new environmental guidance version
        const environmentalGuidanceVersion = await prisma.environmentalGuidanceVersion.create({
          data: {
            environmentalGuidanceId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Environmental guidance version created:", environmentalGuidanceVersion)

        // Update environmental guidance with new version
        const updatedEnvironmentalGuidance = await prisma.environmentalGuidance.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Environmental guidance updated:", updatedEnvironmentalGuidance)
      }
    }

    // If this is a risk assessment document, create a new risk assessment version
    if (entityType === "riskAssessment" && entityId) {
      const riskAssessment = await prisma.riskAssessment.findUnique({
        where: { id: entityId },
      })

      if (riskAssessment) {
        // Increment version number
        const newVersion = (Number.parseInt(riskAssessment.version || "0") + 1).toString()

        // Create new risk assessment version
        const riskAssessmentVersion = await prisma.riskAssessmentVersion.create({
          data: {
            riskAssessmentId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Risk assessment version created:", riskAssessmentVersion)

        // Update risk assessment with new version
        const updatedRiskAssessment = await prisma.riskAssessment.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Risk assessment updated:", updatedRiskAssessment)
      }
    }

    // If this is a COSHH document, create a new COSHH version
    if (entityType === "coshh" && entityId) {
      const coshh = await prisma.cOSHH.findUnique({
        where: { id: entityId },
      })

      if (coshh) {
        // Increment version number
        const newVersion = (Number.parseInt(coshh.version || "0") + 1).toString()

        // Create new COSHH version
        const coshhVersion = await prisma.cOSHHVersion.create({
          data: {
            coshhId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("COSHH version created:", coshhVersion)

        // Update COSHH with new version
        const updatedCOSHH = await prisma.cOSHH.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("COSHH updated:", updatedCOSHH)
      }
    }
    
    // If this is a policy document, create a new policy version
    if (entityType === "policy" && entityId) {
      const policy = await prisma.policy.findUnique({
        where: { id: entityId },
      })

      if (policy) {
        // Increment version number
        const newVersion = (Number.parseInt(policy.version) + 1).toString()

        // Create new policy version
        const policyVersion = await prisma.policyVersion.create({
          data: {
            policyId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Policy version created:", policyVersion)

        // Update policy with new version
        const updatedPolicy = await prisma.policy.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Policy updated:", updatedPolicy)
      }
    }
    
    // If this is a manual document, create a new manual version
    if (entityType === "manual" && entityId) {
      const manual = await prisma.manual.findUnique({
        where: { id: entityId },
      })

      if (manual) {
        // Increment version number
        const newVersion = (Number.parseInt(manual.version || "0") + 1).toString()

        // Create new manual version
        const manualVersion = await prisma.manualVersion.create({
          data: {
            manualId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Manual version created:", manualVersion)

        // Update manual with new version
        const updatedManual = await prisma.manual.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Manual updated:", updatedManual)
      }
    }
    
    // If this is a procedure document, create a new procedure version
    if (entityType === "procedure" && entityId) {
      const procedure = await prisma.procedure.findUnique({
        where: { id: entityId },
      })

      if (procedure) {
        // Increment version number
        const newVersion = (Number.parseInt(procedure.version || "0") + 1).toString()

        // Create new procedure version
        const procedureVersion = await prisma.procedureVersion.create({
          data: {
            procedureId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Procedure version created:", procedureVersion)

        // Update procedure with new version
        const updatedProcedure = await prisma.procedure.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Procedure updated:", updatedProcedure)
      }
    }
    
    // If this is a form document, create a new form version
    if (entityType === "form" && entityId) {
      const form = await prisma.form.findUnique({
        where: { id: entityId },
      })

      if (form) {
        // Increment version number
        const newVersion = (Number.parseInt(form.version || "0") + 1).toString()

        // Create new form version
        const formVersion = await prisma.formVersion.create({
          data: {
            formId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Form version created:", formVersion)

        // Update form with new version
        const updatedForm = await prisma.form.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Form updated:", updatedForm)
      }
    }

    // If this is a certificate document, create a new certificate version
    if (entityType === "certificate" && entityId) {
      const certificate = await prisma.certificate.findUnique({
        where: { id: entityId },
      })

      if (certificate) {
        // Increment version number
        const newVersion = (Number.parseInt(certificate.version || "0") + 1).toString()

        // Create new certificate version
        const certificateVersion = await prisma.certificateVersion.create({
          data: {
            certificateId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Certificate version created:", certificateVersion)

        // Update certificate with new version
        const updatedCertificate = await prisma.certificate.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Certificate updated:", updatedCertificate)
      }
    }

    // If this is a corrective action document, create a new corrective action version
    if (entityType === "correctiveAction" && entityId) {
      const correctiveAction = await prisma.correctiveAction.findUnique({
        where: { id: entityId },
      })

      if (correctiveAction) {
        // Increment version number
        const newVersion = (Number.parseInt(correctiveAction.version || "0") + 1).toString()

        // Create new corrective action version
        const correctiveActionVersion = await prisma.correctiveActionVersion.create({
          data: {
            correctiveActionId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Corrective action version created:", correctiveActionVersion)

        // Update corrective action with new version
        const updatedCorrectiveAction = await prisma.correctiveAction.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Corrective action updated:", updatedCorrectiveAction)
      }
    }

    // If this is a business continuity document, create a new business continuity version
    if (entityType === "businessContinuity" && entityId) {
      const businessContinuity = await prisma.businessContinuity.findUnique({
        where: { id: entityId },
      })

      if (businessContinuity) {
        // Increment version number
        const newVersion = (Number.parseInt(businessContinuity.version || "0") + 1).toString()

        // Create new business continuity version
        const businessContinuityVersion = await prisma.businessContinuityVersion.create({
          data: {
            businessContinuityId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Business continuity version created:", businessContinuityVersion)

        // Update business continuity with new version
        const updatedBusinessContinuity = await prisma.businessContinuity.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Business continuity updated:", updatedBusinessContinuity)
      }
    }

    // If this is a management review document, create a new management review version
    if (entityType === "managementReview" && entityId) {
      const managementReview = await prisma.managementReview.findUnique({
        where: { id: entityId },
      })

      if (managementReview) {
        // Increment version number
        const newVersion = (Number.parseInt(managementReview.version || "0") + 1).toString()

        // Create new management review version
        const managementReviewVersion = await prisma.managementReviewVersion.create({
          data: {
            managementReviewId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Management review version created:", managementReviewVersion)

        // Update management review with new version
        const updatedManagementReview = await prisma.managementReview.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Management review updated:", updatedManagementReview)
      }
    }

    // If this is a job description document, create a new job description version
    if (entityType === "jobDescription" && entityId) {
      const jobDescription = await prisma.jobDescription.findUnique({
        where: { id: entityId },
      })

      if (jobDescription) {
        // Increment version number
        const newVersion = (Number.parseInt(jobDescription.version || "0") + 1).toString()

        // Create new job description version
        const jobDescriptionVersion = await prisma.jobDescriptionVersion.create({
          data: {
            jobDescriptionId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Job description version created:", jobDescriptionVersion)

        // Update job description with new version
        const updatedJobDescription = await prisma.jobDescription.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Job description updated:", updatedJobDescription)
      }
    }

    // If this is a work instruction document, create a new work instruction version
    if (entityType === "workInstruction" && entityId) {
      const workInstruction = await prisma.workInstruction.findUnique({
        where: { id: entityId },
      })

      if (workInstruction) {
        // Increment version number
        const newVersion = (Number.parseInt(workInstruction.version || "0") + 1).toString()

        // Create new work instruction version
        const workInstructionVersion = await prisma.workInstructionVersion.create({
          data: {
            workInstructionId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Work instruction version created:", workInstructionVersion)

        // Update work instruction with new version
        const updatedWorkInstruction = await prisma.workInstruction.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Work instruction updated:", updatedWorkInstruction)
      }
    }

    // If this is a register document, create a new register version
    if (entityType === "register" && entityId) {
      const register = await prisma.register.findUnique({
        where: { id: entityId },
      })

      if (register) {
        // Increment version number
        const newVersion = (Number.parseInt(register.version || "0") + 1).toString()

        // Create new register version
        const registerVersion = await prisma.registerVersion.create({
          data: {
            registerId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Register version created:", registerVersion)

        // Update register with new version
        const updatedRegister = await prisma.register.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Register updated:", updatedRegister)
      }
    }

    // If this is an HSE guidance document, create a new HSE guidance version
    if (entityType === "hseGuidance" && entityId) {
      const hseGuidance = await prisma.hseGuidance.findUnique({
        where: { id: entityId },
      })

      if (hseGuidance) {
        // Increment version number
        const newVersion = (Number.parseInt(hseGuidance.version || "0") + 1).toString()

        // Create new HSE guidance version
        const hseGuidanceVersion = await prisma.hseGuidanceVersion.create({
          data: {
            hseGuidanceId: entityId,
            version: newVersion,
            reviewDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("HSE guidance version created:", hseGuidanceVersion)

        // Update HSE guidance with new version
        const updatedHseGuidance = await prisma.hseGuidance.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            reviewDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("HSE guidance updated:", updatedHseGuidance)
      }
    }

    // If this is a custom section document, create a new version
    if (entityType === "customSection" && entityId) {
      const customSection = await prisma.customSection.findUnique({
        where: { id: entityId },
      })

      if (customSection) {
        // Increment version number
        const newVersion = (Number.parseInt(customSection.version || "0") + 1).toString()

        // Create new custom section version
        const customSectionVersion = await prisma.customSectionVersion.create({
          data: {
            customSectionId: entityId,
            version: newVersion,
            issueDate: new Date(),
            notes: `Uploaded new document: ${title}`,
            createdById: user.id as string,
            documentId: document.id,
          },
        })

        console.log("Custom section version created:", customSectionVersion)

        // Update custom section with new version
        const updatedCustomSection = await prisma.customSection.update({
          where: { id: entityId },
          data: {
            version: newVersion,
            issueDate: new Date(),
            updatedById: user.id as string,
          },
        })

        console.log("Custom section updated:", updatedCustomSection)
      }
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const entityId = url.searchParams.get("entityId")
    const entityType = url.searchParams.get("entityType")

    let documents
    if (entityId && entityType) {
      documents = await prisma.document.findMany({
        where: {
          relatedEntityId: entityId,
          relatedEntityType: entityType,
        },
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
      })
    } else {
      documents = await prisma.document.findMany({
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
      })
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}