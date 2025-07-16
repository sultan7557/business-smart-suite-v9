import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Plus, RotateCcw, Archive } from 'lucide-react'
import Link from "next/link"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"
import AuditList from "./audit-list"

export default function AuditSchedulePageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading audit schedule..." />}>
      <AuditSchedulePage />
    </Suspense>
  )
}

async function AuditSchedulePage() {
  const canEdit = await hasPermission("write")
  
  // Initialize empty arrays for audits
  let notStartedAudits = [];
  let inProgressAudits = [];
  let completedAudits = [];
  let archivedAudits = [];
  
  try {
    // Fetch audits by status
    notStartedAudits = await prisma.audit.findMany({
      where: { 
        status: "not_started",
        archived: false
      },
      include: {
        auditor: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
      },
      orderBy: { plannedStartDate: "asc" },
    });
    
    inProgressAudits = await prisma.audit.findMany({
      where: { 
        status: "in_progress",
        archived: false
      },
      include: {
        auditor: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
      },
      orderBy: { plannedStartDate: "asc" },
    });
    
    completedAudits = await prisma.audit.findMany({
      where: { 
        status: "completed",
        archived: false
      },
      include: {
        auditor: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
      },
      orderBy: { dateCompleted: "desc" },
    });

    // Fetch archived audits
    archivedAudits = await prisma.audit.findMany({
      where: { 
        archived: true
      },
      include: {
        auditor: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching audits:", error);
    // If there's an error, we continue with empty arrays
    // This prevents the page from crashing
  }

  return (
    <div className="p-0">
      <div className="flex items-center p-4 border-b">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Audit Schedule</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/audit-schedule?showArchived=true">
              <Archive className="h-4 w-4 mr-2" />
              {archivedAudits.length > 0 ? `Archived (${archivedAudits.length})` : "Archived"}
            </Link>
          </Button>
          {canEdit && (
            <Button asChild>
              <Link href="/audit-schedule/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Audit
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="not_started" className="p-4">
        <TabsList>
          <TabsTrigger value="not_started">Audits not yet started ({notStartedAudits.length})</TabsTrigger>
          <TabsTrigger value="in_progress">Audits currently in progress ({inProgressAudits.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Audits ({completedAudits.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived Audits ({archivedAudits.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="not_started">
          <AuditList audits={notStartedAudits} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="in_progress">
          <AuditList audits={inProgressAudits} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="completed">
          <AuditList audits={completedAudits} canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="archived">
          <AuditList audits={archivedAudits} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  )
}