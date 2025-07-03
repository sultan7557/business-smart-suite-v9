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

export default async function HseGuidanceUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const hseGuidanceId = resolvedParams.id

  const hseGuidance = await prisma.hseGuidance.findUnique({
    where: { id: hseGuidanceId },
  })

  if (!hseGuidance) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>HSE guidance not found.</p>
            <Button asChild className="mt-4">
              <Link href="/hse-guidance">Back to HSE Guidance</Link>
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
          <Link href={`/hse-guidance/${hseGuidanceId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HSE Guidance
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {hseGuidance.title}</CardTitle>
          <CardDescription>Upload a new version of this HSE guidance document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Version:</strong> {hseGuidance.version}
            <br />
            <strong>Review Date:</strong> {new Date(hseGuidance.reviewDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {hseGuidance.department}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={hseGuidanceId} entityType="hseGuidance" />
    </div>
  )
}
