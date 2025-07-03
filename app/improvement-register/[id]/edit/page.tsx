import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import ImprovementRegisterForm from "../../improvement-register-form"
import DocumentUpload from "../../document-upload"

interface EditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditImprovementRegisterPage({ params }: EditPageProps) {
  const user = await getUser()
  if (!user) {
    return <div>Unauthorized</div>
  }

  // Await params before accessing its properties
  const { id } = await params;
  
  const improvementId = id

  const improvement = await prisma.improvementRegister.findUnique({
    where: { id: improvementId },
    include: {
      internalOwner: true,
      internalRaisedBy: true,
      completedBy: true,
      documents: {
        include: {
          versions: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
    },
  })

  if (!improvement) {
    return <div>Improvement not found</div>
  }

  // Fetch users for form selections
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/improvement-register/${improvementId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to improvement details
          </Link>
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Improvement Register Entry</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ImprovementRegisterForm users={users} improvement={improvement} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Documents</h2>
          <DocumentUpload improvementId={improvementId} />
        </div>
      </div>
    </div>
  )
}
