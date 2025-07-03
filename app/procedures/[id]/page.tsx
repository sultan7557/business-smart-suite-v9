import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Edit, Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentPreview from "@/components/document-preview"
import { AddReviewDialog } from "@/app/procedures/add-review-dialog"
import { ReviewsSection } from "@/app/procedures/reviews-section"
import { getProcedureReviews } from "@/app/actions/procedure-actions"
import { ProcedureAuditsTable } from "@/app/procedures/procedure-audits-table"

interface ProcedurePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProcedurePageProps) {
  const resolvedParams = await params;
  const procedureId = resolvedParams.id;
  
  const procedure = await prisma.procedure.findUnique({
    where: { id: procedureId }, // <-- FIXED: Using procedureId instead of params.id
    select: { title: true },
  })

  if (!procedure) {
    return {
      title: "Procedure Not Found | Business Smart Suite Portal",
    }
  }

  return {
    title: `${procedure.title} | Business Smart Suite Portal`,
    description: `View procedure details for ${procedure.title}`,
  }
}

export default async function ProcedurePage({ params }: ProcedurePageProps) {
  const resolvedParams = await params;
  const procedureId = resolvedParams.id;
  const canEdit = await hasPermission("write");

  // Fetch procedure with related data
  const procedure = await prisma.procedure.findUnique({
    where: {
      id: procedureId,
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

  if (!procedure) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = procedure.documents[0];

  const reviewsResponse = await getProcedureReviews(procedureId)
  const reviews = reviewsResponse.success ? reviewsResponse.data : []

  return (
    <div className="p-4">
      {/* Back to Procedures Button */}
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/procedures" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Procedures
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">{procedure.title}</h1>
          {procedure.archived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived</span>
          )}
          {procedure.highlighted && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">Highlighted</span>
          )}
          {procedure.approved && (
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">Approved</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{procedure.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Issue Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(procedure.issueDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{procedure.location}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
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

        <TabsContent value="details" className="border p-4">
          <Card>
            <CardHeader>
              <CardTitle>Procedure Details</CardTitle>
              <CardDescription>Category: {procedure.category.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {procedure.content && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Content</h3>
                  <div className="whitespace-pre-wrap">{procedure.content}</div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p>{procedure.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{formatDate(procedure.createdAt)}</p>
                  </div>
                  {procedure.updatedBy && (
                    <>
                      <div>
                        <p className="text-gray-500">Last Updated By</p>
                        <p>{procedure.updatedBy.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated At</p>
                        <p>{formatDate(procedure.updatedAt)}</p>
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
                <Link href={`/procedures/${procedureId}/edit`}>Edit this procedure</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/procedures/${procedureId}/upload`}>Upload/Replace document</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={latestDocument.fileUrl}
              documentType={latestDocument.fileType}
              title={procedure.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">No document available. Please upload a document.</div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the procedure including user, date and notes of what changed
          </p>

          {procedure.versions.length > 0 ? (
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
                {procedure.versions.map((version) => (
                  <tr key={version.id} className="border-b">
                    <td className="border p-2">{formatDate(version.issueDate)}</td>
                    <td className="border p-2 text-blue-600">{version.version}</td>
                    <td className="border p-2">{version.createdBy.name}</td>
                    <td className="border p-2">{version.notes || "-"}</td>
                    <td className="border p-2">
                      {version.document && (
                        <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                          <a href={`/api/documents/download/${version.document.fileUrl}`} download>
                            Download
                          </a>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">No version history available</div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <AddReviewDialog procedureId={procedureId} canEdit={canEdit} />
            </div>
            <ReviewsSection reviews={reviews} canEdit={canEdit} />
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="p-4 text-center text-gray-500">No custom permissions set for this procedure.</div>
        </TabsContent>

        <TabsContent value="audits">
          <ProcedureAuditsTable procedureId={procedureId} />
        </TabsContent>

        <TabsContent value="download">
          <div className="p-4 text-center">
            {latestDocument ? (
              <Button className="flex items-center" asChild>
                <a href={`/api/documents/download/${latestDocument.fileUrl}`} download>
                  <Download className="h-4 w-4 mr-2" /> Download Procedure Document
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