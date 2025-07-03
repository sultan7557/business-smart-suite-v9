import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const grantGroupPermissionSchema = z.object({
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
  expiry: z.string().nullable().optional().transform((val) => {
    if (!val) return null;
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      return date.toISOString();
    } catch (error) {
      throw new Error("Invalid datetime format");
    }
  }),
});

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const groupId = context.params.id;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const permissions = await prisma.groupPermission.findMany({
      where: { groupId },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Get group permissions error:", error);
    return NextResponse.json({ 
      error: "An error occurred while fetching group permissions",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const groupId = context.params.id;
    const body = await request.json();
    
    try {
      const validatedData = grantGroupPermissionSchema.parse(body);
      const { systemId, roleId, expiry } = validatedData;

      // Check if group exists
      const group = await prisma.group.findUnique({ where: { id: groupId } });
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Check if permission already exists for this group
      const existingGroupPermission = await prisma.groupPermission.findUnique({
        where: {
          groupId_systemId_roleId: {
            groupId,
            systemId,
            roleId,
          },
        },
      });

      if (existingGroupPermission) {
        return NextResponse.json({ error: "Group already has this permission" }, { status: 409 });
      }

      const newGroupPermission = await prisma.groupPermission.create({
        data: {
          groupId,
          systemId,
          roleId,
          expiry,
          createdBy: currentUser.id,
        },
        include: {
          role: { select: { id: true, name: true, description: true } },
        },
      });

      // Add audit trail for group permission granted
      await prisma.permissionAudit.create({
        data: {
          action: "GROUP_PERMISSION_GRANTED",
          userId: "SYSTEM",
          systemId,
          roleId,
          performedBy: currentUser.id,
          details: { 
            groupId,
            groupPermissionId: newGroupPermission.id,
          },
        },
      });

      return NextResponse.json({ message: "Group permission granted successfully", permission: newGroupPermission }, { status: 201 });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: "Validation error", 
          details: validationError.errors 
        }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Grant group permission error:", error);
    return NextResponse.json({ 
      error: "An error occurred while granting group permission",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 