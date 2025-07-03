// app/suppliers/[id]/page.tsx

import { getSupplier } from "../../actions/supplier-actions"
import SupplierForm from "../supplier-form"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSupplierPage({ params }: PageProps) {
  const user = await getUser()
  
  if (!user) {
    redirect("/login")
  }
  
  // Await params before accessing its properties
  const { id } = await params;
  
  // Use the extracted id variable
  const supplierResult = await getSupplier(id)
  
  if (!supplierResult.success) {
    redirect("/suppliers")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Supplier</h1>
      <SupplierForm 
        supplier={supplierResult.data}
        isEdit={true}
      />
    </div>
  )
}