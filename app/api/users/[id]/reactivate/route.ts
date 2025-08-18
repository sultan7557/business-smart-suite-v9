import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: userId } = await context.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already active
    if (user.status === 'ACTIVE') {
      return NextResponse.json({ error: "User is already active" }, { status: 400 });
    }

    // Reactivate the user
    const reactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        status: "ACTIVE",
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Add audit trail for user reactivation
    await prisma.permissionAudit.create({
      data: {
        action: "USER_REACTIVATED",
        userId,
        systemId: "business-smart-suite",
        roleId: "system",
        performedBy: currentUser.id,
        details: { 
          previousStatus: user.status,
          newStatus: "ACTIVE"
        },
      },
    });

    return NextResponse.json({ 
      message: "User reactivated successfully", 
      user: reactivatedUser 
    });
  } catch (error) {
    console.error("Reactivate user error:", error);
    return NextResponse.json({ 
      error: "An error occurred while reactivating the user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 