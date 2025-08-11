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

export default async function BusinessContinuityUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write", "business-continuity")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const businessContinuityId = resolvedParams.id

  const businessContinuity = await prisma.businessContinuity.findUnique({
    where: { id: businessContinuityId },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!businessContinuity) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Business continuity not found.</p>
            <Button asChild className="mt-4">
              <Link href="/business-continuity">Back to Business Continuity</Link>
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
          <Link href={`/business-continuity/${businessContinuityId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Business Continuity
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {businessContinuity.title}</CardTitle>
          <CardDescription>Upload a new version of this business continuity document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {businessContinuity.version}
            <br />
            <strong>Issue Date:</strong> {new Date(businessContinuity.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {businessContinuity.location}
            <br />
            <strong>Category:</strong> {businessContinuity.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={businessContinuityId} entityType="businessContinuity" />
    </div>
  )
}
