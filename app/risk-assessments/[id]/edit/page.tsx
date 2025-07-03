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

export default async function EditRiskAssessmentPage({ params }: EditPageProps) {
  const resolvedParams = await params
  const riskAssessmentId = resolvedParams.id

  const riskAssessment = await prisma.riskAssessment.findUnique({
    where: { id: riskAssessmentId },
    include: {
      category: true,
    },
  })

  if (!riskAssessment) {
    notFound()
  }

  const canEdit = await hasPermission("write")
  if (!canEdit) {
    redirect("/risk-assessments")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/risk-assessments/${riskAssessmentId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risk Assessment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Risk Assessment</CardTitle>
          <CardDescription>
            Category: {riskAssessment.category.title}
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

            const updatedRiskAssessment = await prisma.riskAssessment.update({
              where: { id: riskAssessmentId },
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

            redirect(`/risk-assessments/${riskAssessmentId}`)
          }}>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={riskAssessment.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  defaultValue={riskAssessment.version}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reviewDate">Review Date</Label>
                <Input
                  id="reviewDate"
                  name="reviewDate"
                  type="date"
                  defaultValue={new Date(riskAssessment.reviewDate).toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nextReviewDate">Next Review Date</Label>
                <Input
                  id="nextReviewDate"
                  name="nextReviewDate"
                  type="date"
                  defaultValue={riskAssessment.nextReviewDate ? new Date(riskAssessment.nextReviewDate).toISOString().split("T")[0] : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  defaultValue={riskAssessment.department}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={riskAssessment.content || ""}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/risk-assessments/${riskAssessmentId}`}>
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
