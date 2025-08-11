import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs a proper document download URL without double slashes
 * @param fileUrl - The file URL from the database (e.g., "/uploads/filename.pdf")
 * @returns Properly formatted download URL
 */
export function getDocumentUrl(fileUrl: string): string {
  if (!fileUrl) return ""
  
  // If the URL already contains the full API path, return it as is
  if (fileUrl.startsWith('/api/documents/download/')) {
    return fileUrl
  }
  
  // If the URL starts with /uploads/, remove the leading slash to avoid double slashes
  if (fileUrl.startsWith('/uploads/')) {
    return `/api/documents/download${fileUrl}`
  }
  
  // If the URL doesn't start with /uploads/, assume it's just the filename
  return `/api/documents/download/uploads/${fileUrl}`
}

export function formatDate(dateString: string | Date | null | undefined) {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    // Use a consistent format that works on both server and client
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "-"
  }
}

