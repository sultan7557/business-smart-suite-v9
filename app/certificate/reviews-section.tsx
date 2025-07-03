"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteCertificateReview } from "@/app/actions/certificate-actions"
import { AddReviewDialog } from "./add-review-dialog"
import { format } from "date-fns"

interface ReviewsSectionProps {
  certificateId: string
  reviews: {
    success: boolean
    data?: Array<{
      id: string
      details: string
      reviewDate: string
      nextReviewDate: string | null
      reviewerName: string
      reviewedBy: {
        name: string
        email: string
      }
    }>
    error?: string
  }
  canEdit: boolean
}

export function ReviewsSection({ certificateId, reviews, canEdit }: ReviewsSectionProps) {
  const router = useRouter()

  const handleDeleteReview = async (id: string) => {
    try {
      const result = await deleteCertificateReview(id)
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Certificate Reviews</h3>
        <AddReviewDialog certificateId={certificateId} canEdit={canEdit} />
      </div>
      
      {!reviews.data || reviews.data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reviews yet
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.data.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.reviewerName || review.reviewedBy.name}</p>
                  <p className="text-sm text-muted-foreground">{review.reviewedBy.email}</p>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                )}
              </div>
              <p className="text-sm">{review.details}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Review Date:</span>{" "}
                  {format(new Date(review.reviewDate), "PPP")}
                </div>
                {review.nextReviewDate && (
                  <div>
                    <span className="font-medium">Next Review:</span>{" "}
                    {format(new Date(review.nextReviewDate), "PPP")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 