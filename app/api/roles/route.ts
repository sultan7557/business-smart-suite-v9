import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name cannot exceed 50 characters"),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("List roles error:", error)
    return NextResponse.json({ error: "An error occurred while fetching roles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = roleSchema.parse(body)

    const { name, description } = validatedData

    const existingRole = await prisma.role.findUnique({
      where: { name },
    })

    if (existingRole) {
      return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 })
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
      },
    })

    // TODO: Add audit trail for role creation

    return NextResponse.json({ message: "Role created successfully", role: newRole }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Create role error:", error)
    return NextResponse.json({ error: "An error occurred while creating the role" }, { status: 500 })
  }
} 