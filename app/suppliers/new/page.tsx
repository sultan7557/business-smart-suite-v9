// app/suppliers/new/page.tsx

import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import SupplierForm from "../supplier-form"
import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'

export const metadata = {
  title: "New Supplier | Business Smart Suite",
  description: "Add a new supplier to the Business Smart Suite Portal",
}

export default function NewSupplierPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new supplier..." />}>
      <NewSupplierPage />
    </Suspense>
  )
}

async function NewSupplierPage() {
  const user = await getUser()
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Supplier</h1>
      <SupplierForm isEdit={false} />
    </div>
  )
}