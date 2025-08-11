import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import AuditDocumentList from "@/app/components/audit-document-list"

interface AuditDocumentsPageProps {
  params: {
    id: string
  }
}

export default async function AuditDocumentsPage({ params }: AuditDocumentsPageProps) {
  const canEdit = await hasPermission("write", "audit-schedule")


  // await params first
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{audit.title} - Documents</h1>
        <Button variant="outline" asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Link href="/audit-schedule" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to audit schedule
          </Link>
        </Button>
      </div>
      
      <AuditDocumentList 
        documents={documents} 
        auditId={audit.id} 
        canEdit={canEdit} 
      />
    </div>
  )
} 