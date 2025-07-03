import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import CustomSectionDialog from "@/components/custom-section-dialog"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { moveCustomSectionDocument } from "@/app/actions/custom-section-actions"

export default async function CustomSectionsPage() {
  const user = await getUser()
  if (!user) {
    return notFound()
  }

  const sections = await prisma.customSection.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
        take: 5,
        include: {
          uploadedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  // Get all sections for move dialog
  const allSections = await prisma.customSection.findMany({
    select: {
      id: true,
      title: true,
    },
  })

  const moveDialogSections = [
    {
      id: "custom-sections",
      title: "Custom Sections",
      categories: allSections.map(section => ({
        id: section.id,
        title: section.title,
      })),
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Custom Sections</h1>
        <CustomSectionDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.documents.length > 0 ? (
                <ul className="space-y-4">
                  {section.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/documents/${doc.id}`}>View</Link>
                        </Button>
                        <MoveEntryDialog
                          entryId={doc.id}
                          entryType="document"
                          currentSectionId="custom-sections"
                          currentCategoryId={section.id}
                          sections={moveDialogSections}
                          isLoading={false}
                          onMove={async (newSectionId, newCategoryId) => {
                            await moveCustomSectionDocument(doc.id, newCategoryId)
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No documents yet</p>
                  <Button asChild size="sm">
                    <Link href={`/custom-sections/${section.id}/new-document`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Document
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 