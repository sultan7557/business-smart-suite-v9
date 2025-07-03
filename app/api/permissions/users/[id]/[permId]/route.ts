import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string, permId: string } }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: userId, permId: permissionId } = params;

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission || permission.userId !== userId) {
      return NextResponse.json({ error: "Permission not found for this user" }, { status: 404 });
    }

    await prisma.permission.delete({
      where: { id: permissionId },
    });

    // TODO: Add audit trail for permission revoked
    await prisma.permissionAudit.create({
      data: {
        action: "REVOKED",
        userId,
        systemId: permission.systemId,
        roleId: permission.roleId,
        performedBy: currentUser.id,
        details: { revokedPermission: permission.id },
      },
    });

    return NextResponse.json({ message: "Permission revoked successfully" });
  } catch (error) {
    console.error("Revoke user permission error:", error);
    return NextResponse.json({ error: "An error occurred while revoking permission" }, { status: 500 });
  }
} 