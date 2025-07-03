import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { version, notes, issueDate } = body

    if (!version || !issueDate) {
      return NextResponse.json(
        { error: "Version and issue date are required" },
        { status: 400 }
      )
    }

    const sectionVersion = await prisma.customSectionVersion.create({
      data: {
        version,
        notes,
        issueDate: new Date(issueDate),
        customSectionId: params.id,
        createdById: user.id,
      },
    })

    // Update the main section's version
    await prisma.customSection.update({
      where: { id: params.id },
      data: {
        version,
        issueDate: new Date(issueDate),
        updatedById: user.id,
      },
    })

    return NextResponse.json(sectionVersion)
  } catch (error) {
    console.error("Error creating version:", error)
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const versions = await prisma.customSectionVersion.findMany({
      where: { customSectionId: params.id },
      orderBy: { issueDate: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching versions:", error)
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    )
  }
} 