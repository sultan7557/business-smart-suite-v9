import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default async function NewTechnicalFilePage() {
  const canEdit = await hasPermission("write")
  if (!canEdit) {
    notFound()
  }

  const categories = await prisma.technicalFileCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  if (categories.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Categories Available</CardTitle>
            <CardDescription>You need to create a category before adding a Technical File.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/technical-file">Back to Technical Files</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function createTechnicalFile(formData: FormData) {
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
    const highestOrderTechnicalFile = await prisma.technicalFile.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderTechnicalFile ? highestOrderTechnicalFile.order + 1 : 1

    const technicalFile = await prisma.technicalFile.create({
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

    redirect(`/technical-file/${technicalFile.id}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/technical-file" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technical Files
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Technical File</CardTitle>
          <CardDescription>Create a new Technical File document</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTechnicalFile} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="Enter Technical File title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Issue Level</Label>
                <Input id="version" name="version" placeholder="Enter issue level" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewDate">Issue Date</Label>
                <Input
                  id="reviewDate"
                  name="reviewDate"
                  type="date"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Location</Label>
                <Input id="department" name="department" placeholder="Enter Location" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  name="content"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter Technical File content..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this Technical File
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
              <Button type="submit">Create Technical File</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
