// Create a new file: app/statement-of-applicability/page.tsx

import { hasPermission } from "@/lib/auth"
import prisma from "@/lib/prisma"
import StatementOfApplicabilityClient from "./statement-of-applicability-client"

export default async function StatementOfApplicabilityPage() {
  const canEdit = await hasPermission("write", "statement-of-applicability")
  const canDelete = await hasPermission("delete", "statement-of-applicability")

  // Fetch controls
  const controls = await prisma.statementOfApplicabilityControl.findMany({
    orderBy: [
      { section: 'asc' },
      { order: 'asc' }
    ]
  })

  // Fetch version history
  const versions = await prisma.statementOfApplicabilityVersion.findMany({
    orderBy: {
      number: 'asc'
    }
  })

  // Fetch reviews
  const reviews = await prisma.statementOfApplicabilityReview.findMany({
    orderBy: {
      reviewDate: 'desc'
    }
  })

  return (
    <div className="p-4">
      <StatementOfApplicabilityClient
        controls={controls}
        versions={versions}
        reviews={reviews}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}