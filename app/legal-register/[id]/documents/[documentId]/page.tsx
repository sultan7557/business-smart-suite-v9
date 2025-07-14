import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, History, Eye } from "lucide-react"
import Link from "next/link"
import DocumentPreview from "@/components/document-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DocumentDetailPageProps {
  params: {
    id: string
    documentId: string
  }
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id, documentId } = await params
  const user = await getUser()
  if (!user) notFound()

  const document = await prisma.legalRegisterDocument.findUnique({
    where: { id: documentId },
    include: {
      uploadedBy: true,
    },
  })
  if (!document) notFound()

  // Fetch reviews for this document
  const reviews = await prisma.legalRegisterReview.findMany({
    where: { legalRegisterId: document.legalRegisterId },
    include: { reviewedBy: true },
    orderBy: { reviewDate: "desc" },
  })

  return (
    <div className="p-4">
      <div className="mb-6">
        <a href="/legal-register" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to legal register
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-6">{document.title}</h1>
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 overflow-x-auto">
            <div className="flex-1 min-w-0">
              <DocumentPreview documentUrl={`/api/documents/download/${document.fileUrl}`} documentType={document.fileType} title={document.title} />
            </div>
            <div className="flex flex-col space-y-4 min-w-[200px] mt-4 md:mt-0">
              <a href={`/api/documents/download/${document.fileUrl}`} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                <Download className="h-4 w-4 mr-2" />Download
              </a>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Review Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.reviewedBy?.name || "Unknown"}</TableCell>
                    <TableCell>{review.details}</TableCell>
                    <TableCell>{format(new Date(review.reviewDate), "dd/MM/yyyy")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">No reviews available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
} 