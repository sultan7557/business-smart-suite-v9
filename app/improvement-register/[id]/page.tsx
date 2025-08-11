import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Download, FileText, Trash2 } from 'lucide-react'
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DocumentUpload from "../document-upload"
import { getUser } from "@/lib/auth"
import { deleteDocument } from "@/app/actions/improvement-register-actions"

interface ImprovementRegisterDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ImprovementRegisterDetailPage({ params }: ImprovementRegisterDetailPageProps) {
  const canEdit = await hasPermission("write", "improvement-register")
  const canDelete = await hasPermission("delete", "improvement-register")
  const user = await getUser()

  // Await params before accessing its properties
  const { id } = await params;

  if (!user) {
    notFound()
  }

  // Use the extracted id variable instead of params.id
  const improvementId = id
  const improvement = await prisma.improvementRegister.findUnique({
    where: { id: improvementId },
    include: {
      internalOwner: true,
      internalRaisedBy: true,
      completedBy: true,
      documents: {
        include: {
          uploadedBy: {
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
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          uploadedAt: "desc",
        },
      },
    },
  })

  if (!improvement) {
    notFound()
  }

  // Check if user has access to this improvement
  if (improvement.restrictedAccess && improvement.restrictedUsers.length > 0) {
    if (!improvement.restrictedUsers.includes(user.id as string)) {
      return (
        <div className="p-4">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/improvement-register" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to improvement register
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Restricted</h1>
                <p>You do not have permission to view this improvement register item.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/improvement-register" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to improvement register
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Improvement #{improvement.number}
          {improvement.numberSuffix && <span>-{improvement.numberSuffix}</span>}
        </h1>

        <div className="flex gap-2">
          {canEdit && (
            <Button asChild>
              <Link href={`/improvement-register/${improvementId}/edit`} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
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
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p>{improvement.category}</p>
                    {improvement.otherCategory && <p className="text-sm text-gray-500">{improvement.otherCategory}</p>}
                  </div>

                  <div>
                    <h3 className="font-medium">Improvement Type</h3>
                    <Badge variant={improvement.type === "OFI" ? "outline" : "destructive"}>{improvement.type}</Badge>
                  </div>

                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="whitespace-pre-wrap">{improvement.description}</p>
                  </div>

                  {improvement.originator && (
                    <div>
                      <h3 className="font-medium">Originator</h3>
                      <p>{improvement.originator}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Evaluated for similar non-conformances?</h3>
                      <p>{improvement.evaluatedForSimilar ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Changes required to risk analysis?</h3>
                      <p>{improvement.requiresRiskAnalysis ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Affected policies/objectives?</h3>
                      <p>{improvement.affectedPolicies ? "Yes" : "No"}</p>
                    </div>

                    <div>
                      <h3 className="font-medium">Justified?</h3>
                      <p>{improvement.justified ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {improvement.containmentAction && (
                    <div>
                      <h3 className="font-medium">Containment Action</h3>
                      <p className="whitespace-pre-wrap">{improvement.containmentAction}</p>
                    </div>
                  )}

                  {improvement.rootCauseType && (
                    <div>
                      <h3 className="font-medium">Root Cause Type</h3>
                      <p>{improvement.rootCauseType}</p>
                    </div>
                  )}

                  {improvement.rootCause && (
                    <div>
                      <h3 className="font-medium">Root Cause</h3>
                      <p className="whitespace-pre-wrap">{improvement.rootCause}</p>
                    </div>
                  )}

                  {improvement.correctiveAction && (
                    <div>
                      <h3 className="font-medium">Corrective Action</h3>
                      <p className="whitespace-pre-wrap">{improvement.correctiveAction}</p>
                    </div>
                  )}

                  {improvement.comments && (
                    <div>
                      <h3 className="font-medium">Comments</h3>
                      <p className="whitespace-pre-wrap">{improvement.comments}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Owner Information</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Internal Owner</h4>
                      <p>
                        {improvement.internalOwner
                          ? `${improvement.internalOwner.name} (${improvement.internalOwner.email})`
                          : "Not assigned"}
                      </p>
                    </div>

                    {improvement.externalOwner && (
                      <div>
                        <h4 className="text-sm font-medium">External Owner</h4>
                        <p>{improvement.externalOwner}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium">Raised By (Internal)</h4>
                      <p>
                        {improvement.internalRaisedBy
                          ? `${improvement.internalRaisedBy.name} (${improvement.internalRaisedBy.email})`
                          : "Not specified"}
                      </p>
                    </div>

                    {improvement.externalRaisedBy && (
                      <div>
                        <h4 className="text-sm font-medium">Raised By (External)</h4>
                        <p>{improvement.externalRaisedBy}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">Date Raised</h4>
                        <p>{format(new Date(improvement.dateRaised), "dd/MM/yyyy")}</p>
                      </div>

                      {improvement.dateDue && (
                        <div>
                          <h4 className="text-sm font-medium">Date Due</h4>
                          <p>{format(new Date(improvement.dateDue), "dd/MM/yyyy")}</p>
                        </div>
                      )}

                      {improvement.dateActionTaken && (
                        <div>
                          <h4 className="text-sm font-medium">Date Action Taken</h4>
                          <p>{format(new Date(improvement.dateActionTaken), "dd/MM/yyyy")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Risk Analysis</h3>
                  <div className="space-y-4">
                    {improvement.likelihoodRating && (
                      <div>
                        <h4 className="text-sm font-medium">Likelihood Rating</h4>
                        <div className="flex space-x-4 mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div
                              key={`likelihood-${rating}`}
                              className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                                improvement.likelihoodRating === rating
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {rating}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {improvement.severityRating && (
                      <div>
                        <h4 className="text-sm font-medium">Severity Rating</h4>
                        <div className="flex space-x-4 mt-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <div
                              key={`severity-${rating}`}
                              className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                                improvement.severityRating === rating
                                  ? "bg-red-500 text-white border-red-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {rating}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {improvement.restrictedAccess && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">Restricted Access</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      This improvement register item has restricted access. Only selected users can view it.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6 bg-red-50">
                  <h3 className="font-medium mb-4">Closure Information</h3>
                  <div className="space-y-4">
                    {improvement.dateCompleted ? (
                      <>
                        <div>
                          <h4 className="text-sm font-medium">Date Completed</h4>
                          <p>{format(new Date(improvement.dateCompleted), "dd/MM/yyyy")}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium">Completed By</h4>
                          <p>
                            {improvement.completedBy
                              ? `${improvement.completedBy.name} (${improvement.completedBy.email})`
                              : "Not specified"}
                          </p>
                        </div>

                        {improvement.effectivenessOfAction && (
                          <div>
                            <h4 className="text-sm font-medium">Effectiveness of Action</h4>
                            <p className="whitespace-pre-wrap">{improvement.effectivenessOfAction}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium">Cost</h4>
                          <p>£{improvement.cost.toFixed(2)}</p>
                        </div>
                      </>
                    ) : (
                      <p>This improvement has not been completed yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              {improvement.documents.length > 0 ? (
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Versions
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {improvement.documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                <div className="ml-2">
                                  <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                  <div className="text-xs text-gray-500">{doc.fileType}</div>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {doc.versions.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    <span>Latest: v{doc.versions[0].version}</span>
                                    <span className="text-xs text-gray-400">
                                      {doc.versions.length} version{doc.versions.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                ) : (
                                  "No versions"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={doc.fileUrl} download target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </a>
                                </Button>
                                {canDelete && (
                                  <form action={async () => {
                                    "use server"
                                    await deleteDocument(doc.id)
                                  }}>
                                    <Button type="submit" variant="ghost" size="sm" className="text-red-500">
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Delete
                                    </Button>
                                  </form>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p>No documents attached to this improvement register item.</p>
              )}

              {canEdit && (
                <div className="mt-6">
                  <DocumentUpload improvementId={improvementId} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <p>History information not available for this improvement register item.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}