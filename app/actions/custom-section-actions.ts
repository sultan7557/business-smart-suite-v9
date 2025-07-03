"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { toast } from "sonner"

export async function moveCustomSectionDocument(documentId: string, newCategoryId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Get the document to be moved
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { customSection: true },
    })

    if (!document) {
      throw new Error("Document not found")
    }

    // Determine the target section type based on the new category ID
    const targetSection = await prisma.customSection.findUnique({
      where: { id: newCategoryId },
    })

    if (targetSection) {
      // Moving to a custom section
      await prisma.document.update({
        where: { id: documentId },
        data: {
          customSection: {
            connect: { id: newCategoryId }
          },
          // Clear other section references
          policy: { disconnect: true },
          manual: { disconnect: true },
          procedure: { disconnect: true },
          form: { disconnect: true },
          certificate: { disconnect: true },
          correctiveAction: { disconnect: true },
          businessContinuity: { disconnect: true },
          managementReview: { disconnect: true },
          jobDescription: { disconnect: true },
          workInstruction: { disconnect: true },
          riskAssessment: { disconnect: true },
          register: { disconnect: true },
          technicalFile: { disconnect: true },
          environmentalGuidance: { disconnect: true },
        },
      })
    } else {
      // Moving to a standard section
      // First, determine which category table to use based on the section type
      const sectionType = newCategoryId.split('-')[0]
      
      // Map section types to their corresponding Prisma relations
      const sectionTypeMap: Record<string, string> = {
        'manual': 'manual',
        'policy': 'policy',
        'procedure': 'procedure',
        'form': 'form',
        'certificate': 'certificate',
        'corrective-action': 'correctiveAction',
        'business-continuity': 'businessContinuity',
        'management-review': 'managementReview',
        'job-description': 'jobDescription',
        'work-instruction': 'workInstruction',
        'risk-assessment': 'riskAssessment',
        'register': 'register',
        'technical-file': 'technicalFile',
        'environmental-guidance': 'environmentalGuidance',
      }

      const relationField = sectionTypeMap[sectionType]
      if (!relationField) {
        throw new Error(`Invalid section type: ${sectionType}`)
      }

      // Update the document with the new category
      await prisma.document.update({
        where: { id: documentId },
        data: {
          [relationField]: {
            connect: { id: newCategoryId }
          },
          // Clear custom section reference
          customSection: { disconnect: true },
        },
      })
    }

    // Revalidate all relevant paths
    revalidatePath('/custom-sections')
    revalidatePath(`/custom-sections/${document.customSectionId}`)
    revalidatePath(`/${newCategoryId.split('-')[0]}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error moving document:', error)
    throw new Error('Failed to move document')
  }
} 