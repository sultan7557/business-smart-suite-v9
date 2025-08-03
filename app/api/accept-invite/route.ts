import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendWelcomeAndSetPasswordEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'No invitation token provided' }, { status: 400 });
  }

  try {
    // Verify the JWT token
    const decodedToken = verify(token, JWT_SECRET) as { inviteId: string };

    // Find the invitation
    const invite = await prisma.invite.findUnique({
      where: {
        id: decodedToken.inviteId,
      },
      include: {
        role: true,
        user: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    // Check if invitation has expired
    if (invite.expiresAt < new Date()) {
      // Update status to expired if not already
      if (invite.status !== 'EXPIRED') {
        await prisma.invite.update({
          where: { id: invite.id },
          data: { status: 'EXPIRED' },
        });
      }
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if invitation is already accepted
    if (invite.status === 'ACCEPTED') {
      return NextResponse.json({ 
        message: 'Invitation already accepted',
        user: invite.user ? {
          id: invite.user.id,
          email: invite.user.email,
          name: invite.user.name
        } : null
      }, { status: 200 });
    }

    // Check if invitation is cancelled
    if (invite.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Invitation has been cancelled' }, { status: 400 });
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (existingUser) {
      // If user exists and is active, mark invite as accepted
      if (existingUser.status === 'ACTIVE') {
        await prisma.invite.update({
          where: { id: invite.id },
          data: { 
            status: 'ACCEPTED', 
            userId: existingUser.id,
            acceptedBy: existingUser.id 
          },
        });
        
        return NextResponse.json({ 
          message: 'Account already exists and is active',
          user: { 
            id: existingUser.id, 
            email: existingUser.email, 
            name: existingUser.name 
          }
        }, { status: 200 });
      } else {
        // If user exists but is deactivated, reactivate them
        const reactivatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            status: 'ACTIVE',
            name: invite.name, // Update name in case it changed
            updatedAt: new Date()
          },
        });

        // Update the invite record as accepted
        await prisma.invite.update({
          where: { id: invite.id },
          data: { 
            status: 'ACCEPTED', 
            userId: reactivatedUser.id,
            acceptedBy: reactivatedUser.id 
          },
        });

        // Send welcome email with password setup link
        try {
          if (reactivatedUser.email) {
            await sendWelcomeAndSetPasswordEmail(reactivatedUser.email, reactivatedUser.name, reactivatedUser.id);
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the invitation acceptance if email fails
        }

        return NextResponse.json({
          message: 'Account reactivated successfully! Please check your email to set your password.',
          user: { 
            id: reactivatedUser.id, 
            email: reactivatedUser.email, 
            name: reactivatedUser.name,
            status: reactivatedUser.status
          },
        }, { status: 200 });
      }
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Generate a unique username from email
    const baseUsername = invite.email.split('@')[0]; // Use email prefix as base
    let username = baseUsername;
    let counter = 1;
    
    // Ensure username is unique
    while (true) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });
      
      if (!existingUser) {
        break; // Username is unique
      }
      
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email: invite.email,
        name: invite.name,
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    // Update the invite record as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { 
        status: 'ACCEPTED', 
        userId: newUser.id,
        acceptedBy: newUser.id 
      },
    });

    // Assign role if specified in the invite, otherwise assign default "View Only" role
    if (invite.roleId) {
      await prisma.permission.create({
        data: {
          userId: newUser.id,
          systemId: invite.systemId,
          roleId: invite.roleId,
          createdBy: 'SYSTEM',
        },
      });
    } else {
      // Find and assign the default "View Only" role
      const viewOnlyRole = await prisma.role.findFirst({
        where: { name: 'View Only' },
      });

      if (viewOnlyRole) {
        await prisma.permission.create({
          data: {
            userId: newUser.id,
            systemId: invite.systemId,
            roleId: viewOnlyRole.id,
            createdBy: 'SYSTEM',
          },
        });
      }
    }

    // Send welcome email with password setup link
    try {
      if (newUser.email) {
        await sendWelcomeAndSetPasswordEmail(newUser.email, newUser.name, newUser.id);
      }
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the invitation acceptance if email fails
    }

    return NextResponse.json({
      message: 'Account created successfully! Please check your email to set your password.',
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Accept invite error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
      }
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Invitation token has expired' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred while processing your invitation' }, { status: 500 });
  }
} 