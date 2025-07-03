// app/suppliers/page.tsx

import { getSuppliers, getSupplierVersions } from "../actions/supplier-actions"
import SuppliersClient from "./suppliers-client"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Suppliers | Business Smart Suite",
  description: "Manage suppliers in the Business Smart Suite Portal",
}

export default async function SuppliersPage() {
  const user = await getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Fetch suppliers and versions using server actions
  const [suppliersResult, versionsResult] = await Promise.all([
    getSuppliers(true),
    getSupplierVersions()
  ])

  if (!suppliersResult.success || !versionsResult.success) {
    throw new Error("Failed to fetch suppliers or versions")
  }

  // Determine user permissions
  const canEdit = user.role === "admin" || user.role === "manager"
  const canDelete = user.role === "admin"

  return (
    <SuppliersClient 
      suppliers={suppliersResult.data || []}
      versions={versionsResult.data || []}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}