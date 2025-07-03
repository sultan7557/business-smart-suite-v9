import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"

export default async function NewJobDescriptionPage() {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const categories = await prisma.jobDescriptionCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  if (categories.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Categories Available</CardTitle>
            <CardDescription>You need to create a category before adding a job description.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/job-descriptions">Back to Job Descriptions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function createJobDescription(formData: FormData) {
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
    const department = formData.get("department") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !reviewDate || !department) {
      throw new Error("All fields are required")
    }

    // Validate date format
    const parsedDate = new Date(reviewDate)
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format")
    }

    // Get the highest order in this category
    const highestOrderJobDescription = await prisma.jobDescription.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderJobDescription ? highestOrderJobDescription.order + 1 : 1

    const jobDescription = await prisma.jobDescription.create({
      data: {
        title,
        categoryId,
        version,
        reviewDate: parsedDate,
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content: content || "",
        highlighted,
        approved,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    redirect(`/job-descriptions/${jobDescription.id}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/job-descriptions" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Descriptions
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Job Description</CardTitle>
          <CardDescription>Create a new job description document</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createJobDescription} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                placeholder="Enter job description title"
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Category
              </label>
              <select id="categoryId" name="categoryId" className="w-full p-2 border rounded" required>
                <option value="">Select a category</option>
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
                placeholder="e.g. 1.0"
                defaultValue="1.0"
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
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="nextReviewDate" className="text-sm font-medium">
                Next Review Date (Optional)
              </label>
              <input
                id="nextReviewDate"
                name="nextReviewDate"
                type="date"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <input
                id="department"
                name="department"
                className="w-full p-2 border rounded"
                placeholder="e.g. IT"
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
                placeholder="Enter job description content"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this job description
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="approved"
                name="approved"
                type="checkbox"
                className="w-4 h-4"
              />
              <label htmlFor="approved" className="text-sm font-medium">
                Mark as approved
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Create Job Description</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
