"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { addCorrectiveActionReview } from "@/app/actions/corrective-action-actions"
import { useRouter } from "next/navigation"

interface AddReviewDialogProps {
  correctiveActionId: string
  canEdit: boolean
}

export function AddReviewDialog({ correctiveActionId, canEdit }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    details: "",
    reviewDate: new Date(),
    nextReviewDate: null as Date | null,
    reviewerName: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return

    setIsSubmitting(true)
    try {
      const form = new FormData()
      form.append("details", formData.details)
      form.append("reviewDate", formData.reviewDate.toISOString())
      if (formData.nextReviewDate) {
        form.append("nextReviewDate", formData.nextReviewDate.toISOString())
      }
      form.append("reviewerName", formData.reviewerName)

      const result = await addCorrectiveActionReview(correctiveActionId, form)
      if (result.success) {
        toast.success("Review added successfully")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to add review")
      }
    } catch (error) {
      toast.error("An error occurred while adding the review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canEdit) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewerName">Reviewer Name</Label>
            <Input
              id="reviewerName"
              value={formData.reviewerName}
              onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
              placeholder="Enter reviewer name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Review Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Enter review details"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Review Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.reviewDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.reviewDate ? format(formData.reviewDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.reviewDate}
                  onSelect={(date) => date && setFormData({ ...formData, reviewDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Next Review Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.nextReviewDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextReviewDate ? (
                    format(formData.nextReviewDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.nextReviewDate}
                  onSelect={(date) => setFormData({ ...formData, nextReviewDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
