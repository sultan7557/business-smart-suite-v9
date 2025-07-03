import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DocumentUpload from "@/components/document-upload"
import prisma from "@/lib/prisma"

interface UploadPageProps {
  params: Promise<{ id: string }>
}

export default async function ProcedureUploadPage({ params }: UploadPageProps) {
  const resolvedParams = await params;
  const procedureId = resolvedParams.id;
  
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId },
  })

  if (!procedure) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Procedure not found.</p>
            <Button asChild className="mt-4">
              <Link href="/procedures">Back to Procedures</Link>
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
          <Link href={`/procedures/${procedureId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procedure
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {procedure.title}</CardTitle>
          <CardDescription>Upload a new version of this procedure document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {procedure.version}
            <br />
            <strong>Issue Date:</strong> {new Date(procedure.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {procedure.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={procedureId} entityType="procedure" />
    </div>
  )
}