import { hasPermission } from "@/lib/auth"
import prisma from "@/lib/prisma"
import ImprovementRegisterClient from "./improvement-register-client"

export default async function ImprovementRegisterPage() {
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")

  // Fetch all improvement register items
  const allImprovements = await prisma.improvementRegister.findMany({
    include: {
      internalOwner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      internalRaisedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      completedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      documents: {
        select: {
          id: true,
          title: true,
          fileUrl: true,
        },
      },
    },
    orderBy: {
      number: "desc",
    },
  })

  // Split improvements into active and completed
  const improvements = allImprovements.filter(imp => !imp.dateCompleted)
  const completedImprovements = allImprovements.filter(imp => imp.dateCompleted)

  // Fetch users for dropdown selections
  const users = await prisma.user.findMany({
    where: {
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="p-4">
      <ImprovementRegisterClient
        improvements={improvements}
        completedImprovements={completedImprovements}
        users={users}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
