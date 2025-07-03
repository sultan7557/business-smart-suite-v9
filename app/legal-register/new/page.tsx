import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import LegalRegisterForm from "../legal-register-form"

export default async function NewLegalRegisterPage() {
  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/legal-register")
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/legal-register" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to legal register
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Add/Edit legal register</h1>

      <LegalRegisterForm />
    </div>
  )
}