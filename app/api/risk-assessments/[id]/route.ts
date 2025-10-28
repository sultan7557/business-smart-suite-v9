import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const riskAssessment = await prisma.riskAssessment.findUnique({
      where: { id },
      include: {
        category: true,
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
          orderBy: {
            reviewDate: "desc",
          },
          include: {
            document: true,
            createdBy: {
              select: {
                name: true,
              },
            },
          },
        },
        reviews: {
          orderBy: {
            reviewDate: "desc",
          },
          include: {
            reviewedBy: {
              select: {
                name: true,
              },
            },
          },
        },
        documents: true,
      },
    })

    if (!riskAssessment) {
      return NextResponse.json({ error: "Risk assessment not found" }, { status: 404 })
    }

    return NextResponse.json(riskAssessment)
  } catch (error) {
    console.error("Error fetching risk assessment:", error)
    return NextResponse.json({ error: "Failed to fetch risk assessment" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      title, 
      version, 
      reviewDate, 
      nextReviewDate, 
      department, 
      content, 
      categoryId, 
      highlighted, 
      approved,
      additionalRequirements,
      whoMayBeHarmed,
      ppeRequirements,
      assessmentDetails
    } = body

    if (!title || !version || !reviewDate || !department || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // First, delete existing template data if it exists
    await prisma.assessmentDetail.deleteMany({
      where: { riskAssessmentId: id }
    })

    await prisma.whoMayBeHarmed.deleteMany({
      where: { riskAssessmentId: id }
    })

    await prisma.ppeRequirements.deleteMany({
      where: { riskAssessmentId: id }
    })

    // Get the current risk assessment to compare version
    const currentRiskAssessment = await prisma.riskAssessment.findUnique({
      where: { id },
      select: { version: true }
    })

    const riskAssessment = await prisma.riskAssessment.update({
      where: { id },
      data: {
        title,
        version,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        additionalRequirements,
        updatedById: user.id,
        // Create new template data
        whoMayBeHarmed: whoMayBeHarmed ? {
          upsert: {
            create: {
              employees: whoMayBeHarmed.employees || false,
              contractors: whoMayBeHarmed.contractors || false,
              generalPublic: whoMayBeHarmed.generalPublic || false,
              visitors: whoMayBeHarmed.visitors || false,
              environment: whoMayBeHarmed.environment || false,
              others: whoMayBeHarmed.others || false,
              othersDescription: whoMayBeHarmed.othersDescription || null
            },
            update: {
              employees: whoMayBeHarmed.employees || false,
              contractors: whoMayBeHarmed.contractors || false,
              generalPublic: whoMayBeHarmed.generalPublic || false,
              visitors: whoMayBeHarmed.visitors || false,
              environment: whoMayBeHarmed.environment || false,
              others: whoMayBeHarmed.others || false,
              othersDescription: whoMayBeHarmed.othersDescription || null
            }
          }
        } : undefined,
        ppeRequirements: ppeRequirements ? {
          upsert: {
            create: {
              safetyBoots: ppeRequirements.safetyBoots || false,
              gloves: ppeRequirements.gloves || false,
              highVisTop: ppeRequirements.highVisTop || false,
              highVisTrousers: ppeRequirements.highVisTrousers || false,
              overalls: ppeRequirements.overalls || false,
              safetyHelmet: ppeRequirements.safetyHelmet || false,
              earDefenders: ppeRequirements.earDefenders || false,
              safetyGoggles: ppeRequirements.safetyGoggles || false,
              safetyGlasses: ppeRequirements.safetyGlasses || false,
              others: ppeRequirements.others || false,
              othersDescription: ppeRequirements.othersDescription || null
            },
            update: {
              safetyBoots: ppeRequirements.safetyBoots || false,
              gloves: ppeRequirements.gloves || false,
              highVisTop: ppeRequirements.highVisTop || false,
              highVisTrousers: ppeRequirements.highVisTrousers || false,
              overalls: ppeRequirements.overalls || false,
              safetyHelmet: ppeRequirements.safetyHelmet || false,
              earDefenders: ppeRequirements.earDefenders || false,
              safetyGoggles: ppeRequirements.safetyGoggles || false,
              safetyGlasses: ppeRequirements.safetyGlasses || false,
              others: ppeRequirements.others || false,
              othersDescription: ppeRequirements.othersDescription || null
            }
          }
        } : undefined,
        assessmentDetails: assessmentDetails ? {
          create: assessmentDetails.map((detail: any, index: number) => ({
            hazardIdentified: detail.hazardIdentified,
            currentControls: detail.currentControls,
            severity: detail.severity,
            likelihood: detail.likelihood,
            riskFactor: detail.riskFactor,
            additionalControls: detail.additionalControls,
            residualRisk: detail.residualRisk,
            order: index + 1
          }))
        } : undefined
      },
    })

    // Create a version entry if the version has changed or if this is a significant update
    if (currentRiskAssessment && currentRiskAssessment.version !== version) {
      await prisma.riskAssessmentVersion.create({
        data: {
          version: currentRiskAssessment.version, // Store the previous version
          reviewDate: new Date(reviewDate),
          notes: `Updated to version ${version}`,
          riskAssessmentId: id,
          createdById: user.id,
        },
      })
    }

    revalidatePath(`/risk-assessments/${id}`)
    revalidatePath("/risk-assessments")
    revalidatePath("/api/sections")

    return NextResponse.json(riskAssessment, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    })
  } catch (error) {
    console.error("Error updating risk assessment:", error)
    return NextResponse.json({ error: "Failed to update risk assessment" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params

    // First delete all versions
    await prisma.riskAssessmentVersion.deleteMany({
      where: { riskAssessmentId: id },
    })

    // Then delete all reviews
    await prisma.riskAssessmentReview.deleteMany({
      where: { riskAssessmentId: id },
    })

    // Finally delete the risk assessment
    await prisma.riskAssessment.delete({
      where: { id },
    })

    revalidatePath(`/risk-assessments/${id}`)
    revalidatePath("/risk-assessments")

    return NextResponse.json({ message: "Risk assessment deleted successfully" })
  } catch (error) {
    console.error("Error deleting risk assessment:", error)
    return NextResponse.json({ error: "Failed to delete risk assessment" }, { status: 500 })
  }
}, "delete")
