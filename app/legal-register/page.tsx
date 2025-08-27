import { Suspense } from "react"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import LegalRegisterClient from "./legal-register-client"
import { unstable_noStore as noStore } from 'next/cache'

export default async function LegalRegisterPage() {
  // Disable caching for this page to ensure fresh data
  noStore()

  const canEdit = await hasPermission("write", "legal-register")
  const canDelete = await hasPermission("delete", "legal-register")
  // Treat write permission as implicitly allowing approval, to restore prior behavior
  const canApprove = (await hasPermission("approve", "legal-register")) || canEdit

  if (!canEdit && !canDelete && !canApprove) {
    notFound()
  }

  // Fetch active legal register items with fresh data
  const legalRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: false,
      approved: true,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        take: 1,
        orderBy: {
          reviewDate: "desc",
        },
      },
      documents: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch unapproved legal register items with fresh data
  const unapprovedRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: false,
      approved: false,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      documents: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Fetch archived legal register items with fresh data
  const archivedRegisters = await prisma.legalRegister.findMany({
    where: {
      archived: true,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        take: 1,
        orderBy: {
          reviewDate: "desc",
        },
      },
      documents: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Verify document data integrity and ensure fresh data
  const verifyDocuments = (registers: any[]) => {
    return registers.map(register => ({
      ...register,
      documents: register.documents || [],
      // Ensure documents are properly formatted
      _count: {
        documents: register.documents?.length || 0
      }
    }))
  }

  const verifiedLegalRegisters = verifyDocuments(legalRegisters)
  const verifiedUnapprovedRegisters = verifyDocuments(unapprovedRegisters)
  const verifiedArchivedRegisters = verifyDocuments(archivedRegisters)

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
      <LegalRegisterClient
        legalRegisters={verifiedLegalRegisters}
        unapprovedRegisters={verifiedUnapprovedRegisters}
        archivedRegisters={verifiedArchivedRegisters}
        users={users}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
      />
    </div>
  )
}