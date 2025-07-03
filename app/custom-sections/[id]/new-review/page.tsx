"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"

interface NewReviewPageProps {
  params: {
    id: string
  }
}

export default function NewReviewPage({ params }: NewReviewPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reviewDate: "",
    nextReviewDate: "",
    details: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/custom-sections/${params.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          reviewDate: new Date(formData.reviewDate).toISOString(),
          nextReviewDate: formData.nextReviewDate
            ? new Date(formData.nextReviewDate).toISOString()
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to schedule review")
      }

      toast.success("Review scheduled successfully")
      router.push(`/custom-sections/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error scheduling review:", error)
      toast.error("Failed to schedule review")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/custom-sections/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Section
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Schedule Review</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input
              id="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={(e) =>
                setFormData({ ...formData, reviewDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
            <Input
              id="nextReviewDate"
              type="date"
              value={formData.nextReviewDate}
              onChange={(e) =>
                setFormData({ ...formData, nextReviewDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Review Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={(e) =>
                setFormData({ ...formData, details: e.target.value })
              }
              placeholder="Enter review details or notes"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader /> : (<><Calendar className="mr-2 h-4 w-4" />Schedule Review</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 