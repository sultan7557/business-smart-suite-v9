import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentPreview from "@/components/document-preview"
import { ReviewsSection } from "./reviews-section"

interface ViewPageProps {
  params: Promise<{ id: string }>
}

export default async function ViewHseGuidancePage({ params }: ViewPageProps) {
  const resolvedParams = await params
  const hseGuidanceId = resolvedParams.id
  const canEdit = await hasPermission("write", "hse-guidance")
  const canDelete = await hasPermission("delete", "hse-guidance")

  const hseGuidance = await prisma.hseGuidance.findUnique({
    where: { id: hseGuidanceId },
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
        orderBy: {
          reviewDate: "desc",
        },
        include: {
          document: true,
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
      reviews: {
        orderBy: {
          reviewDate: "desc",
        },
        include: {
          reviewedBy: {
            select: {
              name: true,
            },
          },
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

  if (!hseGuidance) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = hseGuidance.documents[0]

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/hse-guidance" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HSE Guidance
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{hseGuidance.title}</CardTitle>
              <CardDescription>
                Category: {hseGuidance.category.title}
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/hse-guidance/${hseGuidanceId}/edit`}>
                    Edit
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{hseGuidance.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Review Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(hseGuidance.reviewDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-lg font-semibold">{hseGuidance.department}</p>
          </CardContent>
        </Card>
            </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="version-history">Version History</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="download" className="flex items-center">
            <Download className="h-4 w-4 mr-1" /> Download
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="border">
          <Card>
            <CardContent className="space-y-4">
              {hseGuidance.content && (
            <div>
                  <h3 className="text-lg font-semibold mb-2">Content</h3>
                  <div className="whitespace-pre-wrap">{hseGuidance.content}</div>
              </div>
            )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                    <p className="text-gray-500">Created By</p>
                    <p>{hseGuidance.createdBy.name}</p>
            </div>
              <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{formatDate(hseGuidance.createdAt)}</p>
              </div>
                  {hseGuidance.updatedBy && (
                    <>
            <div>
                        <p className="text-gray-500">Last Updated By</p>
                        <p>{hseGuidance.updatedBy.name}</p>
            </div>
            <div>
                        <p className="text-gray-500">Last Updated At</p>
                        <p>{formatDate(hseGuidance.updatedAt)}</p>
                      </div>
                    </>
                  )}
            </div>
              </div>
            </CardContent>
          </Card>

          {canEdit && (
            <div className="mt-8">
              <Button variant="secondary" className="w-full mb-2" asChild>
                <Link href={`/hse-guidance/${hseGuidanceId}/edit`}>Edit this HSE guidance</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/hse-guidance/${hseGuidanceId}/upload`}>Upload/Replace document</Link>
              </Button>
              </div>
            )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={`/api/documents/download/${latestDocument.fileUrl}`}
              documentType={latestDocument.fileType}
              title={hseGuidance.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">No document available. Please upload a document.</div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the HSE guidance including user, date and notes of what changed
          </p>

          {hseGuidance.versions.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Version</th>
                  <th className="border p-2 text-left">Updated by</th>
                  <th className="border p-2 text-left">Notes</th>
                  <th className="border p-2 text-left">Document</th>
                </tr>
              </thead>
              <tbody>
                {hseGuidance.versions.map((version) => (
                  <tr key={version.id}>
                    <td className="border p-2">{formatDate(version.reviewDate)}</td>
                    <td className="border p-2">{version.version}</td>
                    <td className="border p-2">{version.createdBy.name}</td>
                    <td className="border p-2">{version.notes}</td>
                    <td className="border p-2">
                      {version.document && (
                        <DocumentPreview
                          documentUrl={version.document.fileUrl}
                          documentType={version.document.fileType}
                          title={`${hseGuidance.title} - Version ${version.version}`}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No version history available.</p>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsSection
            hseGuidanceId={hseGuidance.id}
            canEdit={canEdit}
          />
        </TabsContent>

        <TabsContent value="permissions" className="border p-4">
          <p className="text-gray-500">Permissions management coming soon.</p>
        </TabsContent>

        <TabsContent value="audits" className="border p-4">
          <p className="text-gray-500">Audit history coming soon.</p>
        </TabsContent>

        <TabsContent value="download" className="border p-4">
          {latestDocument ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-500">Download the latest version of this HSE guidance.</p>
              <Button asChild>
                <a href={`/api/documents/download/${latestDocument.fileUrl}`} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </a>
              </Button>
          </div>
          ) : (
            <p className="text-gray-500">No document available to download.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 