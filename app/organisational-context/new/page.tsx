import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrganizationalContextForm from "../organizational-context-form"

export default function NewOrganizationalContextPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new organizational context entry..." />}>
      <NewOrganizationalContextPage />
    </Suspense>
  )
}

async function NewOrganizationalContextPage() {
  const canEdit = await hasPermission("write", "organizational-context")

  if (!canEdit) {
    redirect("/organisational-context")
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/organisational-context" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizational Context
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create New Organizational Context Entry</h1>

      <OrganizationalContextForm />
    </div>
  )
}