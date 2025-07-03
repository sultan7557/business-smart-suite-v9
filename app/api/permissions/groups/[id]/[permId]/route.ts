import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string, permId: string } }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: groupId, permId: permissionId } = params;

    const groupPermission = await prisma.groupPermission.findUnique({
      where: { id: permissionId },
    });

    if (!groupPermission || groupPermission.groupId !== groupId) {
      return NextResponse.json({ error: "Permission not found for this group" }, { status: 404 });
    }

    await prisma.groupPermission.delete({
      where: { id: permissionId },
    });

    // TODO: Add audit trail for group permission revoked
    await prisma.permissionAudit.create({
      data: {
        action: "REVOKED",
        userId: "SYSTEM", // Indicate this is a group permission revocation
        systemId: groupPermission.systemId,
        roleId: groupPermission.roleId,
        performedBy: currentUser.id,
        details: { revokedGroupPermission: groupPermission.id, groupId },
      },
    });

    return NextResponse.json({ message: "Group permission revoked successfully" });
  } catch (error) {
    console.error("Revoke group permission error:", error);
    return NextResponse.json({ error: "An error occurred while revoking group permission" }, { status: 500 });
  }
} 