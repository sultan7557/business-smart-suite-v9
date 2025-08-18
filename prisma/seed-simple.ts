import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)

  // Create roles first
  console.log('Creating roles...')
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Administrator with full access',
      systemId: 'business-smart-suite'
    }
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Manager with elevated permissions',
      systemId: 'business-smart-suite'
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Regular user with basic permissions',
      systemId: 'business-smart-suite'
    }
  })

  // Create users
  console.log('Creating users...')
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Admin User',
      email: 'admin@business-smart-suite.com',
      status: 'ACTIVE'
    }
  })

  const user = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: {
      username: 'user',
      password: userPassword,
      name: 'Regular User',
      email: 'user@business-smart-suite.com',
      status: 'ACTIVE'
    }
  })

  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      password: managerPassword,
      name: 'Manager User',
      email: 'manager@business-smart-suite.com',
      status: 'ACTIVE'
    }
  })

  // Create permissions for admin user (full access to all systems)
  console.log('Creating admin permissions...')
  const systems = [
    'policies', 'manuals', 'procedures', 'forms', 'certificates',
    'corrective-actions', 'business-continuity', 'management-reviews',
    'job-descriptions', 'work-instructions', 'registers', 'coshh',
    'risk-assessments', 'hse-guidance', 'technical-file',
    'environmental-guidance', 'custom-sections', 'audits',
    'interested-parties', 'organizational-context', 'objectives',
    'maintenance', 'improvement-register', 'legal-register',
    'training', 'suppliers'
  ]

  for (const systemId of systems) {
    await prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: admin.id,
          systemId,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: adminRole.id,
        systemId,
        expiry: null
      }
    })
  }

  // Create permissions for manager user
  console.log('Creating manager permissions...')
  const managerSystems = [
    'policies', 'manuals', 'procedures', 'forms', 'certificates',
    'corrective-actions', 'business-continuity', 'management-reviews',
    'job-descriptions', 'work-instructions', 'registers', 'coshh',
    'risk-assessments', 'hse-guidance', 'technical-file',
    'environmental-guidance', 'custom-sections', 'audits',
    'interested-parties', 'organizational-context', 'objectives',
    'maintenance', 'improvement-register', 'legal-register',
    'training', 'suppliers'
  ]

  for (const systemId of managerSystems) {
    await prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: manager.id,
          systemId,
          roleId: managerRole.id
        }
      },
      update: {},
      create: {
        userId: manager.id,
        roleId: managerRole.id,
        systemId,
        expiry: null
      }
    })
  }

  // Create basic permissions for regular user
  console.log('Creating user permissions...')
  const userSystems = [
    'policies', 'manuals', 'procedures', 'forms', 'certificates',
    'training'
  ]

  for (const systemId of userSystems) {
    await prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: user.id,
          systemId,
          roleId: userRole.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: userRole.id,
        systemId,
        expiry: null
      }
    })
  }

  // Create document notification settings for users
  console.log('Creating notification settings...')
  await prisma.documentNotificationSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      notification30Days: true,
      notification14Days: true,
      notification7Days: true,
      notification1Day: true,
      emailEnabled: true
    }
  })

  await prisma.documentNotificationSettings.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      notification30Days: true,
      notification14Days: true,
      notification7Days: true,
      notification1Day: true,
      emailEnabled: true
    }
  })

  await prisma.documentNotificationSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      notification30Days: true,
      notification14Days: true,
      notification7Days: true,
      notification1Day: true,
      emailEnabled: true
    }
  })

  console.log('Database seeding completed successfully!')
  console.log('\nCreated users:')
  console.log(`- Admin: ${admin.username} (${admin.email}) - Password: admin123`)
  console.log(`- Manager: ${manager.username} (${manager.email}) - Password: manager123`)
  console.log(`- User: ${user.username} (${user.email}) - Password: user123`)
  console.log('\nPlease change passwords after first login!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
