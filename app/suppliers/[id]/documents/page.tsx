// app/suppliers/[id]/documents/page.tsx

import { getSupplier } from "../../../actions/supplier-actions"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import DocumentUpload from "../../document-upload"
import { getUser } from "@/lib/auth"
import DocumentsTable from "../../documents-table"
import { unstable_noStore as noStore } from 'next/cache'

export const metadata = {
  title: "Supplier Documents | Business Smart Suite",
  description: "Manage supplier documents in the Business Smart Suite Portal",
}

export default async function SupplierDocumentsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  noStore()
  // Make sure params is properly typed and used
  const id = params.id;
  
  const user = await getUser()
  const canEdit = user?.role === "admin" || user?.role === "manager"
  const canDelete = user?.role === "admin"
  
  const result = await getSupplier(id)
  
  if (!result.success || !result.data) {
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
      
      <DocumentsTable documents={documents} supplierId={id} canDelete={canDelete} />
    </div>
  )
}