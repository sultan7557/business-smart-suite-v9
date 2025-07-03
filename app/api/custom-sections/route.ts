import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sections = await prisma.customSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error fetching custom sections:", error)
    return NextResponse.json(
      { error: "Failed to fetch custom sections" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, icon } = body

    if (!title || !icon) {
      return NextResponse.json(
        { error: "Title and icon are required" },
        { status: 400 }
      )
    }

    // Get the highest order value
    const lastSection = await prisma.customSection.findFirst({
      orderBy: { order: "desc" },
    })

    const newOrder = lastSection ? lastSection.order + 1 : 0

    const section = await prisma.customSection.create({
      data: {
        title,
        description,
        icon,
        order: newOrder,
        createdById: user.id,
        version: "1.0", // Default version
        issueDate: new Date(), // Current date as issue date
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error creating custom section:", error)
    return NextResponse.json(
      { error: "Failed to create custom section" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, description, icon, order, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      )
    }

    const section = await prisma.customSection.update({
      where: { id },
      data: {
        title,
        description,
        icon,
        order,
        isActive,
        updatedById: user.id,
      },
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error("Error updating custom section:", error)
    return NextResponse.json(
      { error: "Failed to update custom section" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 }
      )
    }

    // Soft delete by setting isActive to false
    await prisma.customSection.update({
      where: { id },
      data: { isActive: false },
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