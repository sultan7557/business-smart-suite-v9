import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = acceptInviteSchema.parse(body)
    const { token, username, password } = validatedData

    const invite = await prisma.invite.findUnique({
      where: { token },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invitation already accepted or expired" }, { status: 400 })
    }

    if (invite.expiresAt < new Date()) {
      await prisma.invite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: invite.name,
        email: invite.email,
        status: "ACTIVE",
      },
    })

    // Update the invite status and link to the new user
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        userId: user.id,
      },
    })

    // Assign role if specified in the invite
    if (invite.roleId) {
      await prisma.permission.create({
        data: {
          userId: user.id,
          systemId: invite.systemId,
          roleId: invite.roleId,
          createdBy: "SYSTEM", // Or a specific system user ID
        },
      })
    }

    return NextResponse.json({ message: "Invitation accepted and account created successfully", userId: user.id }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Accept invitation error:", error)
    return NextResponse.json({ error: "An error occurred while accepting the invitation" }, { status: 500 })
  }
} 