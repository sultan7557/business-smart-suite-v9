import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const versions = await prisma.maintenanceDocumentVersion.findMany({
      where: { documentId: params.documentId },
      orderBy: { version: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: versions });
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch document versions" },
      { status: 500 }
    );
  }
} 