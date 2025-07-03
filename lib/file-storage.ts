
import fs from "fs"
import path from "path"

// Define the upload directory - this should be in a public folder for file access
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

// Ensure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export interface SavedFile {
  filename: string
  originalName: string
  path: string
  size: number
  mimeType: string
}

/**
 * Save a file to the local filesystem
 */
export async function saveFile(file: File): Promise<SavedFile> {
  // Generate a unique filename to prevent collisions
  const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
  const filePath = path.join(UPLOAD_DIR, uniqueFilename)

  // Convert the file to a buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  // Write the file to disk
  fs.writeFileSync(filePath, buffer)

  // Return the file information
  return {
    filename: uniqueFilename,
    originalName: file.name,
    path: `/uploads/${uniqueFilename}`, // This is the public URL path
    size: file.size,
    mimeType: file.type,
  }
}

/**
 * Get the full server path for a file
 */
export function getFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, path.basename(filename))
}

