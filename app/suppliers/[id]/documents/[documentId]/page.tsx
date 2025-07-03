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
  const user = await getUser()
  if (!user) {
    return notFound()
  }
  
  const document = await prisma.supplierDocument.findUnique({
    where: { id: params.documentId },
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
              <Link href={`/suppliers/${params.id}`}>
            <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to supplier
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{document.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <a 
              href={`/api/documents/${document.id}/download`}
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
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-500 ml-2">Preview not available</p>
            </div>
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

        <div className="space-y-6">
          <div className="border rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Version History</h2>
            <div className="space-y-4">
              {document.versions.map((version) => (
                <div key={version.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-gray-500">
                        Created by {version.createdBy.name}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={`/api/documents/${document.id}/versions/${version.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(version.createdAt), "dd/MM/yyyy")}
                  </p>
                  {version.notes && (
                    <p className="text-sm mt-2">{version.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}