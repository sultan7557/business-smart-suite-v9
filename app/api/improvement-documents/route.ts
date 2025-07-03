import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const improvementId = formData.get("improvementId") as string
    const title = formData.get("title") as string
    const file = formData.get("file") as File

    if (!improvementId || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "improvements", improvementId)
    try {
      await writeFile(join(uploadDir, "test.txt"), "")
    } catch (error) {
      // Directory doesn't exist, create it
      const fs = require("fs")
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.name}`
    const filePath = join(uploadDir, fileName)
    
    // Convert file to buffer and save it
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create the public URL
    const fileUrl = `/uploads/improvements/${improvementId}/${fileName}`

    // Create document record in database
    const document = await prisma.improvementDocument.create({
      data: {
        title: title || file.name,
        fileUrl,
        fileType: file.type,
        size: file.size,
        uploadedById: user.id,
        improvementId,
        uploadedAt: new Date(),
        versions: {
          create: {
            version: "1",
            fileUrl,
            createdById: user.id,
            createdAt: new Date(),
          },
        },
      },
      include: {
        versions: true,
      },
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 })
  }
}