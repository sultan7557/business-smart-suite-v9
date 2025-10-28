import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { saveFile } from "@/lib/file-storage"

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized or invalid user" }, { status: 401 })
    }

    const formData = await request.formData()
    const auditId = formData.get("auditId") as string
    
    if (!auditId) {
      return NextResponse.json({ error: "Audit ID is required" }, { status: 400 })
    }

    // Check if audit exists
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    })

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 })
    }

    // Get files from form data
    const files = formData.getAll("files") as File[]
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = []

    // Process each file
    for (const file of files) {
      try {
        // Save the file to the local filesystem
        const savedFile = await saveFile(file)
        
        // Create document record
        const document = await prisma.document.create({
          data: {
            title: file.name,
            fileUrl: savedFile.path,
            fileType: savedFile.mimeType,
            size: savedFile.size,
            uploadedById: user.id,
            relatedEntityId: auditId,
            relatedEntityType: "audit",
          },
        })

        uploadedFiles.push({
          id: document.id,
          title: document.title,
          fileUrl: document.fileUrl,
          fileType: document.fileType,
          size: document.size,
        })
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      uploadedFiles,
      message: `${uploadedFiles.length} file(s) uploaded successfully`
    })
  } catch (error) {
    console.error("Error uploading audit documents:", error)
    return NextResponse.json({ 
      success: false, 
      error: `Failed to upload documents: ${error}` 
    }, { status: 500 })
  }
}

