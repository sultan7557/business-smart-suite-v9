import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the version
    await prisma.customSectionVersion.delete({
      where: {
        id: params.versionId,
        customSectionId: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting version:", error)
    return NextResponse.json(
      { error: "Failed to delete version" },
      { status: 500 }
    )
  }
} 