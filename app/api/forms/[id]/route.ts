import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth, getUser } from "@/lib/auth"

export const GET = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const formId = resolvedParams.id;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        category: true,
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
        documents: {
          orderBy: {
            uploadedAt: "desc",
          },
          include: {
            uploadedBy: {
              select: {
                name: true,
              },
            },
          },
        },
        versions: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            createdBy: {
              select: {
                name: true,
              },
            },
            document: true,
          },
        },
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error fetching form:", error)
    return NextResponse.json({ error: "Failed to fetch form" }, { status: 500 })
  }
})

export const PUT = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const formId = resolvedParams.id;
    
    const data = await request.json()
    const { title, version, issueDate, location, content, categoryId, highlighted, approved } = data
    const user = await getUser();

    if (!title || !version || !issueDate || !location || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        title,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        categoryId,
        highlighted: highlighted || false,
        approved: approved || false,
        updatedById: user.id,
      },
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}, "write")

export const DELETE = withAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const resolvedParams = await params;
    const formId = resolvedParams.id;
    
    // Soft delete by setting archived to true
    const form = await prisma.form.update({
      where: { id: formId },
      data: {
        archived: true,
      },
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error("Error deleting form:", error)
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 })
  }
}, "delete")