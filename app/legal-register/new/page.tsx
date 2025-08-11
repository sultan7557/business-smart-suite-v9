import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import LegalRegisterForm from "../legal-register-form"

export default function NewLegalRegisterPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new legal register..." />}>
      <NewLegalRegisterPage />
    </Suspense>
  )
}

async function NewLegalRegisterPage() {
  const canEdit = await hasPermission("write", "legal-register")

  if (!canEdit) {
    redirect("/legal-register")
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <a href="/legal-register" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to legal register
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add/Edit legal register</h1>

      <LegalRegisterForm />
    </div>
  )
}