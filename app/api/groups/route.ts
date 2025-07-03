import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ groups })
  } catch (error: any) {
    console.error("Error fetching groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, userIds } = createGroupSchema.parse(body)

    // Check if group with same name exists
    const existingGroup = await prisma.group.findUnique({
      where: { name },
    })

    if (existingGroup) {
      return NextResponse.json({ error: "A group with this name already exists" }, { status: 400 })
    }

    // Create group and add users in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the group
      const group = await tx.group.create({
        data: {
          name,
          description,
        },
      })

      // Add users to the group if provided
      if (userIds && userIds.length > 0) {
        await tx.userGroup.createMany({
          data: userIds.map(userId => ({
            groupId: group.id,
            userId,
            addedBy: currentUser.id,
          })),
        })
      }

      // Create audit trail
      await tx.permissionAudit.create({
        data: {
          action: "CREATE_GROUP",
          details: `Created group ${name}`,
          userId: currentUser.id,
          systemId: "groups",
          roleId: "group_admin",
          performedBy: currentUser.id,
        },
      })

      return group
    })

    return NextResponse.json({ group: result }, { status: 201 })
  } catch (error: any) {
    console.error("Create group error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
} 