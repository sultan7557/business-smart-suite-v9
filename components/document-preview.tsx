"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react"

interface DocumentPreviewProps {
  documentUrl: string
  documentType: string
  title: string
}

export default function DocumentPreview({ documentUrl, documentType, title }: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(3) // Default to 3 pages
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clean the document URL to avoid duplication and double slashes
  const cleanDocumentUrl = useMemo(() => {
    if (!documentUrl) return ""
    
    // If the URL already contains the full API path, return it as is
    if (documentUrl.startsWith('/api/documents/download/')) {
      return documentUrl
    }
    
    // If the URL starts with /uploads/, construct the proper API path
    if (documentUrl.startsWith('/uploads/')) {
      return `/api/documents/download${documentUrl}`
    }
    
    // If the URL doesn't start with /uploads/, assume it's just the filename
    return `/api/documents/download/uploads/${documentUrl}`
  }, [documentUrl])

  useEffect(() => {
    // Reset state when document changes
    setCurrentPage(1)
    setLoading(true)
    setError(null)

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [documentUrl])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getFileExtension = () => {
    // Extract extension from URL or use documentType
    const urlExt = documentUrl.split(".").pop()?.toLowerCase()

    if (urlExt === "pdf") return "pdf"
    if (["doc", "docx"].includes(urlExt || "")) return "docx"
    if (["jpg", "jpeg", "png", "gif"].includes(urlExt || "")) return "image"

    // Fallback to documentType
    if (documentType.includes("pdf")) return "pdf"
    if (documentType.includes("word") || documentType.includes("docx")) return "docx"
    if (
      documentType.includes("image") ||
      documentType.includes("jpg") ||
      documentType.includes("jpeg") ||
      documentType.includes("png")
    ) {
      return "image"
    }
    return "unknown"
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading document...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      )
    }

    const fileType = getFileExtension()
    console.log("File type:", fileType, "Document URL:", documentUrl)

    switch (fileType) {
      case "pdf":
        return (
          <iframe
            src={cleanDocumentUrl}
            className="w-full h-[600px] border-0"
            title={title}
            onError={(e) => {
              console.error("PDF load error:", e)
              setError("Failed to load PDF document")
            }}
          />
        )
      case "docx":
        // For Word documents, we can't preview them directly in the browser
        // We'll show a placeholder with document info
        return (
          <div className="w-full h-[600px] bg-white p-8 overflow-auto">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div className="w-1/3">
                <div className="text-center">
                  <div className="text-red-600 font-bold">AA XPRESS</div>
                </div>
              </div>
              <div className="w-1/3 text-center">
                <h2 className="font-bold">Document Preview</h2>
                <h2 className="font-bold">{title}</h2>
              </div>
              <div className="w-1/3 text-right text-sm">
                <div>Version: {currentPage}</div>
                <div>Date: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center h-96">
              <FileText className="h-24 w-24 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">Word Document Preview Not Available</p>
              <p className="text-sm text-gray-500 mb-6">Please download the document to view it</p>
              <Button asChild>
                <a href={cleanDocumentUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" /> Download Document
                </a>
              </Button>
            </div>
          </div>
        )
      case "image":
        return (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
            <img
              src={cleanDocumentUrl || "/placeholder.svg"}
              alt={title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error("Image load error:", e)
                setError("Failed to load image")
              }}
            />
          </div>
        )
      default:
        return (
          <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p>Preview not available for this file type.</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href={cleanDocumentUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" /> Download to view
                </a>
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        {renderPreview()}

        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={currentPage <= 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" className="flex items-center" asChild>
            <a href={cleanDocumentUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" /> Download
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

