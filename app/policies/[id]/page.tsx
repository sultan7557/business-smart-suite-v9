import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import PolicyForm from "@/components/policy-form"
import DocumentPreview from "@/components/document-preview"

interface PolicyPageProps {
  params: {
    id: string
  }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  // Await params before using its properties
  const resolvedParams = await params;
  const policyId = resolvedParams.id;
  const canEdit = await hasPermission("write");

  // Fetch policy with related data
  const policy = await prisma.policy.findUnique({
    where: {
      id: policyId,
    },
    include: {
      category: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      updatedBy: {
        select: {
          name: true,
        },
      },
      versions: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
          document: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      documents: {
        orderBy: {
          uploadedAt: "desc",
        },
        include: {
          uploadedBy: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!policy) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = policy.documents[0]

  return (
    <div className="p-4">
      {/* Back to Policies Button */}
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/policies" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">{policy.title}</h1>

      <div className="bg-yellow-100 p-3 mb-4 border-l-4 border-yellow-500">
        Last viewed: {new Date().toLocaleString()} (Current User)
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="version-history">Version history</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="download" className="flex items-center">
            <Download className="h-4 w-4 mr-1" /> Download
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="border p-4">
          <PolicyForm policy={policy} canEdit={canEdit} />

          {canEdit && (
            <div className="mt-8">
              <Button variant="secondary" className="w-full mb-2">
                Edit this document
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/policies/${policyId}/upload`}>Replace this document</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={`/api/documents/download/${latestDocument.fileUrl}`}
              documentType={latestDocument.fileType}
              title={policy.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No document available. Please upload a document.</p>
              {canEdit && (
                <Button variant="secondary" className="mt-4" asChild>
                  <Link href={`/policies/${policyId}/upload`}>Upload Document</Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the document including user, date and notes of what changed and a link to the document
            before change
          </p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Version</th>
                <th className="border p-2 text-left">Updated by</th>
                <th className="border p-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {policy.versions.map((version) => (
                <tr key={version.id} className="border-b">
                  <td className="border p-2">{new Date(version.issueDate).toLocaleDateString()}</td>
                  <td className="border p-2 text-blue-600">{version.version}</td>
                  <td className="border p-2">{version.createdBy.name}</td>
                  <td className="border p-2">{version.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="p-4 text-center text-gray-500">No reviews available for this document.</div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="p-4 text-center text-gray-500">No custom permissions set for this document.</div>
        </TabsContent>

        <TabsContent value="audits">
          <div className="p-4 text-center text-gray-500">No audit records available for this document.</div>
        </TabsContent>

        <TabsContent value="download">
          <div className="p-4 text-center">
            {latestDocument ? (
              <Button className="flex items-center" asChild>
                <a href={latestDocument.fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" /> Download Document
                </a>
              </Button>
            ) : (
              <div className="text-gray-500">No document available for download.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

