import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const addUserSchema = z.object({
  userId: z.string(),
});

type GroupUser = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  status: string;
  addedBy: string;
  addedAt: Date;
};

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = context.params;

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get all users in the group with their details
    const groupUsers = await prisma.userGroup.findMany({
      where: { groupId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get the names of users who added each member
    const addedByUserIds = groupUsers
      .map(gu => gu.addedBy)
      .filter((id): id is string => id !== null);

    const addedByUsers = await prisma.user.findMany({
      where: {
        id: {
          in: addedByUserIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const addedByMap = new Map(
      addedByUsers.map(user => [user.id, user.name])
    );

    const users: GroupUser[] = groupUsers.map(gu => ({
      id: gu.user.id,
      name: gu.user.name,
      email: gu.user.email,
      username: gu.user.username,
      status: gu.user.status,
      addedBy: gu.addedBy ? addedByMap.get(gu.addedBy) || 'Unknown' : 'System',
      addedAt: gu.createdAt,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching group users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group users' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = context.params;
    const body = await request.json();
    const { userId } = addUserSchema.parse(body);

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already in the group
    const existingMembership = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already in this group' },
        { status: 400 }
      );
    }

    // Add user to group
    const userGroup = await prisma.userGroup.create({
      data: {
        userId,
        groupId,
        addedBy: currentUser.id,
      },
    });

    // Create audit trail
    await prisma.permissionAudit.create({
      data: {
        action: 'ADD_USER_TO_GROUP',
        details: `Added user ${user.name} to group ${group.name}`,
        userId: currentUser.id,
        systemId: 'groups',
        roleId: 'group_admin',
        performedBy: currentUser.id,
      },
    });

    return NextResponse.json({ userGroup }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding user to group:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to add user to group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user exists in the group
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!userGroup) {
      return NextResponse.json(
        { error: 'User is not in this group' },
        { status: 404 }
      );
    }

    // Remove user from group
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    // Create audit trail
    await prisma.permissionAudit.create({
      data: {
        action: 'REMOVE_USER_FROM_GROUP',
        details: `Removed user ${userGroup.user.name} from group ${group.name}`,
        userId: currentUser.id,
        systemId: 'groups',
        roleId: 'group_admin',
        performedBy: currentUser.id,
      },
    });

    return NextResponse.json({ message: 'User removed from group' });
  } catch (error: any) {
    console.error('Error removing user from group:', error);
    return NextResponse.json(
      { error: 'Failed to remove user from group' },
      { status: 500 }
    );
  }
} 