import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import AuditForm from "../../audit-form"
import AuditDocumentList from "@/app/components/audit-document-list"

interface EditAuditPageProps {
  params: {
    id: string
  }
}

export default async function EditAuditPage({ params }: EditAuditPageProps) {
  const canEdit = await hasPermission("write", "audit-schedule")
  
  if (!canEdit) {
    redirect("/audit-schedule")
  }

  const { id } = await params
  
  // Ensure params.id is defined
  if (!id) {
    redirect("/audit-schedule")
  }

  
  // Fetch the audit
  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      auditDocuments: true,
    },
  })
  
  if (!audit) {
    notFound()
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

  // Fetch all documents for this audit
  const documents = await prisma.document.findMany({
    where: {
      relatedEntityId: id,
      relatedEntityType: "audit",
    },
    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      uploadedAt: "desc",
    },
  })

  return (
    <div className="p-0">
      <div className="bg-blue-100 p-4">
        <Button variant="outline" asChild className="mb-4 bg-yellow-500 hover:bg-yellow-600 text-white">
          <Link href="/audit-schedule" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to audit schedule
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold mb-4">Edit Audit</h1>
        
        <AuditForm users={users} audit={audit} />
        
        {/* Show documents regardless of completion status */}
        <AuditDocumentList 
          documents={documents} 
          auditId={audit.id} 
          canEdit={canEdit} 
        />
      </div>
    </div>
  )
}