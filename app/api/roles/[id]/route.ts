import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const roleUpdateSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name cannot exceed 50 characters").optional(),
  description: z.string().optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = roleUpdateSchema.parse(body)

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
    }

    if (validatedData.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name: validatedData.name },
      })

      if (existingRole && existingRole.id !== id) {
        return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 })
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: validatedData,
    })

    // TODO: Add audit trail for role update

    return NextResponse.json({ message: "Role updated successfully", role: updatedRole })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Update role error:", error)
    return NextResponse.json({ error: "An error occurred while updating the role" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = params

    // Check if the role is assigned to any permissions or group permissions
    const assignedPermissions = await prisma.permission.count({
      where: { roleId: id },
    })

    const assignedGroupPermissions = await prisma.groupPermission.count({
      where: { roleId: id },
    })

    if (assignedPermissions > 0 || assignedGroupPermissions > 0) {
      return NextResponse.json({ error: "Cannot delete role: it is currently assigned to users or groups." }, { status: 409 })
    }

    await prisma.role.delete({
      where: { id },
    })

    // TODO: Add audit trail for role deletion

    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error) {
    console.error("Delete role error:", error)
    return NextResponse.json({ error: "An error occurred while deleting the role" }, { status: 500 })
  }
} 