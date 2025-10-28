import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import RiskAssessmentTemplateForm from "@/components/risk-assessment-template-form"

export default function NewRiskAssessmentPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new risk assessment..." />}>
      <NewRiskAssessmentPage />
    </Suspense>
  )
}

async function NewRiskAssessmentPage() {
  const canEdit = await hasPermission("write", "risk-assessments")
  if (!canEdit) {
    notFound()
  }

  const categories = await prisma.riskAssessmentCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  if (categories.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Categories Available</CardTitle>
            <CardDescription>You need to create a category before adding a risk assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/risk-assessments">Back to Risk Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function createRiskAssessment(formData: any) {
    "use server"

    try {
      const user = await getUser()
      if (!user) {
        throw new Error("Unauthorized")
      }

      const {
        title,
        categoryId,
        version,
        reviewDate,
        nextReviewDate,
        department,
        whoMayBeHarmed,
        ppeRequirements,
        assessmentDetails,
        additionalRequirements
      } = formData

      if (!title || !categoryId || !version || !reviewDate || !department) {
        throw new Error("All fields are required")
      }

      // Validate date format
      const parsedDate = new Date(reviewDate)
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format")
      }

      // Get the highest order in this category
      const highestOrderRiskAssessment = await prisma.riskAssessment.findFirst({
        where: { categoryId },
        orderBy: { order: "desc" },
        select: { order: true },
      })

      const newOrder = highestOrderRiskAssessment ? highestOrderRiskAssessment.order + 1 : 1

      console.log("Creating risk assessment with data:", {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        department,
        order: newOrder,
        createdById: user.id
      })

      // Create the risk assessment with basic data first
      const riskAssessment = await prisma.riskAssessment.create({
        data: {
          title,
          categoryId,
          version,
          reviewDate: parsedDate,
          nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
          department,
          content: "", // Keep for backward compatibility
          highlighted: false,
          approved: false,
          createdById: user.id as string,
          order: newOrder,
          additionalRequirements: additionalRequirements || null
        },
      })

      console.log("Basic risk assessment created successfully:", riskAssessment.id)

      // Now add the template data if it exists
      if (whoMayBeHarmed) {
        try {
          await prisma.whoMayBeHarmed.create({
            data: {
              employees: whoMayBeHarmed.employees || false,
              contractors: whoMayBeHarmed.contractors || false,
              generalPublic: whoMayBeHarmed.generalPublic || false,
              visitors: whoMayBeHarmed.visitors || false,
              environment: whoMayBeHarmed.environment || false,
              others: whoMayBeHarmed.others || false,
              othersDescription: whoMayBeHarmed.othersDescription || null,
              riskAssessmentId: riskAssessment.id
            }
          })
          console.log("WhoMayBeHarmed data created successfully")
        } catch (error) {
          console.error("Error creating WhoMayBeHarmed data:", error)
        }
      }

      if (ppeRequirements) {
        try {
          await prisma.ppeRequirements.create({
            data: {
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
              othersDescription: ppeRequirements.othersDescription || null,
              riskAssessmentId: riskAssessment.id
            }
          })
          console.log("PPE Requirements data created successfully")
        } catch (error) {
          console.error("Error creating PPE Requirements data:", error)
        }
      }

      if (assessmentDetails && assessmentDetails.length > 0) {
        try {
          await prisma.assessmentDetail.createMany({
            data: assessmentDetails.map((detail: any, index: number) => ({
              hazardIdentified: detail.hazardIdentified,
              currentControls: detail.currentControls,
              severity: detail.severity,
              likelihood: detail.likelihood,
              riskFactor: detail.riskFactor,
              additionalControls: detail.additionalControls,
              residualRisk: detail.residualRisk,
              riskAssessmentId: riskAssessment.id,
              order: index + 1
            }))
          })
          console.log("Assessment Details data created successfully")
        } catch (error) {
          console.error("Error creating Assessment Details data:", error)
        }
      }

      console.log("Risk assessment created successfully:", riskAssessment.id)
      redirect(`/risk-assessments/${riskAssessment.id}`)
    } catch (error) {
      // Don't log NEXT_REDIRECT as an error - it's expected behavior
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error // Re-throw redirect errors without logging
      }
      console.error("Error creating risk assessment:", error)
      throw error
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/risk-assessments" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risk Assessments
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Risk Assessment</CardTitle>
          <CardDescription>Create a new comprehensive risk assessment using the standard template</CardDescription>
        </CardHeader>
        <CardContent>
          <RiskAssessmentTemplateForm
            canEdit={canEdit}
            isNew={true}
            onSave={createRiskAssessment}
            categories={categories}
          />
        </CardContent>
      </Card>
    </div>
  )
}
