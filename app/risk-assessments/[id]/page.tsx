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
import { AddReviewDialog } from "./add-review-dialog"
import RiskAssessmentTemplateForm from "@/components/risk-assessment-template-form"

interface ViewPageProps {
  params: Promise<{ id: string }>
}

export default async function ViewRiskAssessmentPage({ params }: ViewPageProps) {
  const resolvedParams = await params
  const riskAssessmentId = resolvedParams.id
  const canEdit = await hasPermission("write", "risk-assessments")
  const canDelete = await hasPermission("delete", "risk-assessments")

  const riskAssessment = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
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

  if (!riskAssessment) {
    notFound()
  }

  // Get the latest document for preview
  const latestDocument = riskAssessment.documents[0]

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/risk-assessments" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risk Assessments
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{riskAssessment.title}</CardTitle>
              <CardDescription>
                Category: {riskAssessment.category.title}
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/risk-assessments/${riskAssessmentId}/edit`}>
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
            <p className="text-lg font-semibold">{riskAssessment.version}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Review Date</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{formatDate(riskAssessment.reviewDate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Department</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{riskAssessment.department}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="template" className="space-y-4">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="template">Template View</TabsTrigger>
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

        <TabsContent value="template" className="border">
          <Card>
            <CardContent className="p-6">
              <RiskAssessmentTemplateForm
                key={riskAssessment.id}
                riskAssessment={riskAssessment}
                canEdit={canEdit}
                categories={[riskAssessment.category]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="border">
          <Card>
            <CardContent className="space-y-4">
            {riskAssessment.content && (
              <div>
                  <h3 className="text-lg font-semibold mb-2">Content</h3>
                  <div className="whitespace-pre-wrap">{riskAssessment.content}</div>
              </div>
            )}

              <div className="border-t pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                    <p className="text-gray-500">Created By</p>
              <p>{riskAssessment.createdBy.name}</p>
            </div>
            <div>
                    <p className="text-gray-500">Created At</p>
                    <p>{formatDate(riskAssessment.createdAt)}</p>
            </div>
            {riskAssessment.updatedBy && (
                    <>
              <div>
                        <p className="text-gray-500">Last Updated By</p>
                <p>{riskAssessment.updatedBy.name}</p>
              </div>
              <div>
                        <p className="text-gray-500">Last Updated At</p>
                        <p>{formatDate(riskAssessment.updatedAt)}</p>
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
                <Link href={`/risk-assessments/${riskAssessmentId}/edit`}>Edit this risk assessment</Link>
              </Button>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={`/risk-assessments/${riskAssessmentId}/upload`}>Upload/Replace document</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="document" className="border">
          {latestDocument ? (
            <DocumentPreview
              documentUrl={`/api/documents/download/${latestDocument.fileUrl}`}
              documentType={latestDocument.fileType}
              title={riskAssessment.title}
            />
          ) : (
            <div className="p-4 text-center text-gray-500">No document available. Please upload a document.</div>
          )}
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the risk assessment including user, date and notes of what changed
          </p>

          {riskAssessment.versions.length > 0 ? (
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
                {riskAssessment.versions.map((version) => (
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
                          title={`${riskAssessment.title} - Version ${version.version}`}
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
            riskAssessmentId={riskAssessment.id}
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Download Risk Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PDF Download */}
              <div className="border rounded-lg p-6 text-center">
                <h4 className="text-md font-semibold mb-2">Generate PDF Report</h4>
                <p className="text-gray-600 mb-4">Download a comprehensive PDF report of this risk assessment with all details.</p>
                <Button asChild className="w-full">
                  <a href={`/api/risk-assessments/${riskAssessmentId}/pdf`} target="_blank">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </a>
                </Button>
              </div>

              {/* Document Download */}
              <div className="border rounded-lg p-6 text-center">
                <h4 className="text-md font-semibold mb-2">Download Original Document</h4>
                {latestDocument ? (
                  <>
                    <p className="text-gray-600 mb-4">Download the original uploaded document.</p>
                    <Button asChild className="w-full">
                      <a href={`/api/documents/download/${latestDocument.fileUrl}`} download>
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </a>
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500 mb-4">No original document available.</p>
                    <Button disabled className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      No Document Available
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 