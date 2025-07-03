import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Download, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DocumentPreview from "@/components/document-preview"
import { ReviewsSection } from "./reviews-section"
import { AddReviewDialog } from "./add-review-dialog"
import { Register, RegisterVersion } from "@prisma/client"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { deleteItem } from "@/app/actions/register-actions"
import { RegisterAuditsTable } from "../register-audits-table"

interface RegisterPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: RegisterPageProps) {
  const resolvedParams = await params
  const registerId = resolvedParams.id

  const register = await prisma.register.findUnique({
    where: { id: registerId },
    select: { title: true },
  })

  if (!register) {
    return {
      title: "Register Not Found | Business Smart Suite Portal",
    }
  }

  return {
    title: `${register.title} | Business Smart Suite Portal`,
    description: `View register details for ${register.title}`,
  }
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const resolvedParams = await params
  const registerId = resolvedParams.id
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")

  const register = await prisma.register.findUnique({
    where: { id: registerId },
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

  if (!register) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = register.documents[0]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">{register.title}</h1>
          {register.archived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived</span>
          )}
          {register.highlighted && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">Highlighted</span>
          )}
          {register.approved && (
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
            <p className="text-lg font-semibold">{register.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Review Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(register.reviewDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{register.department}</p>
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
              <CardTitle>Register Details</CardTitle>
              <CardDescription>Category: {register.category.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {register.content && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Content</h3>
                  <div className="whitespace-pre-wrap">{register.content}</div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Created By</p>
                    <p>{register.createdBy.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{formatDate(register.createdAt)}</p>
                  </div>
                  {register.updatedBy && (
                    <>
                      <div>
                        <p className="text-gray-500">Last Updated By</p>
                        <p>{register.updatedBy.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated At</p>
                        <p>{formatDate(register.updatedAt)}</p>
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
                <Link href={`/registers/${registerId}/edit`}>Edit this register</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/registers/${registerId}/upload`}>Upload/Replace document</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={latestDocument.fileUrl}
              documentType={latestDocument.fileType}
              title={register.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">No document available. Please upload a document.</div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the register including user, date and notes of what changed
          </p>

          {register.versions.length > 0 ? (
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
                {register.versions.map((version) => (
                  <tr key={version.id} className="border-b">
                    <td className="border p-2">{formatDate(version.reviewDate)}</td>
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
              <AddReviewDialog registerId={registerId} canEdit={canEdit} />
            </div>
            <ReviewsSection registerId={registerId} canEdit={canEdit} />
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="p-4 text-center text-gray-500">No custom permissions set for this register.</div>
        </TabsContent>

        <TabsContent value="audits">
          <RegisterAuditsTable registerId={registerId} />
        </TabsContent>

        <TabsContent value="download">
          <div className="p-4 text-center">
            {latestDocument ? (
              <Button className="flex items-center" asChild>
                <a href={`/api/documents/download/${latestDocument.fileUrl}`} download>
                  <Download className="h-4 w-4 mr-2" /> Download Register Document
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