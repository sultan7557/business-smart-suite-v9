import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default roles
  const defaultRoles = [
    { name: 'View Only', description: 'Can view content but cannot edit', systemId: 'business-smart-suite' },
    { name: 'Edit', description: 'Can view and edit content', systemId: 'business-smart-suite' },
    { name: 'Delete', description: 'Can view, edit, and delete content', systemId: 'business-smart-suite' },
    { name: 'Admin', description: 'Full administrative access', systemId: 'business-smart-suite' },
    { name: 'Approve', description: 'Can approve changes and content', systemId: 'business-smart-suite' },
    { name: 'Manage Users', description: 'Can manage user accounts and permissions', systemId: 'business-smart-suite' },
  ]

  console.log('Creating default roles...')
  
  for (const role of defaultRoles) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name }
      })

      if (!existingRole) {
        await prisma.role.create({
          data: role
        })
        console.log(`Created role: ${role.name}`)
      } else {
        // Update existing role with systemId if it doesn't have one
        if (!existingRole.systemId) {
          await prisma.role.update({
            where: { id: existingRole.id },
            data: { systemId: role.systemId }
          })
          console.log(`Updated role: ${role.name} with systemId`)
        } else {
          console.log(`Role already exists: ${role.name}`)
        }
      }
    } catch (error) {
      console.error(`Error creating/updating role ${role.name}:`, error)
    }
  }

  // Create default groups
  const defaultGroups = [
    {
      name: 'Administrators',
      description: 'System administrators with full access',
      permissions: ['View Only', 'Edit', 'Delete', 'Admin', 'Approve', 'Manage Users']
    },
    {
      name: 'Managers',
      description: 'Department managers with elevated permissions',
      permissions: ['View Only', 'Edit', 'Delete', 'Approve']
    },
    {
      name: 'Standard Users',
      description: 'Regular users with basic permissions',
      permissions: ['View Only', 'Edit']
    },
    {
      name: 'Viewers',
      description: 'Users with read-only access',
      permissions: ['View Only']
    }
  ]

  console.log('\nCreating default groups...')
  
  for (const group of defaultGroups) {
    try {
      const existingGroup = await prisma.group.findUnique({
        where: { name: group.name }
      })

      if (!existingGroup) {
        // Get role IDs for permissions
        const roleIds = await Promise.all(
          group.permissions.map(async (permissionName) => {
            const role = await prisma.role.findUnique({
              where: { name: permissionName }
            })
            return role?.id
          })
        )

        const validRoleIds = roleIds.filter(id => id !== undefined)

        const newGroup = await prisma.group.create({
          data: {
            name: group.name,
            description: group.description
          }
        })

        // Create group permissions with the new systemId and robust system
        for (const roleId of validRoleIds) {
          await prisma.groupPermission.create({
            data: {
              groupId: newGroup.id,
              roleId: roleId!,
              systemId: 'business-smart-suite'
            }
          })
        }

        console.log(`Created group: ${group.name}`)
      } else {
        console.log(`Group already exists: ${group.name}`)
      }
    } catch (error) {
      console.error(`Error creating/updating group ${group.name}:`, error)
    }
  }

  console.log('\nMigration completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 