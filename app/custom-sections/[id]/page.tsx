import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, User, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { DeleteCustomSectionButton } from "./delete-button"
import { DeleteItemButton } from "./delete-item-button"
import { CustomSectionMoveDialog } from "@/components/custom-section-move-dialog"
import { getAllSections } from "@/lib/sections"

interface CustomSectionPageProps {
  params: {
    id: string
  }
}

interface Document {
  id: string
  title: string
  uploadedAt: Date
  uploadedBy: {
    name: string
    email: string | null
  }
}

interface Version {
  id: string
  version: string
  issueDate: Date
  createdBy: {
    name: string
    email: string | null
  }
}

interface Review {
  id: string
  reviewDate: Date
  nextReviewDate: Date | null
  details: string
  reviewedBy: {
    name: string
    email: string | null
  }
}

export default async function CustomSectionPage({ params }: CustomSectionPageProps) {
  const { id } = await params
  const user = await getUser()
  if (!user) {
    return notFound()
  }

  const section = await prisma.customSection.findUnique({
    where: { id },
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
      versions: {
        orderBy: { issueDate: "desc" },
        take: 5,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      reviews: {
        orderBy: { reviewDate: "desc" },
        take: 5,
        include: {
          reviewedBy: {
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
      updatedBy: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!section) {
    return notFound()
  }

  // Get all sections including custom sections
  const allSections = await getAllSections()
  
  // Add custom sections to the sections list
  const customSections = await prisma.customSection.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
    },
  })

  const sections = [
    ...allSections,
    {
      id: "custom-sections",
      title: "Custom Sections",
      categories: customSections.map(section => ({
        id: section.id,
        title: section.title,
      })),
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{section.title}</h1>
          {section.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">{section.description}</p>
          )}
        </div>
        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/custom-sections/${section.id}/new-document`}>
              <FileText className="mr-2 h-4 w-4" />
              New Document
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/custom-sections/${section.id}/new-version`}>
              <Clock className="mr-2 h-4 w-4" />
              New Version
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/custom-sections/${section.id}/new-review`}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Schedule Review
            </Link>
          </Button>
          <DeleteCustomSectionButton sectionId={section.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
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
                        {format(doc.uploadedAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/api/documents/download/${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">Preview</a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/api/documents/download/${doc.fileUrl}`} download target="_blank" rel="noopener noreferrer">Download</a>
                      </Button>
                      <CustomSectionMoveDialog
                        entryId={doc.id}
                        entryType="document"
                        currentSectionId="custom-sections"
                        currentCategoryId={section.id}
                        sections={sections}
                      />
                      <DeleteItemButton
                        itemId={doc.id}
                        itemType="document"
                        sectionId={section.id}
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.versions.length > 0 ? (
              <ul className="space-y-4">
                {section.versions.map((version) => (
                  <li key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Version {version.version}</p>
                      <p className="text-sm text-gray-500">
                        {format(version.issueDate, "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500">
                        by {version.createdBy.name}
                      </p>
                      <DeleteItemButton
                        itemId={version.id}
                        itemType="version"
                        sectionId={section.id}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No versions yet</p>
                <Button asChild size="sm">
                  <Link href={`/custom-sections/${section.id}/new-version`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Version
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Review History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.reviews.length > 0 ? (
              <ul className="space-y-4">
                {section.reviews.map((review) => (
                  <li key={review.id} className="flex flex-col gap-2 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Review on {format(review.reviewDate, "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500">
                          Next review:{" "}
                          {review.nextReviewDate
                            ? format(review.nextReviewDate, "MMM d, yyyy")
                            : "Not scheduled"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          by {review.reviewedBy.name}
                        </p>
                        <DeleteItemButton
                          itemId={review.id}
                          itemType="review"
                          sectionId={section.id}
                        />
                      </div>
                    </div>
                    {review.details && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {review.details}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">No reviews yet</p>
                <Button asChild size="sm">
                  <Link href={`/custom-sections/${section.id}/new-review`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Review
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Section Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Version</dt>
                <dd className="mt-1 text-sm text-gray-900">{section.version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Issue Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(section.issueDate), "MMMM d, yyyy")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Department</dt>
                <dd className="mt-1 text-sm text-gray-900">{section.department || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">{section.createdBy.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(new Date(section.updatedAt), "MMMM d, yyyy")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {section.isActive ? "Active" : "Inactive"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 