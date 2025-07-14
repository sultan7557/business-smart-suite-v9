import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Download, History, Eye, Printer, Archive, Trash2 } from 'lucide-react'
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getUser } from "@/lib/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import LegalRegisterDocumentUpload from "../legal-register-document-upload"

interface LegalRegisterDetailPageProps {
  params: {
    id: string
  }
}

export default async function LegalRegisterDetailPage({ params }: LegalRegisterDetailPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")
  const user = await getUser()

  if (!user) {
    notFound()
  }

  const legalRegister = await prisma.legalRegister.findUnique({
    where: { id },
    include: {
      createdBy: true,
      updatedBy: true,
      versions: {
        include: {
          updatedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      },
      reviews: {
        include: {
          reviewedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          reviewDate: "desc",
        },
      },
      documents: {
        include: {
          uploadedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  })

  if (!legalRegister) {
    notFound()
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <a href="/legal-register" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to legal register
        </a>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{legalRegister.legislation}</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          {canEdit && (
            <Button asChild>
              <Link href={`/legal-register/${id}/edit`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/legal-register/${id}/upload`} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Upload Document
              </Link>
            </Button>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Version History</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Brief details of amendment(s)</TableHead>
                      <TableHead>Updated by</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalRegister.versions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No version history available
                        </TableCell>
                      </TableRow>
                    ) : (
                      legalRegister.versions.map((version, index) => (
                        <TableRow key={version.id}>
                          <TableCell>{legalRegister.versions.length - index}</TableCell>
                          <TableCell>{format(new Date(version.date), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{version.details}</TableCell>
                          <TableCell>{version.updatedBy?.name || "Unknown"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Reviews
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Reviews</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Details of review</TableHead>
                      <TableHead>Review date</TableHead>
                      <TableHead>Next review date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legalRegister.reviews.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No reviews available
                        </TableCell>
                      </TableRow>
                    ) : (
                      legalRegister.reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>{review.reviewedBy?.name || "Unknown"}</TableCell>
                          <TableCell>{review.details}</TableCell>
                          <TableCell>{format(new Date(review.reviewDate), "dd/MM/yyyy")}</TableCell>
                          <TableCell>
                            {review.nextReviewDate ? format(new Date(review.nextReviewDate), "dd/MM/yyyy") : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-yellow-100 p-3 mb-4 border-l-4 border-yellow-500">
        <p>
          Last viewed: {new Date().toLocaleString()} ({user.name})
        </p>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Section</h3>
                    <p>{legalRegister.section}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Legislation</h3>
                    <p>{legalRegister.legislation}</p>
                  </div>

                  {legalRegister.webAddress && (
                    <div>
                      <h3 className="font-medium">Web Address</h3>
                      <a
                        href={legalRegister.webAddress}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {legalRegister.webAddress}
                      </a>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium">Regulator</h3>
                    <p>{legalRegister.regulator}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Requirements</h3>
                    <p className="whitespace-pre-wrap">{legalRegister.requirements}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Applicability</h3>
                    <p className="whitespace-pre-wrap">{legalRegister.applicability}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Compliance Rating</h3>
                    <Badge
                      variant={
                        legalRegister.complianceRating === "A"
                          ? "outline"
                          : legalRegister.complianceRating === "C"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {legalRegister.complianceRating}
                    </Badge>
                  </div>

                  {legalRegister.furtherAction && (
                    <div>
                      <h3 className="font-medium">Further Action</h3>
                      <p className="whitespace-pre-wrap">{legalRegister.furtherAction}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium">Regions</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {legalRegister.regions.map((region) => (
                        <Badge key={region} variant="outline">
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Metadata</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Created By</h4>
                      <p>{legalRegister.createdBy?.name || "Unknown"}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Created At</h4>
                      <p>{format(new Date(legalRegister.createdAt), "dd/MM/yyyy HH:mm:ss")}</p>
                    </div>

                    {legalRegister.updatedBy && (
                      <>
                        <div>
                          <h4 className="text-sm font-medium">Last Updated By</h4>
                          <p>{legalRegister.updatedBy.name || "Unknown"}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Last Updated At</h4>
                          <p>{format(new Date(legalRegister.updatedAt), "dd/MM/yyyy HH:mm:ss")}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <h4 className="text-sm font-medium">Reviewed</h4>
                      <p>
                        {legalRegister.reviewed
                          ? format(new Date(legalRegister.reviewed), "dd/MM/yyyy")
                          : "Never reviewed"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">Status</h4>
                      <p>{legalRegister.approved ? "Approved" : "Pending approval"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              {legalRegister.documents.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Attached Documents</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {legalRegister.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {doc.uploadedBy ? doc.uploadedBy.name : "Unknown"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {format(new Date(doc.uploadedAt), "dd/MM/yyyy HH:mm")}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </a>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/legal-register/${id}/documents/${doc.id}`}>Preview</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p>No documents attached to this legal register item.</p>
              )}

              {canEdit && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Upload Documents</h3>
                  <LegalRegisterDocumentUpload legalRegisterId={id} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}