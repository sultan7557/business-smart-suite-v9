#!/usr/bin/env node

// Fix Admin Permissions Script
// This script ensures the admin user has full permissions

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPermissions() {
  console.log('🔧 Fixing admin permissions...');

  try {
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { username: 'admin' },
      include: {
        permissions: {
          include: { role: true }
        }
      }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.username}`);

    // Check existing permissions
    console.log(`📋 Current permissions: ${adminUser.permissions.length}`);
    adminUser.permissions.forEach(p => {
      console.log(`  - ${p.systemId} (${p.role.name})`);
    });

    // Find or create Admin role
    let adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Admin',
          description: 'Full administrative access',
          systemId: 'rkms-portal'
        }
      });
      console.log('✅ Created Admin role');
    } else {
      console.log('✅ Found Admin role');
    }

    // Define all system IDs that need admin access
    const allSystems = [
      'policies',
      'manuals',
      'procedures',
      'forms',
      'certificates',
      'corrective-actions',
      'business-continuity',
      'management-review',
      'job-descriptions',
      'work-instructions',
      'coshh',
      'risk-assessments',
      'hse-guidance',
      'technical-files',
      'environmental-guidance',
      'custom-sections',
      'registers',
      'legal-register',
      'training',
      'maintenance',
      'improvement-register',
      'objectives',
      'organizational-context',
      'interested-parties',
      'audit-schedule',
      'suppliers',
      'statement-of-applicability',
      'users',
      'permissions',
      'groups',
      'roles'
    ];

    // Delete existing permissions for admin to start fresh
    await prisma.permission.deleteMany({
      where: { userId: adminUser.id }
    });
    console.log('🗑️  Deleted existing permissions');

    // Create admin permissions for all systems
    const permissionsToCreate = allSystems.map(systemId => ({
      userId: adminUser.id,
      systemId: systemId,
      roleId: adminRole.id,
      createdBy: 'SYSTEM'
    }));

    await prisma.permission.createMany({
      data: permissionsToCreate
    });

    console.log(`✅ Created ${permissionsToCreate.length} admin permissions`);

    // Verify the permissions were created
    const updatedAdmin = await prisma.user.findFirst({
      where: { username: 'admin' },
      include: {
        permissions: {
          include: { role: true }
        }
      }
    });

    console.log(`📋 Updated permissions: ${updatedAdmin.permissions.length}`);
    updatedAdmin.permissions.forEach(p => {
      console.log(`  - ${p.systemId} (${p.role.name})`);
    });

    // Create admin group if it doesn't exist
    let adminGroup = await prisma.group.findFirst({
      where: { name: 'Administrators' }
    });

    if (!adminGroup) {
      adminGroup = await prisma.group.create({
        data: {
          name: 'Administrators',
          description: 'System administrators group'
        }
      });
      console.log('✅ Created Administrators group');
    } else {
      console.log('✅ Found Administrators group');
    }

    // Add admin to admin group
    await prisma.userGroup.upsert({
      where: {
        userId_groupId: {
          userId: adminUser.id,
          groupId: adminGroup.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        groupId: adminGroup.id,
        addedBy: adminUser.id
      }
    });
    console.log('✅ Added admin to Administrators group');

    // Create group permissions for all systems
    await prisma.groupPermission.deleteMany({
      where: { groupId: adminGroup.id }
    });

    const groupPermissionsToCreate = allSystems.map(systemId => ({
      groupId: adminGroup.id,
      systemId: systemId,
      roleId: adminRole.id,
      createdBy: 'SYSTEM'
    }));

    await prisma.groupPermission.createMany({
      data: groupPermissionsToCreate
    });

    console.log(`✅ Created ${groupPermissionsToCreate.length} group permissions`);

    console.log('🎉 Admin permissions fixed successfully!');
    console.log('📋 Admin user now has full access to all systems');

  } catch (error) {
    console.error('❌ Error fixing admin permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixAdminPermissions()
  .then(() => {
    console.log('✅ Admin permissions fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin permissions fix failed:', error);
    process.exit(1);
  }); 