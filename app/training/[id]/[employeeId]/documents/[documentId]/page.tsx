import { getEmployee } from '../../../actions/training-actions'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

export default async function EmployeeDocumentPreviewPage({ params }: { params: { id: string, documentId: string } }) {
  const { id, documentId } = params
  const document = await prisma.employeeDocument.findUnique({
    where: { id: documentId },
    include: {
      uploadedBy: true,
    },
  })
  if (!document) {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Document Not Found</h1>
          <p className="mb-2">No employee document found with id: <code className="bg-gray-100 px-2 py-1 rounded">{documentId}</code></p>
          <p className="mb-2">Check that the document exists in the employeeDocument table and that the ID is correct.</p>
          <Link href={`/training/${id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to employee
          </Link>
        </div>
      )
    }
    return notFound()
  }
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Link href={`/training/${id}`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to employee
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{document.title}</h1>
        <Button asChild>
          <a href={`/api/training/documents/${document.id}/download`} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
      </div>
      <div className="border rounded-md p-4">
        {(() => {
          const fileType = document.fileType?.toLowerCase() || ''
          if (fileType.includes('pdf')) {
            return (
              <iframe
                src={`/api/training/documents/${document.id}/download`}
                className="w-full h-[600px] border-0 rounded-md bg-white"
                title={document.title}
              />
            )
          } else if (fileType.includes('image') || ["jpg","jpeg","png","gif"].some(ext => document.title?.toLowerCase().endsWith(ext))) {
            return (
              <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-md">
                <img
                  src={`/api/training/documents/${document.id}/download`}
                  alt={document.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )
          } else {
            return (
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500 ml-2">Preview not available</p>
              </div>
            )
          }
        })()}
      </div>
      <div className="border rounded-md p-4">
        <h2 className="text-lg font-semibold mb-4">Document Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Uploaded by</p>
            <p className="font-medium">{document.uploadedBy?.name || 'Unknown'}</p>
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
  )
} 