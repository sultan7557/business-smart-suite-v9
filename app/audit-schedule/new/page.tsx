import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import AuditForm from "../audit-form"

export default async function NewAuditPage() {
  const canEdit = await hasPermission("write")
  
  if (!canEdit) {
    redirect("/audit-schedule")
  }
  
  // Fetch users for auditor selection
  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  })

  // Fetch live procedures, manuals, and registers
  const procedures = await prisma.procedure.findMany({
    where: { archived: false },
    select: { id: true, title: true, category: { select: { title: true } } },
    orderBy: { title: "asc" },
  })
  const manuals = await prisma.manual.findMany({
    where: { archived: false },
    select: { id: true, title: true, category: { select: { title: true } } },
    orderBy: { title: "asc" },
  })
  const registers = await prisma.register.findMany({
    where: { archived: false },
    select: { id: true, title: true, category: { select: { title: true } } },
    orderBy: { title: "asc" },
  })

  return (
    <div className="p-0">
      <div className="bg-blue-100 p-4">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/audit-schedule" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to audit schedule
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold mb-4">Add New Audit</h1>
        
        <AuditForm users={users} procedures={procedures} manuals={manuals} registers={registers} />
      </div>
    </div>
  )
}