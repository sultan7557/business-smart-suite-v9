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

export default async function JobDescriptionUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write", "job-descriptions")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const jobDescriptionId = resolvedParams.id

  const jobDescription = await prisma.jobDescription.findUnique({
    where: { id: jobDescriptionId },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!jobDescription) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Job description not found.</p>
            <Button asChild className="mt-4">
              <Link href="/job-descriptions">Back to Job Descriptions</Link>
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
          <Link href={`/job-descriptions/${jobDescriptionId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Description
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {jobDescription.title}</CardTitle>
          <CardDescription>Upload a new version of this job description document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {jobDescription.version}
            <br />
            <strong>Review Date:</strong> {new Date(jobDescription.reviewDate).toLocaleDateString()}
            <br />
            <strong>Department:</strong> {jobDescription.department}
            <br />
            <strong>Category:</strong> {jobDescription.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={jobDescriptionId} entityType="jobDescription" />
    </div>
  )
}
