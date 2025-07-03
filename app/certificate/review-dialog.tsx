"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { addCertificateReview, deleteCertificateReview } from "@/app/actions/certificate-actions"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface ReviewDialogProps {
  certificateId: string
  reviews: Array<{
    id: string
    details: string
    reviewDate: Date
    nextReviewDate: Date | null
    reviewedBy: {
      name: string | null
      email: string
    }
  }>
  canEdit: boolean
}

export function ReviewDialog({ certificateId, reviews, canEdit }: ReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    details: "",
    reviewDate: new Date(),
    nextReviewDate: null as Date | null,
    reviewedBy: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addCertificateReview(certificateId, {
        details: formData.details,
        reviewDate: formData.reviewDate,
        nextReviewDate: formData.nextReviewDate || undefined,
        reviewedBy: formData.reviewedBy,
      })

      if (result.success) {
        toast.success("Review added successfully")
        setFormData({
          details: "",
          reviewDate: new Date(),
          nextReviewDate: null,
          reviewedBy: "",
        })
        setIsOpen(false)
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

  const handleDelete = async (reviewId: string) => {
    try {
      const result = await deleteCertificateReview(reviewId)
      if (result.success) {
        toast.success("Review deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete review")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the review")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Reviews</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Certificate Reviews</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-2 border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.reviewedBy.name || review.reviewedBy.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Reviewed on {format(new Date(review.reviewDate), "PPP")}
                  </p>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm">{review.details}</p>
              {review.nextReviewDate && (
                <p className="text-sm text-muted-foreground">
                  Next review: {format(new Date(review.nextReviewDate), "PPP")}
                </p>
              )}
            </div>
          ))}

          {canEdit && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewedBy">Reviewed By</Label>
                <Input
                  id="reviewedBy"
                  value={formData.reviewedBy}
                  onChange={(e) => setFormData({ ...formData, reviewedBy: e.target.value })}
                  placeholder="Enter reviewer's name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Review Details</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Review Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.reviewDate ? format(formData.reviewDate, "PPP") : "Pick a date"}
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
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.nextReviewDate ? format(formData.nextReviewDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.nextReviewDate || undefined}
                      onSelect={(date) => setFormData({ ...formData, nextReviewDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding Review..." : "Add Review"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 