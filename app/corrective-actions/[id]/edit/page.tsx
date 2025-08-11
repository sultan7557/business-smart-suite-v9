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

export default async function EditCorrectiveActionPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const correctiveActionId = resolvedParams.id;
  
  const canEdit = await hasPermission("write", "corrective-actions")

  if (!canEdit) {
    redirect("/corrective-actions")
  }

  const correctiveAction = await prisma.correctiveAction.findUnique({
    where: { id: correctiveActionId },
    include: {
      category: true,
    },
  })

  if (!correctiveAction) {
    notFound()
  }

  const categories = await prisma.correctiveActionCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  async function updateCorrectiveAction(formData: FormData) {
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

    await prisma.correctiveAction.update({
      where: { id: correctiveActionId },
      data: {
        title,
        category: {
          connect: { id: categoryId }
        },
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        highlighted,
        approved,
        updatedBy: {
          connect: { id: user.id }
        }
      },
    })

    redirect(`/corrective-actions/${correctiveActionId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/corrective-actions/${correctiveActionId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Corrective Action
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Corrective Action</CardTitle>
          <CardDescription>Update corrective action details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCorrectiveAction} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                defaultValue={correctiveAction.title}
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
                defaultValue={correctiveAction.categoryId}
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
                defaultValue={correctiveAction.version}
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
                defaultValue={new Date(correctiveAction.issueDate).toISOString().split("T")[0]}
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
                defaultValue={correctiveAction.location}
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
                defaultValue={correctiveAction.content || ""}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={correctiveAction.highlighted}
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this corrective action
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="approved"
                name="approved"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={correctiveAction.approved}
              />
              <label htmlFor="approved" className="text-sm font-medium">
                Mark as approved
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Corrective Action</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
