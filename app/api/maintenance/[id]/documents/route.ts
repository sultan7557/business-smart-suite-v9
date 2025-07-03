import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params to get the id
    const { id } = await params;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const notes = formData.get("notes") as string;
    const existingDocumentId = formData.get("documentId") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
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

    // Create or update document
    let document;
    if (existingDocumentId) {
      // Get the latest version number
      const latestVersion = await prisma.maintenanceDocumentVersion.findFirst({
        where: { documentId: existingDocumentId },
        orderBy: { version: "desc" },
      });

      const newVersion = latestVersion
        ? (parseInt(latestVersion.version) + 1).toString()
        : "1";

      // Create new version
      await prisma.maintenanceDocumentVersion.create({
        data: {
          documentId: existingDocumentId,
          version: newVersion,
          fileUrl: `/uploads/${filename}`,
          createdById: user.id,
          notes: notes || `Version ${newVersion}`,
        },
      });

      document = await prisma.maintenanceDocument.findUnique({
        where: { id: existingDocumentId },
      });
    } else {
      // Create new document
      document = await prisma.maintenanceDocument.create({
        data: {
          maintenanceId: id, // Use the extracted id instead of params.id
          title,
          fileUrl: `/uploads/${filename}`,
          fileType: file.type,
          size: file.size,
          uploadedById: user.id,
        },
      });

      // Create initial version
      await prisma.maintenanceDocumentVersion.create({
        data: {
          documentId: document.id,
          version: "1",
          fileUrl: `/uploads/${filename}`,
          createdById: user.id,
          notes: notes || "Initial version",
        },
      });
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error) {
    console.error("Error handling document upload:", error);
    return NextResponse.json(
      { error: "Failed to process document upload" },
      { status: 500 }
    );
  }
}