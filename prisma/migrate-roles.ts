import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateRoles() {
  console.log('Starting role migration...');

  try {
    // Step 1: Create predefined roles if they don't exist
    const predefinedRoles = [
      { name: 'View Only', description: 'Can view content but cannot edit', systemId: 'rkms-portal' },
      { name: 'Edit', description: 'Can view and edit content', systemId: 'rkms-portal' },
      { name: 'Delete', description: 'Can view, edit, and delete content', systemId: 'rkms-portal' },
      { name: 'Admin', description: 'Full administrative access', systemId: 'rkms-portal' },
      { name: 'Approve', description: 'Can approve changes and content', systemId: 'rkms-portal' },
      { name: 'Manage Users', description: 'Can manage user accounts and permissions', systemId: 'rkms-portal' },
    ];

    const createdRoles = [];
    for (const roleData of predefinedRoles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const newRole = await prisma.role.create({
          data: roleData,
        });
        createdRoles.push(newRole);
        console.log(`Created role: ${newRole.name} (${newRole.id})`);
      } else {
        createdRoles.push(existingRole);
        console.log(`Role already exists: ${existingRole.name} (${existingRole.id})`);
      }
    }

    // Step 2: Find admin users and assign them the Admin role
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { username: 'admin' },
          { email: { contains: 'admin' } },
        ],
      },
    });

    console.log(`Found ${adminUsers.length} potential admin users`);

    const adminRole = createdRoles.find(role => role.name === 'Admin');
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Step 3: Assign admin permissions to admin users
    for (const user of adminUsers) {
      // Check if user already has admin permission
      const existingAdminPermission = await prisma.permission.findFirst({
        where: {
          userId: user.id,
          roleId: adminRole.id,
          systemId: 'rkms-portal',
        },
      });

      if (!existingAdminPermission) {
        await prisma.permission.create({
          data: {
            userId: user.id,
            roleId: adminRole.id,
            systemId: 'rkms-portal',
            createdBy: 'SYSTEM',
          },
        });
        console.log(`Assigned admin role to user: ${user.username} (${user.email})`);
      } else {
        console.log(`User ${user.username} already has admin permission`);
      }
    }

    // Step 4: Assign default "View Only" role to all other users
    const viewOnlyRole = createdRoles.find(role => role.name === 'View Only');
    if (!viewOnlyRole) {
      throw new Error('View Only role not found');
    }

    const allUsers = await prisma.user.findMany();
    const usersWithoutPermissions = allUsers.filter(async (user) => {
      const permissions = await prisma.permission.findMany({
        where: { userId: user.id },
      });
      return permissions.length === 0;
    });

    for (const user of usersWithoutPermissions) {
      await prisma.permission.create({
        data: {
          userId: user.id,
          roleId: viewOnlyRole.id,
          systemId: 'rkms-portal',
          createdBy: 'SYSTEM',
        },
      });
      console.log(`Assigned View Only role to user: ${user.username} (${user.email})`);
    }

    console.log('Role migration completed successfully!');
    console.log(`Created ${createdRoles.length} roles`);
    console.log(`Processed ${allUsers.length} users`);

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateRoles()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 