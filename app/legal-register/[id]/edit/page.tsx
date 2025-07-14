import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import LegalRegisterForm from "../../legal-register-form"

interface EditLegalRegisterPageProps {
  params: {
    id: string
  }
}

export default async function EditLegalRegisterPage({ params }: EditLegalRegisterPageProps) {
  // Extract id from params correctly (no await needed)
  const { id } = await params;
  
  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/legal-register")
  }

  const legalRegister = await prisma.legalRegister.findUnique({
    where: { id }, // Use the extracted id variable
    include: {
      createdBy: true,
      updatedBy: true,
      versions: true,
      reviews: true,
      documents: true,
    },
  })

  if (!legalRegister) {
    notFound()
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

      <LegalRegisterForm legalRegister={legalRegister} />
    </div>
  )
}