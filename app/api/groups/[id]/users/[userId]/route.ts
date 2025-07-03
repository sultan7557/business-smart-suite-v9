import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id: groupId, userId } = params;

    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (!userGroup) {
      return NextResponse.json({ error: "User not found in this group" }, { status: 404 });
    }

    await prisma.userGroup.delete({
      where: { id: userGroup.id },
    });

    // TODO: Add audit trail for removing user from group

    return NextResponse.json({ message: "User removed from group successfully" });
  } catch (error) {
    console.error("Remove user from group error:", error);
    return NextResponse.json({ error: "An error occurred while removing user from group" }, { status: 500 });
  }
} 