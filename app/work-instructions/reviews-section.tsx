"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { deleteWorkInstructionReview } from "@/app/actions/work-instruction-actions"
import { toast } from "@/components/ui/use-toast"

interface Review {
  id: string
  details: string
  reviewDate: string
  nextReviewDate?: string
  reviewerName?: string
  reviewedBy?: {
    name: string
  }
}

interface ReviewsSectionProps {
  workInstructionId: string
  reviews: Review[]
  canEdit: boolean
}

export default function ReviewsSection({ workInstructionId, reviews, canEdit }: ReviewsSectionProps) {
  const [localReviews, setLocalReviews] = useState(reviews)

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const result = await deleteWorkInstructionReview(reviewId)
      if (result.success) {
        setLocalReviews(localReviews.filter((review) => review.id !== reviewId))
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete review",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reviews</h2>
      {localReviews.length > 0 ? (
        localReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    Review by {review.reviewerName || review.reviewedBy?.name || "Unknown"}
                  </CardTitle>
                  <CardDescription>
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteReview(review.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.details}</p>
              {review.nextReviewDate && (
                <p className="mt-2 text-sm text-gray-500">
                  Next review due: {new Date(review.nextReviewDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  )
}
