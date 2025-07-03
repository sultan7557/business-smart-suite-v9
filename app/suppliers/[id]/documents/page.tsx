// app/suppliers/[id]/documents/page.tsx

import { getSupplier } from "../../../actions/supplier-actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, Trash } from 'lucide-react'
import DocumentUpload from "../../document-upload"
import { getUser } from "@/lib/auth"
import { format } from "date-fns"

export const metadata = {
  title: "Supplier Documents | Business Smart Suite",
  description: "Manage supplier documents in the Business Smart Suite Portal",
}

export default async function SupplierDocumentsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Make sure params is properly typed and used
  const id = params.id;
  
  const session = await auth()
  const user = session?.user
  const canEdit = user?.role === "admin" || user?.role === "manager"
  const canDelete = user?.role === "admin"
  
  const result = await getSupplier(id)
  
  if (!result.success) {
    redirect("/suppliers")
  }
  
  const supplier = result.data
  const documents = supplier.documents || []
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Documents for {supplier.name}</h1>
        <Button asChild variant="outline">
          <Link href={`/suppliers/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to supplier
          </Link>
        </Button>
      </div>
      
      {canEdit && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Upload Documents</h2>
          <DocumentUpload supplierId={params.id} />
        </div>
      )}
      
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
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{doc.fileType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{(doc.size / 1024).toFixed(2)} KB</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(doc.uploadedAt), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/suppliers/${params.id}/documents/${doc.id}`}>
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
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No documents found for this supplier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}