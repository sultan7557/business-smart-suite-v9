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
  params: {
    id: string
  }
}

export default async function EditManualPage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const manualId = resolvedParams.id;
  
  const canEdit = await hasPermission("write")

  if (!canEdit) {
    redirect("/manual")
  }

  const manual = await prisma.manual.findUnique({
    where: { id: manualId },
    include: {
      category: true,
    },
  })

  if (!manual) {
    notFound()
  }

  const categories = await prisma.manualCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  async function updateManual(formData: FormData) {
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

    if (!title || !categoryId || !version || !issueDate || !location) {
      throw new Error("All fields are required")
    }

    await prisma.manual.update({
      where: { id: manualId },
      data: {
        title,
        categoryId,
        version,
        issueDate: new Date(issueDate),
        location,
        updatedById: user.id as string,
      },
    })

    redirect(`/manual/${manualId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/manual/${manualId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manual
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Manual</CardTitle>
          <CardDescription>Update manual details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateManual} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                defaultValue={manual.title}
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
                defaultValue={manual.categoryId}
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
                defaultValue={manual.version}
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
                defaultValue={new Date(manual.issueDate).toISOString().split("T")[0]}
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
                defaultValue={manual.location}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Manual</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
