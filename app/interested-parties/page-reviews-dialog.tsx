"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { createInterestedPartyReview, getInterestedPartyReviews, deleteInterestedPartyReview } from "@/app/actions/interested-party-actions"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"

interface PageReviewsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  interestedPartyId: string
  interestedPartyName: string
}

export default function PageReviewsDialog({ 
  open, 
  onOpenChange, 
  interestedPartyId, 
  interestedPartyName 
}: PageReviewsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (open && interestedPartyId) {
      loadReviews()
    }
  }, [open, interestedPartyId])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const result = await getInterestedPartyReviews(interestedPartyId)
      if (result.success) {
        setReviews(result.reviews)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load reviews",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreateReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const result = await createInterestedPartyReview(interestedPartyId, formData)
      
      if (result.success) {
        toast({
          title: "Review created",
          description: "A new review has been created successfully.",
        })
        setShowCreateForm(false)
        loadReviews() // Reload reviews
      } else {
        throw new Error(result.error || "Failed to create review")
      }
    } catch (error: any) {
      console.error("Error creating review:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the review.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deleteInterestedPartyReview(reviewId)
      if (result.success) {
        toast({
          title: "Review deleted",
          description: "The review has been deleted successfully.",
        })
        loadReviews() // Reload reviews
      } else {
        throw new Error(result.error || "Failed to delete review")
      }
    } catch (error: any) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the review.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Page Reviews - {interestedPartyName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create Review Button */}
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            className="w-full"
          >
            {showCreateForm ? "Cancel Create Review" : "Add New Review"}
          </Button>

          {/* Create Review Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateReview} className="space-y-4 p-4 border rounded-md">
              <div>
                <Label htmlFor="reviewerName">Reviewer</Label>
                <Input 
                  id="reviewerName" 
                  name="reviewerName" 
                  required 
                  placeholder="Enter reviewer name"
                />
              </div>
              
              <div>
                <Label htmlFor="reviewDetails">Details of review</Label>
                <Textarea 
                  id="reviewDetails" 
                  name="reviewDetails" 
                  rows={3}
                  placeholder="Describe the review details..."
                />
              </div>
              
              <div>
                <Label htmlFor="reviewDate">Review date</Label>
                <Input 
                  id="reviewDate" 
                  name="reviewDate" 
                  type="date" 
                  required 
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              
              <div>
                <Label htmlFor="nextReviewDate">Next review date (optional)</Label>
                <Input 
                  id="nextReviewDate" 
                  name="nextReviewDate" 
                  type="date"
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Review"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Reviews Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Reviewer</th>
                  <th className="border p-2 text-left">Details of review</th>
                  <th className="border p-2 text-left">Review date</th>
                  <th className="border p-2 text-left">Next review date</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="border p-4 text-center text-gray-500">
                      Loading reviews...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="border p-4 text-center text-gray-500">
                      No reviews found. Add the first review to get started.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="border p-2 font-medium">
                        {review.reviewerName}
                      </td>
                      <td className="border p-2">
                        <div className="text-sm whitespace-pre-wrap">
                          {review.reviewDetails || "No details provided"}
                        </div>
                      </td>
                      <td className="border p-2">
                        {format(new Date(review.reviewDate), 'dd/MM/yyyy')}
                      </td>
                      <td className="border p-2">
                        {review.nextReviewDate ? 
                          format(new Date(review.nextReviewDate), 'dd/MM/yyyy') : 
                          "-"
                        }
                      </td>
                      <td className="border p-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 