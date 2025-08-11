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

export default async function WorkInstructionUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write", "work-instructions")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const workInstructionId = resolvedParams.id

  const workInstruction = await prisma.workInstruction.findUnique({
    where: { id: workInstructionId },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!workInstruction) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Work instruction not found.</p>
            <Button asChild className="mt-4">
              <Link href="/work-instructions">Back to Work Instructions</Link>
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
          <Link href={`/work-instructions/${workInstructionId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Instruction
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {workInstruction.title}</CardTitle>
          <CardDescription>Upload a new version of this work instruction document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {workInstruction.version}
            <br />
            <strong>Review Date:</strong> {new Date(workInstruction.reviewDate).toLocaleDateString()}
            <br />
            <strong>Department:</strong> {workInstruction.department}
            <br />
            <strong>Category:</strong> {workInstruction.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={workInstructionId} entityType="workInstruction" />
    </div>
  )
}
