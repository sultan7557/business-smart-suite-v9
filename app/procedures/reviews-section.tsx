"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteProcedureReview } from "@/app/actions/procedure-actions"
import { useRouter } from "next/navigation"

interface Review {
  id: string
  details: string
  reviewDate: string
  nextReviewDate: string | null
  reviewerName: string | null
  reviewedBy: {
    name: string
    email: string
  }
}

interface ReviewsSectionProps {
  reviews: Review[]
  canEdit: boolean
}

export function ReviewsSection({ reviews, canEdit }: ReviewsSectionProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      const result = await deleteProcedureReview(id)
      if (result.success) {
        toast.success("Review deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete review")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the review")
    } finally {
      setIsDeleting(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No reviews available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Review by {review.reviewerName || review.reviewedBy.name}
            </CardTitle>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(review.id)}
                disabled={isDeleting === review.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">{review.details}</p>
              <div className="text-xs text-muted-foreground">
                <p>Review Date: {format(new Date(review.reviewDate), "PPP")}</p>
                {review.nextReviewDate && (
                  <p>Next Review: {format(new Date(review.nextReviewDate), "PPP")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 