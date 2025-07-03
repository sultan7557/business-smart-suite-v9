"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { toast } from "sonner"
import { addCertificateReview } from "@/app/actions/certificate-actions"
import { useRouter } from "next/navigation"

interface AddReviewDialogProps {
  certificateId: string
  canEdit: boolean
}

export function AddReviewDialog({ certificateId, canEdit }: AddReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    details: "",
    reviewDate: new Date(),
    nextReviewDate: null as Date | null,
    reviewerName: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addCertificateReview(certificateId, {
        details: formData.details,
        reviewDate: formData.reviewDate,
        nextReviewDate: formData.nextReviewDate || undefined,
        reviewerName: formData.reviewerName,
      })

      if (result.success) {
        toast.success("Review added successfully")
        setFormData({
          details: "",
          reviewDate: new Date(),
          nextReviewDate: null,
          reviewerName: "",
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

  if (!canEdit) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewerName">Reviewer Name</Label>
            <Input
              id="reviewerName"
              value={formData.reviewerName}
              onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
              required
              placeholder="Enter reviewer's name"
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
                  onSelect={(date) => setFormData({ ...formData, nextReviewDate: date || null })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Adding Review..." : "Add Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 