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

export default async function COSHHUploadPage({ params }: UploadPageProps) {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const resolvedParams = await params
  const coshhId = resolvedParams.id

  const coshh = await prisma.COSHH.findUnique({
    where: { id: coshhId },
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

  if (!coshh) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>COSHH not found.</p>
            <Button asChild className="mt-4">
              <Link href="/coshh">Back to COSHH</Link>
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
          <Link href={`/coshh/${coshhId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to COSHH
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {coshh.title}</CardTitle>
          <CardDescription>Upload a new version of this COSHH document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Issue Level:</strong> {coshh.version}
            <br />
            <strong>Issue Date:</strong> {new Date(coshh.reviewDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {coshh.department}
            <br />
            <strong>Category:</strong> {coshh.category.title}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={coshhId} entityType="coshh" />
    </div>
  )
}
