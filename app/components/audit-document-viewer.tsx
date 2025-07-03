"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, X, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AuditDocument {
  id: string
  createdAt: Date
  auditId: string
  docType: string
  docId: string
  docName: string
}

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

interface AuditDocumentViewerProps {
  documents: AuditDocument[]
  auditId: string
}

export default function AuditDocumentViewer({ documents, auditId }: AuditDocumentViewerProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([])
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
        setUploadedDocuments(data)
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

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
  }

  const handleClose = () => {
    setSelectedDocument(null)
  }

  const handleDownload = (document: Document) => {
    window.open(`/api/documents/download${document.fileUrl}`, "_blank")
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Audit Documents</h3>
      
      {isLoading ? (
        <p>Loading documents...</p>
      ) : uploadedDocuments.length === 0 ? (
        <p className="text-muted-foreground">No documents uploaded</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uploadedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div 
                className="flex items-center cursor-pointer flex-grow"
                onClick={() => handleDocumentClick(doc)}
              >
                <FileText className="h-6 w-6 mr-3 text-blue-500" />
                <span className="truncate">{doc.title}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDownload(doc)}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedDocument} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedDocument?.title}</span>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="h-full">
              <iframe
                src={`/api/documents/download${selectedDocument.fileUrl}`}
                className="w-full h-full"
                title={selectedDocument.title}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 