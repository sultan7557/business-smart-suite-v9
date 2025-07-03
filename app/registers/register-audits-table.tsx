import prisma from "@/lib/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function RegisterAuditsTable({ registerId }: { registerId: string }) {
  // This must be an async server component
  // But if you need to use client-side fetching, convert to useEffect/fetch
  // For now, assume server component
  return (
    <RegisterAuditsTableInner registerId={registerId} />
  )
}

async function RegisterAuditsTableInner({ registerId }: { registerId: string }) {
  const auditDocs = await prisma.auditDocument.findMany({
    where: { docId: registerId, docType: "register" },
    include: { audit: true },
    orderBy: { createdAt: "desc" },
  })
  const audits = auditDocs.map(ad => ad.audit).filter(Boolean)

  if (!audits.length) {
    return <div className="p-4 text-center text-gray-500">No audits found for this register.</div>
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4">Audit No</th>
            <th className="py-2 px-4">Title</th>
            <th className="py-2 px-4">Planned Start</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {audits.map(audit => (
            <tr key={audit.id} className="border-b">
              <td className="py-2 px-4">{audit.number?.toString().padStart(3, '0')}</td>
              <td className="py-2 px-4">{audit.title}</td>
              <td className="py-2 px-4">{format(new Date(audit.plannedStartDate), "dd/MMM/yyyy")}</td>
              <td className="py-2 px-4">
                <Badge>{audit.status}</Badge>
              </td>
              <td className="py-2 px-4">
                <Link href={`/audit-schedule/${audit.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 