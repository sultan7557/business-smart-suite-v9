import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import { getUser } from "@/lib/auth"

// Update params type to reflect it's a Promise in Next.js 15
export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // Await params before accessing properties
    const { id } = await params;

    const audit = await prisma.audit.findUnique({
      where: {
        id: id,
      },
      include: {
        auditor: {
          select: {
            name: true,
            email: true,
          },
        },
        auditDocuments: true,
        documents: true,
      },
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    return NextResponse.json(audit)
  } catch (error) {
    console.error("Error fetching audit:", error)
    return NextResponse.json({ error: "Failed to fetch audit" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // Await params before accessing properties
    const { id } = await params;
    
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Update the audit
    const audit = await prisma.audit.update({
      where: {
        id: id,
      },
      data: {
        title: data.title,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        dateCompleted: data.dateCompleted ? new Date(data.dateCompleted) : null,
        auditorId: data.auditorId,
        externalAuditor: data.externalAuditor,
        status: data.status,
        createNextAudit: data.createNextAudit,
        nextAuditDate: data.nextAuditDate ? new Date(data.nextAuditDate) : null,
        updatedById: user.id as string,
      },
    })

    // Update audit documents if provided
    if (data.documents) {
      // First delete existing audit documents
      await prisma.auditDocument.deleteMany({
        where: {
          auditId: id,
        },
      })

      // Then create new ones
      if (data.documents.length > 0) {
        const auditDocuments = data.documents.map((doc: any) => ({
          auditId: audit.id,
          docType: doc.docType,
          docId: doc.docId,
          docName: doc.docName,
        }))

        await prisma.auditDocument.createMany({
          data: auditDocuments,
        })
      }
    }

    return NextResponse.json(audit)
  } catch (error) {
    console.error("Error updating audit:", error)
    return NextResponse.json({ error: "Failed to update audit" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    // Await params before accessing properties
    const { id } = await params;
    
    // First delete related audit documents
    await prisma.auditDocument.deleteMany({
      where: {
        auditId: id,
      },
    })

    // Then delete the audit
    await prisma.audit.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting audit:", error)
    return NextResponse.json({ error: "Failed to delete audit" }, { status: 500 })
  }
}, "delete")