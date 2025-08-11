#!/usr/bin/env node

// Create Admin User Script
// This script creates the admin user with proper permissions

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log('🔧 Creating admin user...')

  try {
    // Step 1: Create roles if they don't exist
    console.log('📝 Creating roles...')
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Full administrative access',
        systemId: 'rkms-portal'
      }
    })

    const viewOnlyRole = await prisma.role.upsert({
      where: { name: 'View Only' },
      update: {},
      create: {
        name: 'View Only',
        description: 'Can view content but cannot edit',
        systemId: 'rkms-portal'
      }
    })

    const editRole = await prisma.role.upsert({
      where: { name: 'Edit' },
      update: {},
      create: {
        name: 'Edit',
        description: 'Can view and edit content',
        systemId: 'rkms-portal'
      }
    })

    const deleteRole = await prisma.role.upsert({
      where: { name: 'Delete' },
      update: {},
      create: {
        name: 'Delete',
        description: 'Can view, edit, and delete content',
        systemId: 'rkms-portal'
      }
    })

    console.log('✅ Roles created/updated')

    // Step 2: Create admin user if it doesn't exist
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        name: 'Admin User',
        email: 'admin@example.com',
        status: 'ACTIVE',
        active: true
      }
    })

    console.log('✅ Admin user created/updated')

    // Step 3: Assign admin permissions
    console.log('🔐 Assigning admin permissions...')
    
    // Check if admin permission already exists
    const existingAdminPermission = await prisma.permission.findFirst({
      where: {
        userId: adminUser.id,
        roleId: adminRole.id,
        systemId: 'rkms-portal'
      }
    })

    if (!existingAdminPermission) {
      await prisma.permission.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
          systemId: 'rkms-portal',
          createdBy: 'SYSTEM'
        }
      })
      console.log('✅ Admin permissions assigned')
    } else {
      console.log('✅ Admin permissions already exist')
    }

    // Step 4: Assign all other permissions to admin
    const allRoles = [viewOnlyRole, editRole, deleteRole]
    for (const role of allRoles) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          userId: adminUser.id,
          roleId: role.id,
          systemId: 'rkms-portal'
        }
      })

      if (!existingPermission) {
        await prisma.permission.create({
          data: {
            userId: adminUser.id,
            roleId: role.id,
            systemId: 'rkms-portal',
            createdBy: 'SYSTEM'
          }
        })
        console.log(`✅ ${role.name} permissions assigned to admin`)
      }
    }

    console.log('🎉 Admin user setup complete!')
    console.log('📋 Login credentials:')
    console.log('   Username: admin')
    console.log('   Password: admin123')
    console.log('   Email: admin@example.com')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser() 