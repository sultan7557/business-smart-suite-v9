import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    // Await params before using it
    const resolvedParams = await params;
    
    // Ensure resolved params.path is defined and is an array
    if (!resolvedParams.path || !Array.isArray(resolvedParams.path)) {
      return NextResponse.json({ error: "Invalid path parameter" }, { status: 400 })
    }
    
    // Join all path segments to get the full filename
    const filename = resolvedParams.path.join("/")

    // Get the file path on the server
    const filePath = path.join(process.cwd(), "public", "uploads", path.basename(filename))

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath)

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream" // Default

    // Map common extensions to content types
    const contentTypeMap: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".ppt": "application/vnd.ms-powerpoint",
      ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".txt": "text/plain",
    }

    if (ext in contentTypeMap) {
      contentType = contentTypeMap[ext]
    }

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(filename)}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 })
  }
}