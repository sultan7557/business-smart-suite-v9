import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

const defaultRoles = [
  {
    name: "Master Admin",
    description: "Full system access with all permissions"
  },
  {
    name: "System Admin",
    description: "System administration access"
  },
  {
    name: "Manager",
    description: "Management level access"
  },
  {
    name: "User",
    description: "Standard user access"
  }
];

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if roles already exist
    const existingRoles = await prisma.role.findMany()
    if (existingRoles.length > 0) {
      return NextResponse.json({ message: "Roles already initialized", roles: existingRoles })
    }

    // Create default roles
    const createdRoles = await Promise.all(
      defaultRoles.map(role => 
        prisma.role.create({
          data: role
        })
      )
    )

    return NextResponse.json({ message: "Default roles created successfully", roles: createdRoles })
  } catch (error) {
    console.error("Initialize roles error:", error)
    return NextResponse.json({ error: "An error occurred while initializing roles" }, { status: 500 })
  }
} 