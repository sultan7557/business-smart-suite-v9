import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"

interface UploadPageProps {
  params: {
    id: string
  }
}

export default async function UploadPage({ params }: UploadPageProps) {
  const resolvedParams = await params;
  const manualId = resolvedParams.id;
  
  const manual = await prisma.manual.findUnique({
    where: { id: manualId },
  })

  if (!manual) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Manual not found.</p>
            <Button asChild className="mt-4">
              <Link href="/manual">Back to Manuals</Link>
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
          <Link href={`/manual/${manualId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manual
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {manual.title}</CardTitle>
          <CardDescription>Upload a new version of this manual document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {manual.version}
            <br />
            <strong>Issue Date:</strong> {new Date(manual.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {manual.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={manualId} entityType="manual" />
    </div>
  )
}
