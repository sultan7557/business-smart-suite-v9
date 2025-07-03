import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"

interface DocumentPageProps {
  params: Promise<{
    id: string
    documentId: string
  }>
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const canEdit = await hasPermission("write")
  
  // Await params before accessing its properties
  const { id, documentId } = await params;
  
  // Ensure id and documentId are defined
  if (!id || !documentId) {
    notFound()
  }
  
  const auditId = id;
  
  // Fetch the audit
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      auditDocuments: true,
    },
  })
  
  if (!audit) {
    notFound()
  }

  // Fetch the document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!document) {
    notFound()
  }

  // Fetch all documents for this audit for version history
  const allDocuments = await prisma.document.findMany({
    where: {
      relatedEntityId: auditId,
      relatedEntityType: "audit",
    },
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
  })

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <Button variant="outline" asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Link href={`/audit-schedule/${auditId}/documents`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to audit documents
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="document" className="border rounded-md overflow-hidden">
        <TabsList className="w-full bg-gray-100">
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="version-history">Version history</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="download" className="flex items-center">
            <Download className="h-4 w-4 mr-1" /> Download
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="border">
          <div className="h-[600px]">
            <iframe
              src={`/api/documents/download${document.fileUrl}`}
              className="w-full h-full"
              title={document.title}
            />
          </div>
        </TabsContent>

        <TabsContent value="version-history" className="border p-4">
          <p className="mb-4">
            Version history of the document including user, date and notes of what changed.
          </p>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Uploaded by</th>
              </tr>
            </thead>
            <tbody>
              {allDocuments.map((doc) => (
                <tr key={doc.id} className="border-b">
                  <td className="border p-2">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="border p-2 text-blue-600">{doc.title}</td>
                  <td className="border p-2">{doc.uploadedBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="p-4 text-center text-gray-500">
            <p>No reviews available for this document.</p>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <div className="p-4 text-center text-gray-500">
            <p>No custom permissions set for this document.</p>
          </div>
        </TabsContent>

        <TabsContent value="audits">
          <div className="p-4 text-center text-gray-500">
            <p>No audit records available for this document.</p>
          </div>
        </TabsContent>

        <TabsContent value="download">
          <div className="p-4 text-center">
            <Button className="flex items-center" asChild>
              <a href={`/api/documents/download${document.fileUrl}`} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" /> Download Document
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {canEdit && (
        <div className="mt-4 flex justify-between">
          <Button variant="secondary" asChild>
            <Link href={`/audit-schedule/${auditId}/upload`}>Replace this document</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/audit-schedule">Back to audit schedule</Link>
          </Button>
        </div>
      )}
    </div>
  )
} 