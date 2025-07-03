import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const supplierId = formData.get("supplierId") as string;

    if (!file || !supplierId) {
      return NextResponse.json(
        { error: "File and supplier ID are required" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(process.cwd(), "public", "uploads", filename);

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record
    const document = await prisma.supplierDocument.create({
      data: {
        supplierId,
        title: file.name,
        fileUrl: `/uploads/${filename}`,
        fileType: file.type,
        size: file.size,
        uploadedById: user.id,
        versions: {
          create: {
            version: "1",
            fileUrl: `/uploads/${filename}`,
            createdById: user.id,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("Error handling document upload:", error);
    return NextResponse.json(
      { error: "Failed to process document upload" },
      { status: 500 }
    );
  }
} 