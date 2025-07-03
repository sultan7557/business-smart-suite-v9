import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"

export default async function NewCertificatePage() {
  const categories = await prisma.certificateCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  if (categories.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Categories Available</CardTitle>
            <CardDescription>You need to create a category before adding a certificate.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/certificate">Back to Certificates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function createCertificate(formData: FormData) {
    "use server"

    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const issueDate = formData.get("issueDate") as string
    const location = formData.get("location") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !issueDate || !location) {
      throw new Error("All fields are required")
    }

    // Get the highest order in this category
    const highestOrderCertificate = await prisma.certificate.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = highestOrderCertificate ? highestOrderCertificate.order + 1 : 1

    const certificate = await prisma.certificate.create({
      data: {
        title,
        categoryId,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        highlighted,
        approved,
        createdById: user.id as string,
        order: newOrder,
      },
    })

    redirect(`/certificate/${certificate.id}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/certificate" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Certificate</CardTitle>
          <CardDescription>Create a new certificate document</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCertificate} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                placeholder="Enter certificate title"
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
              <label htmlFor="issueDate" className="text-sm font-medium">
                Issue Date
              </label>
              <input
                id="issueDate"
                name="issueDate"
                type="date"
                className="w-full p-2 border rounded"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
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
                placeholder="e.g. IMS"
                defaultValue="IMS"
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
                placeholder="Enter certificate content or description"
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
                Highlight this certificate
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
              <Button type="submit">Create Certificate</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}