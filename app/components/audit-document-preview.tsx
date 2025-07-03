"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  size: number
  uploadedAt: Date
  uploadedBy: {
    name: string
  }
}

interface AuditDocumentPreviewProps {
  auditId: string
  auditTitle: string
  canEdit?: boolean
}

export default function AuditDocumentPreview({ auditId, auditTitle, canEdit = false }: AuditDocumentPreviewProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/documents?entityId=${auditId}&entityType=audit`)
        if (!response.ok) {
          throw new Error("Failed to fetch documents")
        }
        const data = await response.json()
        setDocuments(data)
      } catch (error) {
        console.error("Error fetching documents:", error)
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [auditId, toast])

  const handleDownload = (document: Document) => {
    window.open(`/api/documents/download${document.fileUrl}`, "_blank")
  }

  // Get the latest document for preview
  const latestDocument = documents[0]

  return (
    <div className="mt-8 border rounded-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">Audit Documents</h2>
      
      {isLoading ? (
        <div className="p-4 text-center">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No documents uploaded</p>
          {canEdit && (
            <Button variant="secondary" className="mt-4" asChild>
              <Link href={`/audit-schedule/${auditId}/upload`}>Upload Document</Link>
            </Button>
          )}
        </div>
      ) : (
        <Tabs defaultValue="document">
          <TabsList className="w-full bg-gray-100">
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="version-history">Version history</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="download" className="flex items-center">
              <Download className="h-4 w-4 mr-1" /> Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="document" className="border">
            {latestDocument ? (
              <div className="h-[500px]">
                <iframe
                  src={`/api/documents/download${latestDocument.fileUrl}`}
                  className="w-full h-full"
                  title={latestDocument.title}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No document available for preview.</p>
              </div>
            )}
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
                {documents.map((doc) => (
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

          <TabsContent value="download">
            <div className="p-4 text-center">
              {latestDocument ? (
                <Button className="flex items-center" asChild>
                  <a href={`/api/documents/download${latestDocument.fileUrl}`} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Download Document
                  </a>
                </Button>
              ) : (
                <div className="text-gray-500">No document available for download.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {canEdit && documents.length > 0 && (
        <div className="p-4 border-t bg-gray-50 flex justify-between">
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