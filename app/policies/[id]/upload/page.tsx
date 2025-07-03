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
  // Await params before using its properties
  const resolvedParams = await params;
  const policyId = resolvedParams.id as string;

  // Use Prisma directly instead of the getPolicyById function
  const policy = await prisma.policy.findUnique({
    where: {
      id: policyId,
    },
  })

  if (!policy) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p>Policy not found. The policy ID may be invalid or the policy has been deleted.</p>
            <Button asChild className="mt-4">
              <Link href="/policies">Back to Policies</Link>
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
          <Link href={`/policies/${policyId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policy
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Document for {policy.title}</CardTitle>
          <CardDescription>Upload a new version of this policy document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Current Version:</strong> {policy.version}
            <br />
            <strong>Issue Date:</strong> {new Date(policy.issueDate).toLocaleDateString()}
            <br />
            <strong>Location:</strong> {policy.location}
          </p>
        </CardContent>
      </Card>

      <DocumentUpload entityId={policyId} entityType="policy" />
    </div>
  )
}

