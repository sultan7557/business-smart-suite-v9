import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const grantPermissionSchema = z.object({
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

    const userId = context.params.id;

    const permissions = await prisma.permission.findMany({
      where: { userId },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error("Get user permissions error:", error);
    return NextResponse.json({ 
      error: "An error occurred while fetching user permissions",
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

    const userId = context.params.id;
    const body = await request.json();
    
    try {
      const validatedData = grantPermissionSchema.parse(body);
      const { systemId, roleId, expiry } = validatedData;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if permission already exists
      const existingPermission = await prisma.permission.findUnique({
        where: {
          userId_systemId_roleId: {
            userId,
            systemId,
            roleId,
          },
        },
      });

      if (existingPermission) {
        return NextResponse.json({ error: "User already has this permission" }, { status: 409 });
      }

      const newPermission = await prisma.permission.create({
        data: {
          userId,
          systemId,
          roleId,
          expiry,
          createdBy: currentUser.id,
        },
        include: {
          role: { select: { id: true, name: true, description: true } },
        },
      });

      // Add audit trail for permission granted
      await prisma.permissionAudit.create({
        data: {
          action: "GRANTED",
          userId,
          systemId,
          roleId,
          performedBy: currentUser.id,
          details: { newPermission: newPermission.id },
        },
      });

      return NextResponse.json({ message: "Permission granted successfully", permission: newPermission }, { status: 201 });
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
    console.error("Grant user permission error:", error);
    return NextResponse.json({ 
      error: "An error occurred while granting permission",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 