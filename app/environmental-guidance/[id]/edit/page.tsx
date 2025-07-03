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

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEnvironmentalGuidancePage({ params }: EditPageProps) {
  const resolvedParams = await params
  const environmentalGuidanceId = resolvedParams.id

  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/environmental-guidance")
  }

  const environmentalGuidance = await prisma.environmentalGuidance.findUnique({
    where: { id: environmentalGuidanceId },
    include: {
      category: true,
    },
  })

  if (!environmentalGuidance) {
    notFound()
  }

  const categories = await prisma.environmentalGuidanceCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  async function updateEnvironmentalGuidance(formData: FormData) {
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

    await prisma.environmentalGuidance.update({
      where: { id: environmentalGuidanceId },
      data: {
        title,
        categoryId,
        version,
        reviewDate: new Date(reviewDate),
        nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
        department,
        content,
        highlighted,
        approved,
        updatedById: user.id,
      },
    })

    redirect(`/environmental-guidance/${environmentalGuidanceId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/environmental-guidance/${environmentalGuidanceId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Environmental Guidance
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Environmental Guidance</CardTitle>
          <CardDescription>Update Environmental Guidance details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateEnvironmentalGuidance} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={environmentalGuidance.title} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Issue Level</Label>
                <Input id="version" name="version" defaultValue={environmentalGuidance.version} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewDate">Issue Date</Label>
                <Input
                  id="reviewDate"
                  name="reviewDate"
                  type="date"
                  defaultValue={new Date(environmentalGuidance.reviewDate).toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Location</Label>
                <Input id="department" name="department" defaultValue={environmentalGuidance.department} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={environmentalGuidance.categoryId}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  name="content"
                  defaultValue={environmentalGuidance.content || ""}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={environmentalGuidance.highlighted}
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this Environmental Guidance
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="approved"
                name="approved"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={environmentalGuidance.approved}
              />
              <label htmlFor="approved" className="text-sm font-medium">
                Mark as approved
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Environmental Guidance</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 