"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Trash } from "lucide-react"
import { format } from "date-fns"

type DocumentsTableProps = {
  documents: any[]
  supplierId: string
  canDelete: boolean
}

export default function DocumentsTable({ documents, supplierId, canDelete }: DocumentsTableProps) {
  const router = useRouter()

  const handleRowClick = (docId: string) => {
    router.push(`/suppliers/${supplierId}/documents/${docId}`)
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.length > 0 ? (
            documents.map((doc: any) => (
              <tr 
                key={doc.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(doc.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">{doc.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{doc.fileType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{(doc.size / 1024).toFixed(2)} KB</td>
                <td className="px-6 py-4 whitespace-nowrap">{format(new Date(doc.uploadedAt), "dd/MM/yyyy")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/suppliers/${supplierId}/documents/${doc.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  {canDelete && (
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No documents found for this supplier.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}


