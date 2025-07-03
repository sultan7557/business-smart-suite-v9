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

export default async function TechnicalFileUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const technicalFileId = resolvedParams.id

  const technicalFile = await prisma.technicalFile.findUnique({
    where: { id: technicalFileId },
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

  if (!technicalFile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Technical File not found.</p>
            <Button asChild className="mt-4">
              <Link href="/technical-file">Back to Technical Files</Link>
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
          <Link href={`/technical-file/${technicalFileId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technical File
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {technicalFile.title}</CardTitle>
          <CardDescription>Upload a new version of this Technical File document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Issue Level:</strong> {technicalFile.version}
            <br />
            <strong>Issue Date:</strong> {new Date(technicalFile.reviewDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {technicalFile.department}
            <br />
            <strong>Category:</strong> {technicalFile.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={technicalFileId} entityType="technicalFile" />
    </div>
  )
} 