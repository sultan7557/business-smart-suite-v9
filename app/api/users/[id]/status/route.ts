import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const statusUpdateSchema = z.object({
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "INACTIVE"], { required_error: "Status is required" }),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validatedData = statusUpdateSchema.parse(body);
    const { status } = validatedData;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // TODO: Add audit trail for user status changes

    return NextResponse.json({ message: `User status updated to ${status} successfully`, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update user status error:", error);
    return NextResponse.json({ error: "An error occurred while updating user status" }, { status: 500 });
  }
} 