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

export default async function ManagementReviewUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const managementReviewId = resolvedParams.id

  const managementReview = await prisma.managementReview.findUnique({
    where: { id: managementReviewId },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!managementReview) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Management review not found.</p>
            <Button asChild className="mt-4">
              <Link href="/management-reviews">Back to Management Reviews</Link>
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
          <Link href={`/management-reviews/${managementReviewId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Management Review
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {managementReview.title}</CardTitle>
          <CardDescription>Upload a new version of this management review document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {managementReview.version}
            <br />
            <strong>Review Date:</strong> {new Date(managementReview.reviewDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {managementReview.location}
            <br />
            <strong>Category:</strong> {managementReview.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={managementReviewId} entityType="managementReview" />
    </div>
  )
}
