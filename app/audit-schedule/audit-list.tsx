"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Archive, RotateCcw, FileText } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { deleteAudit, toggleAuditArchive } from "@/app/actions/audit-actions"
import { toast } from "sonner"
import { Loader } from '@/components/ui/loader'

interface AuditListProps {
  audits: any[]
  canEdit: boolean
}

export default function AuditList({ audits, canEdit }: AuditListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      const result = await deleteAudit(id)
      if (result.success) {
        toast.success("Audit deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete audit")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the audit")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleArchive = async (id: string, currentArchived: boolean) => {
    setIsArchiving(id)
    try {
      const result = await toggleAuditArchive(id)
      if (result.success) {
        toast.success(`Audit ${currentArchived ? "unarchived" : "archived"} successfully`)
      } else {
        toast.error(result.error || `Failed to ${currentArchived ? "unarchive" : "archive"} audit`)
      }
    } catch (error) {
      toast.error(`An error occurred while ${currentArchived ? "unarchiving" : "archiving"} the audit`)
    } finally {
      setIsArchiving(null)
    }
  }

  // Function to determine the color class based on the planned start date
  const getPlannedStartColorClass = (plannedStartDate: Date, isArchived: boolean) => {
    const now = new Date()
    const oneMonthFromNow = new Date()
    oneMonthFromNow.setMonth(now.getMonth() + 1)
    
    // If the audit is archived, don't apply any color
    if (isArchived) {
      return ""
    }
    
    // If the planned start date is in the past, show red
    if (plannedStartDate < now) {
      return "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
    }
    
    // If the planned start date is within the next month, show yellow
    if (plannedStartDate <= oneMonthFromNow) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    }
    
    // If the planned start date is more than a month away, show green
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
  }

  if (!audits) {
    // Skeleton for progressive loading (future SSR/CSR)
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" message="Loading audits..." />
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No audits found
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-4">Audit No</th>
            <th className="text-left py-2 px-4">Title</th>
            <th className="text-left py-2 px-4">Planned Start</th>
            <th className="text-left py-2 px-4">Actual Start</th>
            <th className="text-left py-2 px-4">Auditor</th>
            <th className="text-left py-2 px-4">Follow Up</th>
            <th className="text-left py-2 px-4">Completed</th>
            <th className="text-left py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{audit.number?.toString().padStart(3, '0')}</td>
              <td className="py-2 px-4">{audit.title}</td>
              <td className={`py-2 px-4 ${getPlannedStartColorClass(new Date(audit.plannedStartDate), audit.archived)}`}>
                {formatDate(audit.plannedStartDate)}
              </td>
              <td className="py-2 px-4">{audit.actualStartDate ? formatDate(audit.actualStartDate) : "-"}</td>
              <td className="py-2 px-4">{audit.auditor?.name || audit.externalAuditor || "-"}</td>
              <td className="py-2 px-4">{audit.followUpDate ? formatDate(audit.followUpDate) : "-"}</td>
              <td className="py-2 px-4">{audit.dateCompleted ? formatDate(audit.dateCompleted) : "-"}</td>
              <td className="py-2 px-4">
                <div className="flex items-center gap-2">
                  {canEdit && !audit.archived && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-8 w-8 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        <Link href={`/audit-schedule/${audit.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-red-200 hover:bg-red-300 dark:bg-red-800 dark:hover:bg-red-700"
                        onClick={() => handleDelete(audit.id)}
                        disabled={isDeleting === audit.id}
                      >
                        {isDeleting === audit.id ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-800 dark:hover:bg-yellow-700"
                    onClick={() => handleArchive(audit.id, audit.archived)}
                    disabled={isArchiving === audit.id}
                  >
                    {isArchiving === audit.id ? (
                      <Loader size="sm" ariaLabel={audit.archived ? 'Unarchiving...' : 'Archiving...'} />
                    ) : audit.archived ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    asChild
                    className="h-8 w-8 bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700"
                  >
                    <Link href={`/audit-schedule/${audit.id}/documents`}>
                      <FileText className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}