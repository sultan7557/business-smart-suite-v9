import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const groupUpdateSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50, "Group name cannot exceed 50 characters").optional(),
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
    const validatedData = groupUpdateSchema.parse(body)

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: "No fields provided for update" }, { status: 400 })
    }

    if (validatedData.name) {
      const existingGroup = await prisma.group.findUnique({
        where: { name: validatedData.name },
      })

      if (existingGroup && existingGroup.id !== id) {
        return NextResponse.json({ error: "Group with this name already exists" }, { status: 409 })
      }
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: validatedData,
    })

    // TODO: Add audit trail for group update

    return NextResponse.json({ message: "Group updated successfully", group: updatedGroup })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Update group error:", error)
    return NextResponse.json({ error: "An error occurred while updating the group" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = context.params

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Delete group and all its relationships in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all user-group relationships
      await tx.userGroup.deleteMany({
        where: { groupId },
      })

      // Delete all group permissions
      await tx.groupPermission.deleteMany({
        where: { groupId },
      })

      // Delete the group
      await tx.group.delete({
        where: { id: groupId },
      })

      // Create audit trail
      await tx.permissionAudit.create({
        data: {
          action: 'DELETE_GROUP',
          details: `Deleted group ${group.name}`,
          userId: currentUser.id,
          systemId: 'groups',
          roleId: 'group_admin',
          performedBy: currentUser.id,
        },
      })
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
} 