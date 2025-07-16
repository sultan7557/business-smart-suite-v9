import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import ObjectiveForm from "../objective-form"

export default function NewObjectivePageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new objective..." />}>
      <NewObjectivePage />
    </Suspense>
  )
}

async function NewObjectivePage() {
  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/objectives")
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/objectives" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Objectives
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create New Objective</h1>

      <ObjectiveForm />
    </div>
  )
}