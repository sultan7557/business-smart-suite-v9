"use client"

import AddReviewDialog from "./add-review-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface Review {
  id: string
  reviewerName: string | null
  reviewedBy: {
    name: string
  }
  details: string
  reviewDate: Date
  nextReviewDate: Date | null
}

interface ReviewsSectionProps {
  manualId: string
  reviews: Review[]
  canEdit: boolean
}

export default function ReviewsSection({ manualId, reviews, canEdit }: ReviewsSectionProps) {
  const router = useRouter()

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      const response = await fetch(`/api/manuals/${manualId}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete review")
      }

      toast({
        title: "Success",
        description: "Review deleted successfully",
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4">
      {canEdit && (
        <div className="mb-4">
          <AddReviewDialog manualId={manualId} />
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.reviewerName || review.reviewedBy.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.reviewDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {review.nextReviewDate && (
                    <div className="text-sm text-gray-500">
                      Next review: {new Date(review.nextReviewDate).toLocaleDateString()}
                    </div>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-gray-700">{review.details}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No reviews available for this document.</div>
      )}
    </div>
  )
} 