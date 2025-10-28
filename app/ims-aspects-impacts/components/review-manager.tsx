"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Plus, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Review {
  id: string
  reviewerName: string
  reviewDetails: string
  reviewDate: string
  nextReviewDate: string
}

interface ReviewManagerProps {
  aspectImpactId: string
  reviews: Review[]
  onReviewsChange: (reviews: Review[]) => void
}

export default function ReviewManager({ aspectImpactId, reviews, onReviewsChange }: ReviewManagerProps) {
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    reviewDetails: "",
    reviewDate: new Date().toISOString().split("T")[0],
    nextReviewDate: ""
  })

  const handleAddReview = async () => {
    if (!newReview.reviewerName || !newReview.reviewDetails) return

    try {
      const response = await fetch(`/api/ims-aspects-impacts/${aspectImpactId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      })

      if (response.ok) {
        const { data } = await response.json()
        onReviewsChange([...reviews, data])
        setNewReview({
          reviewerName: "",
          reviewDetails: "",
          reviewDate: new Date().toISOString().split("T")[0],
          nextReviewDate: ""
        })
        setShowAddReview(false)
        toast({
          title: "Success",
          description: "Review added successfully",
        })
      } else {
        throw new Error("Failed to add review")
      }
    } catch (error) {
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    const reviewerName = review?.reviewerName || 'this review';
    
    if (!confirm(`Are you sure you want to delete the review by "${reviewerName}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/ims-aspects-impacts/${aspectImpactId}/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onReviewsChange(reviews.filter(r => r.id !== reviewId))
        toast({
          title: "Success",
          description: `Review by "${reviewerName}" deleted successfully`,
        })
      } else {
        throw new Error("Failed to delete review")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reviews</h3>
        <Dialog open={showAddReview} onOpenChange={setShowAddReview}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Reviewer Name</Label>
                <Input 
                  value={newReview.reviewerName}
                  onChange={(e) => setNewReview({...newReview, reviewerName: e.target.value})}
                  placeholder="Enter reviewer name"
                />
              </div>
              <div>
                <Label>Review Details</Label>
                <Textarea 
                  value={newReview.reviewDetails}
                  onChange={(e) => setNewReview({...newReview, reviewDetails: e.target.value})}
                  placeholder="Enter review details"
                  rows={4}
                />
              </div>
              <div>
                <Label>Review Date</Label>
                <Input 
                  type="date"
                  value={newReview.reviewDate}
                  onChange={(e) => setNewReview({...newReview, reviewDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Next Review Date</Label>
                <Input 
                  type="date"
                  value={newReview.nextReviewDate}
                  onChange={(e) => setNewReview({...newReview, nextReviewDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddReview(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddReview}>
                  Add Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Add a review to track progress.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{review.reviewerName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{review.reviewDetails}</p>
              {review.nextReviewDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Next Review: {new Date(review.nextReviewDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
