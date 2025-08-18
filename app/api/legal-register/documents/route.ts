import { type NextRequest, NextResponse } from "next/server"
import { uploadLegalRegisterDocument } from "@/app/actions/legal-register-actions"
import { getUser } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import prisma from "@/lib/prisma"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const legalRegisterId = formData.get("legalRegisterId") as string

    if (!file || !legalRegisterId) {
      return NextResponse.json(
        { error: "File and legal register ID are required" },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = path.extname(file.name)
    const filename = `${timestamp}-${randomString}${fileExtension}`
    const filePath = path.join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    fs.writeFileSync(filePath, buffer)

    const fileUrl = `/uploads/${filename}`

    // Use the server action for better consistency
    const result = await uploadLegalRegisterDocument(legalRegisterId, {
      title: title || file.name,
      fileUrl,
      fileType: file.type,
      size: file.size,
    })

    if (!result.success) {
      throw new Error(result.error || "Failed to create document record")
    }

    return NextResponse.json(result.data)
  } catch (error: any) {
    console.error("Error in POST /api/legal-register/documents:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const legalRegisterId = searchParams.get("legalRegisterId")

    if (!legalRegisterId) {
      return NextResponse.json(
        { error: "Legal register ID is required" },
        { status: 400 }
      )
    }

    // Always fetch fresh data from database
    const documents = await prisma.legalRegisterDocument.findMany({
      where: {
        legalRegisterId: legalRegisterId,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    })

    // Set cache control headers to prevent caching
    const response = NextResponse.json(documents)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error: any) {
    console.error("Error in GET /api/legal-register/documents:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}