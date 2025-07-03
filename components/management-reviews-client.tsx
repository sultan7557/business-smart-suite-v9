"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, Edit, Check, X, Plus, Archive, RefreshCw, SortAsc, GripVertical } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import {
  toggleHighlight,
  archiveItem,
  unarchiveItem,
  deleteItem,
  reorderManagementReviews,
  addManagementReview,
  addCategory,
  editCategory,
  approveManagementReview,
  disapproveManagementReview,
} from "@/app/actions/management-review-actions"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { SortButtons, type SortType, type SortDirection } from "@/components/ui/sort-buttons"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Spinner } from "@/components/ui/spinner"

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  managementReviews: ManagementReview[]
}

interface ManagementReview {
  id: string
  title: string
  version: string
  reviewDate: string
  location: string
  approved: boolean
  highlighted: boolean
  archived: boolean
  order: number
}

function SortableManagementReview({
  managementReview,
  children,
}: { managementReview: ManagementReview; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: managementReview.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  )
}

function ManagementReviewItem({
  managementReview,
  category,
  canEdit,
  canDelete,
  isArchived,
  sections,
  isLoading,
  onMove,
  onArchive,
  onUnarchive,
  onDelete,
  onApprove,
  onHighlight,
}: {
  managementReview: ManagementReview
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (managementReviewId: string) => void
  onUnarchive: (managementReviewId: string) => void
  onDelete: (managementReviewId: string) => void
  onApprove: (managementReviewId: string) => void
  onHighlight: (managementReviewId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: managementReview.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move management review")
        alert("Failed to move management review. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the management review. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${managementReview.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/management-reviews/${managementReview.id}`} className="text-blue-600 hover:underline">
          {managementReview.title}
        </Link>
        {managementReview.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{managementReview.version}</div>
      <div>{new Date(managementReview.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{managementReview.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={managementReview.id}
                  entryType="management-review"
                  currentSectionId="management-reviews"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(managementReview.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[managementReview.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], archive: true}}));
                  await onUnarchive(managementReview.id);
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive management review ${managementReview.title}`}
              >
                {loading[managementReview.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[managementReview.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], archive: true}}));
                  await onArchive(managementReview.id);
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive management review ${managementReview.title}`}
              >
                {loading[managementReview.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[managementReview.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], delete: true}}));
                  await onDelete(managementReview.id);
                  setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], delete: false}}));
                }}
                aria-label={`Delete management review ${managementReview.title}`}
              >
                {loading[managementReview.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${managementReview.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[managementReview.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], highlight: true}}));
                    await onHighlight(managementReview.id);
                    setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], highlight: false}}));
                  }}
                  aria-label={`${managementReview.highlighted ? "Unhighlight" : "Highlight"} management review ${managementReview.title}`}
                >
                  {loading[managementReview.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${managementReview.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[managementReview.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], approve: true}}));
                    await onApprove(managementReview.id);
                    setLoading(l => ({...l, [managementReview.id]: {...l[managementReview.id], approve: false}}));
                  }}
                  title={managementReview.approved ? "Unapprove" : "Approve"}
                  aria-label={`${managementReview.approved ? "Unapprove" : "Approve"} management review ${managementReview.title}`}
                >
                  {loading[managementReview.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CategorySection({
  category,
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
}: {
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  sections: Section[]
  isLoading: boolean
}) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [managementReviews, setManagementReviews] = useState<ManagementReview[]>(category.managementReviews || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setManagementReviews(category.managementReviews || [])
  }, [category.managementReviews])

  // Sorting logic
  useEffect(() => {
    const sortedManagementReviews = [...managementReviews]
    if (sortType === "name") {
      sortedManagementReviews.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedManagementReviews.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setManagementReviews(sortedManagementReviews)
  }, [sortType, sortDirection])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      // Use the original category.managementReviews array for consistent ordering
      const originalManagementReviews = category.managementReviews || []
      const oldIndex = originalManagementReviews.findIndex((item: ManagementReview) => item.id === active.id)
      const newIndex = originalManagementReviews.findIndex((item: ManagementReview) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find management review indices")
        return
      }

      const newOrder = arrayMove(originalManagementReviews, oldIndex, newIndex)
      setManagementReviews(newOrder)

      try {
        // Call the server action with the reordered IDs
        const managementReviewIds = newOrder.map((item) => item.id)
        const result = await reorderManagementReviews(category.id, managementReviewIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setManagementReviews(category.managementReviews || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder management reviews. Please try again.")
      }
    }
  }

  const handleArchive = async (managementReviewId: string) => {
    try {
      await archiveItem(managementReviewId, "managementReview")
      setManagementReviews((prevManagementReviews) =>
        prevManagementReviews.filter((mr) => mr.id !== managementReviewId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error archiving management review:", error)
    }
  }

  const handleUnarchive = async (managementReviewId: string) => {
    try {
      await unarchiveItem(managementReviewId, "managementReview")
      setManagementReviews((prevManagementReviews) =>
        prevManagementReviews.filter((mr) => mr.id !== managementReviewId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving management review:", error)
    }
  }

  const handleDelete = async (managementReviewId: string) => {
    if (confirm("Are you sure you want to delete this management review? This action cannot be undone.")) {
      try {
        await deleteItem(managementReviewId, "managementReview")
        setManagementReviews((prevManagementReviews) =>
          prevManagementReviews.filter((mr) => mr.id !== managementReviewId),
        )
        router.refresh()
      } catch (error) {
        console.error("Error deleting management review:", error)
      }
    }
  }

  const handleApprove = async (managementReviewId: string) => {
    try {
      const managementReview = managementReviews.find((mr) => mr.id === managementReviewId)
      if (managementReview?.approved) {
        await disapproveManagementReview(managementReviewId)
      } else {
        await approveManagementReview(managementReviewId)
      }
      setManagementReviews((prevManagementReviews) =>
        prevManagementReviews.map((mr) => (mr.id === managementReviewId ? { ...mr, approved: !mr.approved } : mr)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (managementReviewId: string) => {
    try {
      await toggleHighlight(managementReviewId, "managementReview")
      setManagementReviews((prevManagementReviews) =>
        prevManagementReviews.map((mr) =>
          mr.id === managementReviewId ? { ...mr, highlighted: !mr.highlighted } : mr,
        ),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling highlight:", error)
    }
  }

  return (
    <div key={category.id} className="mb-4">
      <div
        className={`${category.highlighted ? "bg-yellow-600" : "bg-[#2d1e3e]"} text-white p-3 flex justify-between items-center rounded-sm cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{category.title}</span>
        {canEdit && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {!isArchived && (
              <>
                <SortButtons
                  sortType={sortType}
                  sortDirection={sortDirection}
                  onSortChange={(type, direction) => {
                    setSortType(type)
                    setSortDirection(direction)
                  }}
                />
                <EditCategoryDialog category={category} />
                <AddManagementReviewDialog
                  categoryId={category.id}
                  onManagementReviewCreated={(newManagementReview) =>
                    setManagementReviews((prevManagementReviews) => [...prevManagementReviews, newManagementReview])
                  }
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[category.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], archive: true}}));
                  await unarchiveItem(category.id, "category");
                  setLoading(l => ({...l, [category.id]: {...l[category.id], archive: false}}));
                  router.refresh();
                }}
                title="Unarchive"
                aria-label={`Unarchive category ${category.title}`}
              >
                {loading[category.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-gray-600 text-white border-none"
                disabled={loading[category.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], archive: true}}));
                  await archiveItem(category.id, "category");
                  setLoading(l => ({...l, [category.id]: {...l[category.id], archive: false}}));
                  router.refresh();
                }}
                title="Archive"
                aria-label={`Archive category ${category.title}`}
              >
                {loading[category.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
                disabled={loading[category.id]?.highlight}
                onClick={async () => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], highlight: true}}));
                  await toggleHighlight(category.id, "category");
                  setLoading(l => ({...l, [category.id]: {...l[category.id], highlight: false}}));
                  router.refresh();
                }}
                aria-label={`${category.highlighted ? "Unhighlight" : "Highlight"} category ${category.title}`}
              >
                {loading[category.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[category.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], delete: true}}));
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its management reviews? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setManagementReviews([]);
                    setLoading(l => ({...l, [category.id]: {...l[category.id], delete: false}}));
                    router.refresh();
                  }
                }}
                title="Delete"
                aria-label={`Delete category ${category.title}`}
              >
                {loading[category.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && managementReviews && managementReviews.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Management Review</div>
            <div>Version</div>
            <div>Review Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={managementReviews.map((mr) => mr.id)} strategy={verticalListSortingStrategy}>
              {managementReviews.map((managementReview: ManagementReview) => (
                <SortableManagementReview key={managementReview.id} managementReview={managementReview}>
                  <ManagementReviewItem
                    managementReview={managementReview}
                    category={category}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    isArchived={isArchived}
                    sections={sections}
                    isLoading={isLoading}
                    onMove={onMove}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onHighlight={handleHighlight}
                  />
                </SortableManagementReview>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function ManagementReviewsClient({
  categories,
  canEdit,
  canDelete,
  showArchived = false,
  currentSort,
}: {
  categories: Category[]
  canEdit: boolean
  canDelete: boolean
  showArchived?: boolean
  currentSort?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/sections")
        if (!response.ok) {
          throw new Error("Failed to fetch sections")
        }
        const data = await response.json()
        setSections(data)
      } catch (error) {
        console.error("Error fetching sections:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSections()
  }, [])

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    if (!newCategoryId) {
      console.error("newCategoryId is required for move operation")
      alert("Invalid move operation: Category ID is required.")
      return false
    }

    try {
      const response = await fetch("/api/entries/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          currentSectionId: "management-reviews",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move management review: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving management review:", error)
      alert("Network error occurred while moving management review. Please check your connection and try again.")
      return false
    }
  }

  const toggleArchived = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (showArchived) {
      params.delete("showArchived")
    } else {
      params.set("showArchived", "true")
    }
    router.push(`/management-reviews?${params.toString()}`)
  }

  const changeSort = (sort: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (currentSort === sort) {
      params.delete("sort")
    } else {
      params.set("sort", sort)
    }
    if (showArchived) {
      params.set("showArchived", "true")
    }
    router.push(`/management-reviews?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Management Reviews</h1>
          {showArchived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived View</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <div className="flex items-center gap-1">
            <Button
              variant={currentSort === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => changeSort("name")}
            >
              <SortAsc className="h-4 w-4 mr-1" />
              Name
            </Button>
            <Button
              variant={currentSort === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => changeSort("date")}
            >
              <SortAsc className="h-4 w-4 mr-1" />
              Date
            </Button>
          </div>

          {/* Archive Toggle */}
          <Button variant="outline" onClick={toggleArchived}>
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>

          {/* Add Category and New Management Review buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/management-reviews/new">Add New</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {categories.length > 0 ? (
        categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            canEdit={canEdit}
            canDelete={canDelete}
            isArchived={showArchived}
            onMove={handleMove}
            sections={sections}
            isLoading={isLoading}
          />
        ))
      ) : (
        <div className="text-center p-8 border rounded-md mt-4">
          <p className="text-gray-500">
            {showArchived
              ? "No archived management reviews found."
              : "No management reviews found. Click 'Add New' to create your first management review."}
          </p>
          {canEdit && !showArchived && (
            <div className="mt-4">
              <AddCategoryDialog />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddCategoryDialog() {
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                await addCategory(title)
                router.refresh()
              } catch (error) {
                console.error("Error adding category:", error)
                alert("Failed to add category. Please try again.")
              }
            } else {
              alert("Category title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" placeholder="Enter category title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({ category }: { category: Category }) {
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-gray-600 text-white border-none">
          <Edit className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                await editCategory(category.id, title)
                router.refresh()
              } catch (error) {
                console.error("Error editing category:", error)
                alert("Failed to edit category. Please try again.")
              }
            } else {
              alert("Category title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" defaultValue={category.title} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddManagementReviewDialog({
  categoryId,
  onManagementReviewCreated,
}: {
  categoryId: string
  onManagementReviewCreated: (managementReview: ManagementReview) => void
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-green-500 text-white border-none">
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Management Review</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const result = await addManagementReview({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  location: "IMS",
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newManagementReview: ManagementReview = {
                    id: result.managementReview?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    location: "IMS",
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onManagementReviewCreated(newManagementReview)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add management review")
                }
              } catch (error) {
                console.error("Error adding management review:", error)
                alert("Failed to add management review. Please try again.")
              }
            } else {
              alert("Management review title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Management Review Title</Label>
              <Input id="title" name="title" placeholder="Enter management review title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Management Review</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
