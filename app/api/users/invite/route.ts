import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { sendInvitationEmail } from "@/lib/email"
import { z } from "zod"
import { sign } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string;

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  systemId: z.string().min(1, "System ID is required"),
  roleId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const invitedBy = await getUser()

    if (!invitedBy) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inviteSchema.parse(body)

    const { name, email, systemId, roleId } = validatedData

    // Set invitation expiry (e.g., 7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await prisma.invite.create({
      data: {
        name,
        email,
        systemId,
        roleId,
        invitedBy: invitedBy.id, // Assuming getUser returns an object with an 'id'
        token: "", // Token will be generated after invite is created to include invite.id
        expiresAt,
      },
    })

    // Generate a secure JWT token for the invitation including the invite ID
    const invitationToken = sign({ inviteId: invite.id }, JWT_SECRET, { expiresIn: "7d" });

    // Update the invite record with the generated JWT token
    await prisma.invite.update({
      where: { id: invite.id },
      data: { token: invitationToken },
    });

    // Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitationToken}`;
    await sendInvitationEmail(email, name, invitedBy.name, inviteLink);

    return NextResponse.json({ message: "Invitation sent successfully", inviteId: invite.id }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("Invite user error:", error)
    return NextResponse.json({ error: "An error occurred while sending the invitation" }, { status: 500 })
  }
} 