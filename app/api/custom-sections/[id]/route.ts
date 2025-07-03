import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all related records first
    await prisma.customSectionVersion.deleteMany({
      where: { customSectionId: id },
    })

    await prisma.customSectionReview.deleteMany({
      where: { customSectionId: id },
    })

    // Delete the section
    await prisma.customSection.delete({
      where: { id: id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting custom section:", error)
    return NextResponse.json(
      { error: "Failed to delete custom section" },
      { status: 500 }
    )
  }
}