import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const userListSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED", "INACTIVE"]).optional(),
  page: z.string().transform(Number).default("1"),
  pageSize: z.string().transform(Number).default("10"),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    const validatedParams = userListSchema.parse(queryParams);

    const { search, status, page, pageSize } = validatedParams;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * pageSize;

    const [users, totalUsers] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: { // Select only necessary fields
          id: true,
          name: true,
          email: true,
          username: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        pageSize,
        totalPages: Math.ceil(totalUsers / pageSize),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error("List users error:", error)
    return NextResponse.json({ error: "An error occurred while fetching users" }, { status: 500 })
  }
} 