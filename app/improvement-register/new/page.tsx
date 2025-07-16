import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import ImprovementRegisterForm from "../improvement-register-form"

export default function NewImprovementRegisterPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new improvement entry..." />}>
      <NewImprovementRegisterPage />
    </Suspense>
  )
}

async function NewImprovementRegisterPage() {
  const user = await getUser()
  if (!user) {
    return <div>Unauthorized</div>
  }

  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">New Improvement Register Entry</h1>
      <ImprovementRegisterForm users={users} />
    </div>
  )
} 