import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Import bcryptjs
import { z } from 'zod';
import { sendWelcomeAndSetPasswordEmail } from '@/lib/email'; // Import the new email function

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 400 });
  }

  try {
    const decodedToken = verify(token, JWT_SECRET) as { inviteId: string };

    const invite = await prisma.invite.findUnique({
      where: {
        id: decodedToken.inviteId,
        status: 'PENDING',
      },
      include: {
        role: true, // Include the role to get its name
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      // If user exists and is already active, consider invite accepted
      if (existingUser.status === 'ACTIVE') {
        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: 'ACCEPTED', acceptedBy: existingUser.id },
        });
        return NextResponse.json({ message: 'Invitation already accepted by this user.', user: { id: existingUser.id, username: existingUser.username, email: existingUser.email, role: existingUser.role } });
      } else {
        // If user exists but is not active, we might reactivate or return error depending on desired flow.
        // For now, return an error to prevent accidental reactivation without explicit logic.
        return NextResponse.json({ error: 'User with this email already exists but is not active. Please contact support.' }, { status: 409 });
      }
    }

    // Generate a temporary password and hash it
    const tempPassword = Math.random().toString(36).substring(2, 10); // Simple temp password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: invite.email, // Using email as username for now
        email: invite.email,
        name: invite.name,
        password: hashedPassword,
        status: 'ACTIVE',
        role: invite.role?.name || 'user', // Use the role name from the invite or default to 'user'
      },
    });

    // Update the invite record as accepted and link to the new user
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED', acceptedBy: newUser.id },
    });

    // Send welcome email with set password link
    await sendWelcomeAndSetPasswordEmail(newUser.email as string, newUser.name, newUser.id);

    return NextResponse.json({
      message: 'Invitation accepted and user created successfully. Please check your email to set your password.',
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 