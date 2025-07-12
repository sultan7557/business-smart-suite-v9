import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, notes } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const document = await prisma.maintenanceDocument.update({
      where: { id: params.documentId },
      data: {
        title,
      },
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error("Error updating maintenance document:", error)
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    )
  }
} 