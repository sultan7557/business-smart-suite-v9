import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(
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

    // Prevent deletion of the current user
    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Prevent deletion of admin users (optional safety measure)
    if (user.role === 'admin') {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 400 });
    }

    // Delete all associated data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user permissions
      await tx.permission.deleteMany({
        where: { userId },
      });

      // Delete permission audits
      await tx.permissionAudit.deleteMany({
        where: { userId },
      });

      // Delete user groups
      await tx.userGroup.deleteMany({
        where: { userId },
      });

      // Delete user invites
      await tx.invite.deleteMany({
        where: { userId },
      });

      // Delete user invites where they were the inviter
      await tx.invite.deleteMany({
        where: { invitedBy: userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    // Add audit trail for user deletion
    await prisma.permissionAudit.create({
      data: {
        action: "USER_DELETED",
        userId: "SYSTEM", // Since user is deleted, use SYSTEM
        systemId: "business-smart-suite",
        roleId: "system",
        performedBy: currentUser.id,
        details: { 
          deletedUserId: userId,
          deletedUserEmail: user.email,
          deletedUserName: user.name
        },
      },
    });

    return NextResponse.json({ 
      message: "User permanently deleted successfully",
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ 
      error: "An error occurred while deleting the user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 