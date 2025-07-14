// app/suppliers/[id]/documents/[documentId]/page.tsx

import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, History, FileText } from "lucide-react"
import Link from "next/link"

interface DocumentPageProps {
  params: {
    id: string
    documentId: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  // Await params if it is a Promise (for edge compatibility)
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const user = await getUser()
  if (!user) {
    return notFound()
  }
  const document = await prisma.supplierDocument.findUnique({
    where: { id: resolvedParams.documentId },
    include: {
      uploadedBy: true,
      versions: {
        include: {
          createdBy: true
        },
        orderBy: {
          version: 'desc'
        }
      }
    }
  })
  if (!document) {
    return notFound()
  }
  
  return (
    <div className="space-y-6">
      <a href="/suppliers" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to suppliers
      </a>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <a 
              href={`/api/suppliers/documents/${document.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
            >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
          </Button>
        </div>
      </div>
        
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Document Preview</h2>
            {(() => {
              const fileType = document.fileType?.toLowerCase() || '';
              if (fileType.includes('pdf')) {
                return (
                  <iframe
                    src={`/api/suppliers/documents/${document.id}/download`}
                    className="w-full h-[600px] border-0 rounded-md bg-white"
                    title={document.title}
                  />
                );
              } else if (fileType.includes('image') || ["jpg","jpeg","png","gif"].some(ext => document.title?.toLowerCase().endsWith(ext))) {
                return (
                  <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-md">
                    <img
                      src={`/api/suppliers/documents/${document.id}/download`}
                      alt={document.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                );
              } else {
                return (
                  <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500 ml-2">Preview not available</p>
                  </div>
                );
              }
            })()}
          </div>
            
          <div className="border rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Document Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Uploaded by</p>
                <p className="font-medium">{document.uploadedBy.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upload date</p>
                <p className="font-medium">{format(new Date(document.uploadedAt), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File type</p>
                <p className="font-medium">{document.fileType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File size</p>
                <p className="font-medium">{(document.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}