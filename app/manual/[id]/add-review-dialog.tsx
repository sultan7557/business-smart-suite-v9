"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface AddReviewDialogProps {
  manualId: string
}

export default function AddReviewDialog({ manualId }: AddReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      details: formData.get("details") as string,
      reviewDate: new Date(formData.get("reviewDate") as string),
      nextReviewDate: formData.get("nextReviewDate") ? new Date(formData.get("nextReviewDate") as string) : null,
      reviewerName: formData.get("reviewerName") as string,
    }

    try {
      const response = await fetch(`/api/manuals/${manualId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to add review")
      }

      toast({
        title: "Success",
        description: "Review added successfully",
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reviewerName">Reviewer Name</Label>
            <Input id="reviewerName" name="reviewerName" required />
          </div>
          <div>
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input id="reviewDate" name="reviewDate" type="date" required />
          </div>
          <div>
            <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
            <Input id="nextReviewDate" name="nextReviewDate" type="date" />
          </div>
          <div>
            <Label htmlFor="details">Review Details</Label>
            <Input id="details" name="details" required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 