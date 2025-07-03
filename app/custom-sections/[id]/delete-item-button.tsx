"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

interface DeleteItemButtonProps {
  itemId: string
  itemType: "document" | "version" | "review"
  sectionId: string
  onDelete?: () => void
}

export function DeleteItemButton({ itemId, itemType, sectionId, onDelete }: DeleteItemButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return
    }

    setIsDeleting(true)

    try {
      let url = ""
      switch (itemType) {
        case "document":
          url = `/api/documents/${itemId}`
          break
        case "version":
          url = `/api/custom-sections/${sectionId}/versions/${itemId}`
          break
        case "review":
          url = `/api/custom-sections/${sectionId}/reviews/${itemId}`
          break
      }

      const response = await fetch(url, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`)
      }

      toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`)
      
      // Call onDelete callback if provided
      if (onDelete) {
        onDelete()
      }
      
      // Refresh the router to update the UI
      router.refresh()
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error)
      toast.error(`Failed to delete ${itemType}`)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting && <Spinner size="sm" />}
    </Button>
  )
} 