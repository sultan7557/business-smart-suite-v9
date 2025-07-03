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

interface TechnicalFilePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TechnicalFilePageProps) {
  const resolvedParams = await params
  const technicalFileId = resolvedParams.id

  const technicalFile = await prisma.technicalFile.findUnique({
    where: { id: technicalFileId },
    select: { title: true },
  })

  if (!technicalFile) {
    return {
      title: "Technical File Not Found | Business Smart Suite Portal",
    }
  }

  return {
    title: `${technicalFile.title} | Business Smart Suite Portal`,
    description: `View Technical File details for ${technicalFile.title}`,
  }
}

export default async function TechnicalFilePage({ params }: TechnicalFilePageProps) {
  const resolvedParams = await params
  const technicalFileId = resolvedParams.id
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")

  const technicalFile = await prisma.technicalFile.findUnique({
    where: { id: technicalFileId },
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
    },
  })

  if (!technicalFile) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = technicalFile.documents[0]

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/technical-file">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technical Files
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">{technicalFile.title}</h1>
          {technicalFile.archived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived</span>
          )}
          {technicalFile.highlighted && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">Highlighted</span>
          )}
          {technicalFile.approved && (
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">Approved</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Issue Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{technicalFile.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Issue Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(technicalFile.reviewDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{technicalFile.department}</p>
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
              {technicalFile.content && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Content</h3>
                  <div className="whitespace-pre-wrap">{technicalFile.content}</div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p>{technicalFile.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{formatDate(technicalFile.createdAt)}</p>
                  </div>
                  {technicalFile.updatedBy && (
                    <>
                      <div>
                        <p className="text-gray-500">Last Updated By</p>
                        <p>{technicalFile.updatedBy.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated At</p>
                        <p>{formatDate(technicalFile.updatedAt)}</p>
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
                <Link href={`/technical-file/${technicalFileId}/edit`}>Edit this Technical File</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/technical-file/${technicalFileId}/upload`}>Upload/Replace document</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={latestDocument.fileUrl}
              documentType={latestDocument.fileType}
              title={technicalFile.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">No document available. Please upload a document.</div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the Technical File including user, date and notes of what changed
          </p>

          {technicalFile.versions.length > 0 ? (
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
                {technicalFile.versions.map((version) => (
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
                          title={`${technicalFile.title} - Version ${version.version}`}
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
            technicalFileId={technicalFile.id}
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
              <p className="text-gray-500">Download the latest version of this Technical File.</p>
              <Button asChild>
                <a href={latestDocument.fileUrl} download>
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