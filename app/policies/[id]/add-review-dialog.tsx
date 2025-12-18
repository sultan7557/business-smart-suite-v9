"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addPolicyReview } from "@/app/actions/policy-actions"
import { toast } from "@/components/ui/use-toast"

interface AddReviewDialogProps {
  policyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddReviewDialog({ policyId, open, onOpenChange }: AddReviewDialogProps) {
  const [reviewerName, setReviewerName] = useState("")
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0])
  const [nextReviewDate, setNextReviewDate] = useState("")
  const [details, setDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addPolicyReview(policyId, {
        reviewerName,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
        details,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Review added successfully",
        })
        onOpenChange(false)
        // Reset form
        setReviewerName("")
        setReviewDate(new Date().toISOString().split("T")[0])
        setNextReviewDate("")
        setDetails("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reviewerName">Reviewer Name</Label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input
              id="reviewDate"
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
            <Input
              id="nextReviewDate"
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="details">Review Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

