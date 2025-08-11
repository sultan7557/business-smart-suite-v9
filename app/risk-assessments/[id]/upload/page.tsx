import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default async function RiskAssessmentUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write", "risk-assessments")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const riskAssessmentId = resolvedParams.id

  const riskAssessment = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
  })

  if (!riskAssessment) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Risk assessment not found.</p>
            <Button asChild className="mt-4">
              <Link href="/risk-assessments">Back to Risk Assessments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/risk-assessments/${riskAssessmentId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risk Assessment
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {riskAssessment.title}</CardTitle>
          <CardDescription>Upload a new version of this risk assessment document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Risk Level:</strong> {riskAssessment.riskLevel}
            <br />
            <strong>Issue Date:</strong> {new Date(riskAssessment.issueDate).toLocaleDateString()}
            <br />
            <strong>Owner:</strong> {riskAssessment.owner}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={riskAssessmentId} entityType="riskAssessment" />
    </div>
  )
}
