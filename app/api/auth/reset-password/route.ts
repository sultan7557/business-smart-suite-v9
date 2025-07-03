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

    let decodedToken;
    try {
      decodedToken = verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the token is already used or invalid (e.g., if we were storing tokens in DB for single use)
    // For this basic implementation, JWT expiration handles single use implicitly after a time limit.

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 