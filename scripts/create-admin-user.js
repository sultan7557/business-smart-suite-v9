#!/usr/bin/env node

// Create Admin User Script
// This script creates the admin user with proper permissions

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin role if it doesn't exist
    let adminRole = await prisma.role.findUnique({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Admin',
          description: 'Full administrative access',
          systemId: 'business-smart-suite'
        }
      });
      console.log('Created Admin role');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        email: 'admin@business-smart-suite.com',
        active: true,
        status: 'ACTIVE'
      }
    });

    console.log('Created admin user:', adminUser.username);

    // Create admin permission
    await prisma.permission.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
        systemId: 'business-smart-suite',
        createdBy: 'SYSTEM'
      }
    });

    console.log('Assigned Admin role to admin user');

    // Create additional admin permissions for full access
    const additionalRoles = ['View Only', 'Edit', 'Delete', 'Approve', 'Manage Users'];
    
    for (const roleName of additionalRoles) {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (role) {
        await prisma.permission.create({
          data: {
            userId: adminUser.id,
            roleId: role.id,
            systemId: 'business-smart-suite',
            createdBy: 'SYSTEM'
          }
        });
        console.log(`Assigned ${roleName} role to admin user`);
      }
    }

    console.log('Admin user setup completed successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 