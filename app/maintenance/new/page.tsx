import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import MaintenanceForm from "../maintenance-form"
import prisma from "@/lib/prisma"

export default function NewMaintenancePageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new maintenance item..." />}>
      <NewMaintenancePage />
    </Suspense>
  )
}

async function NewMaintenancePage() {
  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/maintenance")
  }

  // Fetch users for allocation
  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="p-4">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/maintenance" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Maintenance
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Create New Maintenance Item</h1>

      <MaintenanceForm users={users} />
    </div>
  )
}