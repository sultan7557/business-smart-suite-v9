"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

interface DeleteCustomSectionButtonProps {
  sectionId: string
}

export function DeleteCustomSectionButton({ sectionId }: DeleteCustomSectionButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this section? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/custom-sections/${sectionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      toast.success("Section deleted successfully")
      router.push("/custom-sections")
      router.refresh()
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="mr-2 h-4 w-4" />
      {isDeleting ? <Spinner size="sm" /> : "Delete Section"}
    </Button>
  )
} 