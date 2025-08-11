import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditManagementReviewPage({ params }: EditPageProps) {
  const resolvedParams = await params
  const managementReviewId = resolvedParams.id

  const canEdit = await hasPermission("write", "management-review")

  if (!canEdit) {
    redirect("/management-reviews")
  }

  const managementReview = await prisma.managementReview.findUnique({
    where: { id: managementReviewId },
    include: {
      category: true,
    },
  })

  if (!managementReview) {
    notFound()
  }

  const categories = await prisma.managementReviewCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  async function updateManagementReview(formData: FormData) {
    "use server"

    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const reviewDate = formData.get("reviewDate") as string
    const nextReviewDate = formData.get("nextReviewDate") as string
    const location = formData.get("location") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !location) {
      throw new Error("All fields are required")
    }

    await prisma.managementReview.update({
      where: { id: managementReviewId },
      data: {
        title,
        categoryId,
        version,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        location,
        content,
        highlighted,
        approved,
        updatedById: user.id as string,
      },
    })

    redirect(`/management-reviews/${managementReviewId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/management-reviews/${managementReviewId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Management Review
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Management Review</CardTitle>
          <CardDescription>Update management review details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateManagementReview} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                defaultValue={managementReview.title}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="w-full p-2 border rounded"
                defaultValue={managementReview.categoryId}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="version" className="text-sm font-medium">
                Version
              </label>
              <input
                id="version"
                name="version"
                className="w-full p-2 border rounded"
                defaultValue={managementReview.version}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="reviewDate" className="text-sm font-medium">
                Review Date
              </label>
              <input
                id="reviewDate"
                name="reviewDate"
                type="date"
                className="w-full p-2 border rounded"
                defaultValue={new Date(managementReview.reviewDate).toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="nextReviewDate" className="text-sm font-medium">
                Next Review Date
              </label>
              <input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                className="w-full p-2 border rounded"
                defaultValue={managementReview.nextReviewDate ? new Date(managementReview.nextReviewDate).toISOString().split("T")[0] : ""}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                name="location"
                className="w-full p-2 border rounded"
                defaultValue={managementReview.location}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={5}
                className="w-full p-2 border rounded"
                defaultValue={managementReview.content || ""}
                placeholder="Enter management review content or description..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={managementReview.highlighted}
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this management review
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="approved"
                name="approved"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={managementReview.approved}
              />
              <label htmlFor="approved" className="text-sm font-medium">
                Mark as approved
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Management Review</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
