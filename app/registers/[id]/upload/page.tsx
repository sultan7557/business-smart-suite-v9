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

export default async function RegisterUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write", "registers")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const registerId = resolvedParams.id

  const register = await prisma.register.findUnique({
    where: { id: registerId },
    include: {
      category: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!register) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Register not found.</p>
            <Button asChild className="mt-4">
              <Link href="/registers">Back to Registers</Link>
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
          <Link href={`/registers/${registerId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Register
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {register.title}</CardTitle>
          <CardDescription>Upload a new version of this register document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {register.version}
            <br />
            <strong>Review Date:</strong> {new Date(register.reviewDate).toLocaleDateString()}
            <br />
            <strong>Department:</strong> {register.department}
            <br />
            <strong>Category:</strong> {register.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={registerId} entityType="register" />
    </div>
  )
}
