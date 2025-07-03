import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import { getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")

    let whereClause = {}
    if (status) {
      whereClause = { status }
    }

    const audits = await prisma.audit.findMany({
      where: whereClause,
      include: {
        auditor: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
      },
      orderBy: {
        plannedStartDate: "asc",
      },
    })

    return NextResponse.json(audits)
  } catch (error) {
    console.error("Error fetching audits:", error)
    return NextResponse.json({ error: "Failed to fetch audits" }, { status: 500 })
  }
})

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Create the audit
    const audit = await prisma.audit.create({
      data: {
        title: data.title,
        plannedStartDate: new Date(data.plannedStartDate),
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        dateCompleted: data.dateCompleted ? new Date(data.dateCompleted) : null,
        auditorId: data.auditorId,
        externalAuditor: data.externalAuditor,
        status: data.status || "not_started",
        createNextAudit: data.createNextAudit || false,
        nextAuditDate: data.nextAuditDate ? new Date(data.nextAuditDate) : null,
        createdById: user.id as string,
      },
    })

    // Create audit documents if provided
    if (data.documents && data.documents.length > 0) {
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

    return NextResponse.json(audit)
  } catch (error) {
    console.error("Error creating audit:", error)
    return NextResponse.json({ error: "Failed to create audit" }, { status: 500 })
  }
}, "write")