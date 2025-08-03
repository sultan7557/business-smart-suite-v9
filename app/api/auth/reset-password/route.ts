import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET as string;

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);
    const { token, newPassword } = validatedData;

    // Validate password strength
    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }
    if (!/[a-z]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one lowercase letter' }, { status: 400 });
    }
    if (!/[0-9]/.test(newPassword)) {
      return NextResponse.json({ error: 'Password must contain at least one number' }, { status: 400 });
    }

    let decodedToken;
    try {
      decodedToken = verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Password setup link has expired. Please request a new one.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Invalid password setup link' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'User account is not active' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      },
    });

    return NextResponse.json({ 
      message: 'Password set successfully! You can now log in with your new password.',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while setting your password' }, { status: 500 });
  }
} 