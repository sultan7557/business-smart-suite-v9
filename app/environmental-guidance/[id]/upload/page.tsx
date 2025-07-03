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

export default async function EnvironmentalGuidanceUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const environmentalGuidanceId = resolvedParams.id

  const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
    where: { id: environmentalGuidanceId },
    select: { 
      title: true,
      version: true,
      reviewDate: true,
      department: true,
      category: {
        select: {
          title: true
        }
      }
    },
  })

  if (!environmentalGuidance) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Environmental Guidance not found.</p>
            <Button asChild className="mt-4">
              <Link href="/environmental-guidance">Back to Environmental Guidance</Link>
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
          <Link href={`/environmental-guidance/${environmentalGuidanceId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Environmental Guidance
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {environmentalGuidance.title}</CardTitle>
          <CardDescription>Upload a new version of this Environmental Guidance document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Issue Level:</strong> {environmentalGuidance.version}
            <br />
            <strong>Issue Date:</strong> {new Date(environmentalGuidance.reviewDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {environmentalGuidance.department}
            <br />
            <strong>Category:</strong> {environmentalGuidance.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={environmentalGuidanceId} entityType="environmentalGuidance" />
    </div>
  )
} 