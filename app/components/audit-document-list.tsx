"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

interface AuditDocumentListProps {
  documents: Document[]
  auditId: string
  canEdit?: boolean
}

export default function AuditDocumentList({ documents, auditId, canEdit = false }: AuditDocumentListProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Only run client-side code after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/audit-schedule/${auditId}/documents/${documentId}`)
  }

  const handleDownload = (fileUrl: string) => {
    window.open(`/api/documents/download${fileUrl}`, "_blank")
  }

  // Don't render interactive elements until after hydration
  if (!mounted) {
    return (
      <div className="mt-8 border rounded-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">Audit Documents</h2>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center flex-grow">
                  <FileText className="h-6 w-6 mr-3 text-blue-500" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <div className="h-8 w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 border rounded-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">Audit Documents</h2>
      
      {documents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No documents uploaded</p>
          {canEdit && (
            <Button variant="secondary" className="mt-4" asChild>
              <Link href={`/audit-schedule/${auditId}/edit`}>Upload Document</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div 
                  className="flex items-center cursor-pointer flex-grow"
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <FileText className="h-6 w-6 mr-3 text-blue-500" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDownload(doc.fileUrl)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 