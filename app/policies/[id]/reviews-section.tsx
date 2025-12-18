"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { getPolicyReviews, deletePolicyReview } from "@/app/actions/policy-actions"
import { AddReviewDialog } from "./add-review-dialog"
import { toast } from "@/components/ui/use-toast"

interface ReviewsSectionProps {
  policyId: string
  canEdit: boolean
}

export default function ReviewsSection({ policyId, canEdit }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const loadReviews = async () => {
    try {
      const result = await getPolicyReviews(policyId)
      if (result.success) {
        setReviews(result.data || [])
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [policyId])

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      const result = await deletePolicyReview(reviewId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
        loadReviews()
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

  if (loading) {
    return <div>Loading reviews...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>Review history for this policy document</CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewDate = review.reviewDate ? new Date(review.reviewDate) : null
              const nextReviewDate = review.nextReviewDate ? new Date(review.nextReviewDate) : null
              
              return (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{review.reviewerName || review.reviewedBy?.name || "Unknown Reviewer"}</p>
                      {reviewDate && (
                        <p className="text-sm text-gray-500">
                          {format(reviewDate, "PPP")}
                        </p>
                      )}
                    </div>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm">{review.details}</p>
                  {nextReviewDate && (
                    <p className="mt-2 text-sm text-gray-500">
                      Next review: {format(nextReviewDate, "PPP")}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <AddReviewDialog
        policyId={policyId}
        open={showAddDialog}
        onOpenChange={(open: boolean) => {
          setShowAddDialog(open)
          if (!open) {
            // Refresh reviews when dialog is closed
            loadReviews()
          }
        }}
      />
    </Card>
  )
}

