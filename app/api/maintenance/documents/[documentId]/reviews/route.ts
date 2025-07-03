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

    const reviews = await prisma.maintenanceDocumentReview.findMany({
      where: { documentId: params.documentId },
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching document reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch document reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, comments } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const review = await prisma.maintenanceDocumentReview.create({
      data: {
        documentId: params.documentId,
        reviewerId: user.id,
        status,
        comments,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Error creating document review:", error);
    return NextResponse.json(
      { error: "Failed to create document review" },
      { status: 500 }
    );
  }
} 