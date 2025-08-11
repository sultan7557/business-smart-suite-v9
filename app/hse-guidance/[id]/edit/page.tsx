import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditHseGuidancePage({ params }: EditPageProps) {
  const resolvedParams = await params
  const hseGuidanceId = resolvedParams.id

  const hseGuidance = await prisma.hseGuidance.findUnique({
    where: { id: hseGuidanceId },
    include: {
      category: true,
    },
  })

  if (!hseGuidance) {
    notFound()
  }

  const canEdit = await hasPermission("write", "hse-guidance")
  if (!canEdit) {
    redirect("/hse-guidance")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/hse-guidance/${hseGuidanceId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to HSE Guidance
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit HSE Guidance</CardTitle>
          <CardDescription>
            Category: {hseGuidance.category.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData: FormData) => {
            "use server"
            const title = formData.get("title") as string
            const version = formData.get("version") as string
            const reviewDate = formData.get("reviewDate") as string
            const nextReviewDate = formData.get("nextReviewDate") as string
            const department = formData.get("department") as string
            const content = formData.get("content") as string

            if (!title || !version || !reviewDate || !department) {
              throw new Error("Required fields are missing")
            }

            const user = await getUser()
            if (!user) {
              throw new Error("Unauthorized")
            }

            const updatedHseGuidance = await prisma.hseGuidance.update({
              where: { id: hseGuidanceId },
              data: {
                title,
                version,
                reviewDate: new Date(reviewDate),
                nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : null,
                department,
                content,
                updatedById: user.id,
              },
            })

            redirect(`/hse-guidance/${hseGuidanceId}`)
          }}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={hseGuidance.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  defaultValue={hseGuidance.version}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewDate">Review Date</Label>
                <Input
                  id="reviewDate"
                  name="reviewDate"
                  type="date"
                  defaultValue={new Date(hseGuidance.reviewDate).toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextReviewDate">Next Review Date</Label>
                <Input
                  id="nextReviewDate"
                  name="nextReviewDate"
                  type="date"
                  defaultValue={hseGuidance.nextReviewDate ? new Date(hseGuidance.nextReviewDate).toISOString().split("T")[0] : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Location</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={hseGuidance.department}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={hseGuidance.content || ""}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/hse-guidance/${hseGuidanceId}`}>
                    Cancel
                  </Link>
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
