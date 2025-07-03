import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default async function CertificateUploadPage({ params }: UploadPageProps) {
  const resolvedParams = await params;
  const certificateId = resolvedParams.id;
  
  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
  })

  if (!certificate) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Certificate not found.</p>
            <Button asChild className="mt-4">
              <Link href="/certificate">Back to Certificates</Link>
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
          <Link href={`/certificate/${certificateId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificate
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {certificate.title}</CardTitle>
          <CardDescription>Upload a new version of this certificate document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {certificate.version}
            <br />
            <strong>Issue Date:</strong> {new Date(certificate.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {certificate.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={certificateId} entityType="certificate" />
    </div>
  )
}