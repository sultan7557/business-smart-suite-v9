import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default async function FormUploadPage({ params }: UploadPageProps) {
  const resolvedParams = await params;
  const formId = resolvedParams.id;
  
  const form = await prisma.form.findUnique({
    where: { id: formId },
  })

  if (!form) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Form not found.</p>
            <Button asChild className="mt-4">
              <Link href="/forms">Back to Forms</Link>
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
          <Link href={`/forms/${formId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {form.title}</CardTitle>
          <CardDescription>Upload a new version of this form document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {form.version}
            <br />
            <strong>Issue Date:</strong> {new Date(form.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {form.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={formId} entityType="form" />
    </div>
  )
}