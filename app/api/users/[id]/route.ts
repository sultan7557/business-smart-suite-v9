import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  username: z.string().min(1, "Username is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Potentially include permissions and groups later if needed for display
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user details error:", error);
    return NextResponse.json({ error: "An error occurred while fetching user details" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json({ error: "No fields provided for update" }, { status: 400 });
    }

    let dataToUpdate: any = { ...validatedData };

    if (validatedData.password) {
      dataToUpdate.password = await bcrypt.hash(validatedData.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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

    // TODO: Add audit trail for user profile changes

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Update user error:", error);
    return NextResponse.json({ error: "An error occurred while updating the user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Deactivate the user instead of hard deleting
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    // TODO: Add audit trail for user deactivation

    return NextResponse.json({ message: "User deactivated successfully", user: deactivatedUser });
  } catch (error) {
    console.error("Deactivate user error:", error);
    return NextResponse.json({ error: "An error occurred while deactivating the user" }, { status: 500 });
  }
} 