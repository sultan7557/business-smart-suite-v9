#!/usr/bin/env node

// Create Admin User Script
// This script creates the initial admin user for the system

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔧 Creating admin user...');

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@example.com' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.username);
      return existingAdmin;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        name: 'System Administrator',
        password: hashedPassword,
        status: 'active',
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.username);

    // Create admin role if it doesn't exist
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
      console.log('✅ Admin role created');
    }

    // Assign admin permission to the user
    const existingPermission = await prisma.permission.findFirst({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id,
        systemId: 'rkms-portal'
      }
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
          systemId: 'rkms-portal',
          createdBy: 'SYSTEM'
        }
      });
      console.log('✅ Admin permissions assigned');
    }

    console.log('🎉 Admin user setup completed successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('✅ Admin user creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin user creation failed:', error);
    process.exit(1);
  }); 