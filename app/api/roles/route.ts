import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Standard roles that should be shown in the UI
const STANDARD_ROLES = [
  'View Only',
  'Edit', 
  'Delete',
  'Admin',
  'Approve',
  'Manage Users'
];

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all roles from database
    const allRoles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    // Filter to only show standard roles, preferring the correct case
    const filteredRoles = [];
    
    for (const standardRole of STANDARD_ROLES) {
      // Find the role with exact name match first
      let role = allRoles.find(r => r.name === standardRole);
      
      // If not found, find case-insensitive match
      if (!role) {
        role = allRoles.find(r => r.name.toLowerCase() === standardRole.toLowerCase());
      }
      
      if (role) {
        // Use the standard name for display
        filteredRoles.push({
          ...role,
          name: standardRole, // Always use the standard name
          description: getRoleDescription(standardRole)
        });
      }
    }

    return NextResponse.json({ roles: filteredRoles });
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json({ 
      error: "An error occurred while fetching roles",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function getRoleDescription(roleName: string): string {
  switch (roleName) {
    case 'View Only':
      return 'Can view content but cannot edit';
    case 'Edit':
      return 'Can view and edit content';
    case 'Delete':
      return 'Can view, edit, and delete content';
    case 'Admin':
      return 'Full administrative access';
    case 'Approve':
      return 'Can approve changes and content';
    case 'Manage Users':
      return 'Can manage user accounts and permissions';
    default:
      return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, systemId } = body;

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findFirst({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json({ error: "Role with this name already exists" }, { status: 409 });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description: description || null,
        systemId: systemId || 'rkms-portal',
      },
    });

    return NextResponse.json({ message: "Role created successfully", role: newRole }, { status: 201 });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ 
      error: "An error occurred while creating the role",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 