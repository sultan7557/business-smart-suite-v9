import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { z } from "zod"

const auditLogQuerySchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  systemId: z.string().optional(),
  roleId: z.string().optional(),
  performedBy: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().transform(Number).default("1"),
  pageSize: z.string().transform(Number).default("10"),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // TODO: Implement permission check for viewing audit logs (e.g., "view_audit_logs" or "master_admin")
    // if (!currentUser.permissions.includes("view_audit_logs") && !currentUser.permissions.includes("master_admin")) {
    //   return NextResponse.json({ error: "Forbidden: You do not have permission to view audit logs." }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams);

    const validatedParams = auditLogQuerySchema.parse(queryParams);
    const { userId, action, systemId, roleId, performedBy, startDate, endDate, page, pageSize } = validatedParams;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (systemId) where.systemId = systemId;
    if (roleId) where.roleId = roleId;
    if (performedBy) where.performedBy = performedBy;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * pageSize;

    const [auditLogs, totalLogs] = await prisma.$transaction([
      prisma.permissionAudit.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } }, // Include user details if related
          role: { select: { id: true, name: true } }, // Include role details if related
        },
      }),
      prisma.permissionAudit.count({ where }),
    ]);

    return NextResponse.json({
      auditLogs,
      pagination: {
        total: totalLogs,
        page,
        pageSize,
        totalPages: Math.ceil(totalLogs / pageSize),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Get audit logs error:", error);
    return NextResponse.json({ error: "An error occurred while fetching audit logs" }, { status: 500 });
  }
} 