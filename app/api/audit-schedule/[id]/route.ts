import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const canEdit = await hasPermission("write", "audit-schedule")
    const canRead = await hasPermission("read", "audit-schedule")
    
    if (!canRead) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params
    
    if (!id) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 })
    }

    // Fetch the audit with all related data
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: {
        auditor: {
          select: {
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
        updatedBy: {
          select: {
            name: true,
          },
        },
        auditDocuments: true,
        reviews: {
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            reviewDate: "desc",
          },
        },
      },
    })
    
    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Fetch all documents for this audit
    const documents = await prisma.document.findMany({
      where: {
        relatedEntityId: id,
        relatedEntityType: "audit",
      },
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
    })

    return NextResponse.json({
      audit,
      documents,
      canEdit,
    })
  } catch (error) {
    console.error("Error fetching audit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
