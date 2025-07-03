"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, FileText } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface DocumentPageProps {
  params: {
    id: string
  }
}

interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  size: number
  uploadedAt: string
  uploadedBy: {
    name: string
  }
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch document")
        }
        const data = await response.json()
        setDocument(data)
      } catch (error) {
        console.error("Error fetching document:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()
  }, [params.id])

  const handleDownload = () => {
    if (document) {
      window.open(document.fileUrl, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <p>Loading document...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <p>Document not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.fileType}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.uploadedBy.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(document.uploadedAt), "MMMM d, yyyy")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {document.fileType.startsWith("image/") ? (
                <img
                  src={document.fileUrl}
                  alt={document.title}
                  className="max-w-full h-auto rounded-lg"
                />
              ) : document.fileType === "application/pdf" ? (
                <iframe
                  src={document.fileUrl}
                  className="w-full h-[600px] rounded-lg"
                  title={document.title}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Preview not available</p>
                  <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 