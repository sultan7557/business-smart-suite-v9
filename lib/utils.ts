import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

