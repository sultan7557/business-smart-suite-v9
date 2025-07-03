import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default async function CorrectiveActionUploadPage({ params }: UploadPageProps) {
  const resolvedParams = await params;
  const correctiveActionId = resolvedParams.id;
  
  const correctiveAction = await prisma.correctiveAction.findUnique({
    where: { id: correctiveActionId },
  })

  if (!correctiveAction) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Corrective action not found.</p>
            <Button asChild className="mt-4">
              <Link href="/corrective-actions">Back to Corrective Actions</Link>
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
          <Link href={`/corrective-actions/${correctiveActionId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Corrective Action
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {correctiveAction.title}</CardTitle>
          <CardDescription>Upload a new version of this corrective action document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {correctiveAction.version}
            <br />
            <strong>Issue Date:</strong> {new Date(correctiveAction.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {correctiveAction.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={correctiveActionId} entityType="correctiveAction" />
    </div>
  )
}
