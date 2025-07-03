


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
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  toggleHighlight,
  archiveItem,
  unarchiveItem,
  deleteItem,
  reorderEnvironmentalGuidances,
  addEnvironmentalGuidance,
  addCategory,
  editCategory,
  approveEnvironmentalGuidance,
  disapproveEnvironmentalGuidance,
} from "@/app/actions/environmental-guidance-actions"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { SortButtons, type SortType, type SortDirection } from "@/components/ui/sort-buttons"

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  environmentalGuidances: EnvironmentalGuidanceItem[]
}

interface EnvironmentalGuidanceItem {
  id: string
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  department: string // This stores the location
  highlighted: boolean
  approved: boolean
  archived: boolean
  order: number
}

function SortableEnvironmentalGuidance({
  environmentalGuidance,
  children,
}: { environmentalGuidance: EnvironmentalGuidanceItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: environmentalGuidance.id })

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

function EnvironmentalGuidanceItem({
  environmentalGuidance,
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
  environmentalGuidance: EnvironmentalGuidanceItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (environmentalGuidanceId: string) => void
  onUnarchive: (environmentalGuidanceId: string) => void
  onDelete: (environmentalGuidanceId: string) => void
  onApprove: (environmentalGuidanceId: string) => void
  onHighlight: (environmentalGuidanceId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: environmentalGuidance.id })

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move environmental guidance")
        alert("Failed to move environmental guidance. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the environmental guidance. Please try again.")
      return false
    }
  }

  return (
    <div
      className={`grid grid-cols-4 p-2 border-b items-center ${environmentalGuidance.highlighted ? "bg-yellow-50" : ""}`}
    >
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/environmental-guidance/${environmentalGuidance.id}`} className="text-blue-600 hover:underline">
          {environmentalGuidance.title}
        </Link>
        {environmentalGuidance.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{environmentalGuidance.version}</div>
      <div>{new Date(environmentalGuidance.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{environmentalGuidance.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={environmentalGuidance.id}
                  entryType="environmental-guidance"
                  currentSectionId="environmental-guidance"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) =>
                    handleMove(environmentalGuidance.id, newSectionId, newCategoryId)
                  }
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={() => onUnarchive(environmentalGuidance.id)}
                title="Unarchive"
                aria-label={`Unarchive environmental guidance ${environmentalGuidance.title}`}
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onArchive(environmentalGuidance.id)}
                title="Archive"
                aria-label={`Archive environmental guidance ${environmentalGuidance.title}`}
              >
                <Archive className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={() => onDelete(environmentalGuidance.id)}
                aria-label={`Delete environmental guidance ${environmentalGuidance.title}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${environmentalGuidance.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  onClick={() => onHighlight(environmentalGuidance.id)}
                  aria-label={`${environmentalGuidance.highlighted ? "Unhighlight" : "Highlight"} environmental guidance ${environmentalGuidance.title}`}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${environmentalGuidance.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  onClick={() => onApprove(environmentalGuidance.id)}
                  title={environmentalGuidance.approved ? "Unapprove" : "Approve"}
                  aria-label={`${environmentalGuidance.approved ? "Unapprove" : "Approve"} environmental guidance ${environmentalGuidance.title}`}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
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
  const [environmentalGuidances, setEnvironmentalGuidances] = useState<EnvironmentalGuidanceItem[]>(
    category.environmentalGuidances || [],
  )

  useEffect(() => {
    setEnvironmentalGuidances(category.environmentalGuidances || [])
  }, [category.environmentalGuidances])

  // Sorting logic
  useEffect(() => {
    if (sortType === "name" || sortType === "date") {
      const sortedEnvironmentalGuidances = [...(category.environmentalGuidances || [])]
      if (sortType === "name") {
        sortedEnvironmentalGuidances.sort((a, b) => {
          const cmp = a.title.localeCompare(b.title)
          return sortDirection === "asc" ? cmp : -cmp
        })
      } else if (sortType === "date") {
        sortedEnvironmentalGuidances.sort((a, b) => {
          const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
          return sortDirection === "asc" ? cmp : -cmp
        })
      }
      setEnvironmentalGuidances(sortedEnvironmentalGuidances)
    } else {
      // Default order by database order
      setEnvironmentalGuidances([...(category.environmentalGuidances || [])].sort((a, b) => a.order - b.order))
    }
  }, [sortType, sortDirection, category.environmentalGuidances])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = environmentalGuidances.findIndex((item) => item.id === active.id)
      const newIndex = environmentalGuidances.findIndex((item) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find environmental guidance indices")
        return
      }

      const newOrder = arrayMove(environmentalGuidances, oldIndex, newIndex)
      setEnvironmentalGuidances(newOrder)

      try {
        // Call the server action with the reordered IDs
        const environmentalGuidanceIds = newOrder.map((item) => item.id)
        const result = await reorderEnvironmentalGuidances(category.id, environmentalGuidanceIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setEnvironmentalGuidances(category.environmentalGuidances || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder environmental guidances. Please try again.")
      }
    }
  }

  const handleArchive = async (environmentalGuidanceId: string) => {
    try {
      const result = await archiveItem(environmentalGuidanceId, "environmentalGuidance")
      if (result.success) {
        setEnvironmentalGuidances((prevEnvironmentalGuidances) =>
          prevEnvironmentalGuidances.filter((eg) => eg.id !== environmentalGuidanceId),
        )
        router.refresh()
      }
    } catch (error) {
      console.error("Error archiving environmental guidance:", error)
    }
  }

  const handleUnarchive = async (environmentalGuidanceId: string) => {
    try {
      const result = await unarchiveItem(environmentalGuidanceId, "environmentalGuidance")
      if (result.success) {
        setEnvironmentalGuidances((prevEnvironmentalGuidances) =>
          prevEnvironmentalGuidances.filter((eg) => eg.id !== environmentalGuidanceId),
        )
        router.refresh()
      }
    } catch (error) {
      console.error("Error unarchiving environmental guidance:", error)
    }
  }

  const handleDelete = async (environmentalGuidanceId: string) => {
    if (confirm("Are you sure you want to delete this environmental guidance? This action cannot be undone.")) {
      try {
        const result = await deleteItem(environmentalGuidanceId, "environmentalGuidance")
        if (result.success) {
          setEnvironmentalGuidances((prevEnvironmentalGuidances) =>
            prevEnvironmentalGuidances.filter((eg) => eg.id !== environmentalGuidanceId),
          )
          router.refresh()
        }
      } catch (error) {
        console.error("Error deleting environmental guidance:", error)
      }
    }
  }

  const handleApprove = async (environmentalGuidanceId: string) => {
    try {
      const environmentalGuidance = environmentalGuidances.find((eg) => eg.id === environmentalGuidanceId)
      let result
      if (environmentalGuidance?.approved) {
        result = await disapproveEnvironmentalGuidance(environmentalGuidanceId)
      } else {
        result = await approveEnvironmentalGuidance(environmentalGuidanceId)
      }

      if (result.success) {
        setEnvironmentalGuidances((prevEnvironmentalGuidances) =>
          prevEnvironmentalGuidances.map((eg) =>
            eg.id === environmentalGuidanceId ? { ...eg, approved: !eg.approved } : eg,
          ),
        )
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (environmentalGuidanceId: string) => {
    try {
      const result = await toggleHighlight(environmentalGuidanceId, "environmentalGuidance")
      if (result.success) {
        setEnvironmentalGuidances((prevEnvironmentalGuidances) =>
          prevEnvironmentalGuidances.map((eg) =>
            eg.id === environmentalGuidanceId ? { ...eg, highlighted: !eg.highlighted } : eg,
          ),
        )
        router.refresh()
      }
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
                <AddEnvironmentalGuidanceDialog
                  categoryId={category.id}
                  onEnvironmentalGuidanceCreated={(newEnvironmentalGuidance) =>
                    setEnvironmentalGuidances((prevEnvironmentalGuidances) => [
                      ...prevEnvironmentalGuidances,
                      newEnvironmentalGuidance,
                    ])
                  }
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={async () => {
                  const result = await unarchiveItem(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
                }}
                title="Unarchive"
                aria-label={`Unarchive category ${category.title}`}
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-gray-600 text-white border-none"
                onClick={async () => {
                  const result = await archiveItem(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
                }}
                title="Archive"
                aria-label={`Archive category ${category.title}`}
              >
                <Archive className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}

            {!isArchived && (
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
                onClick={async () => {
                  const result = await toggleHighlight(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
                }}
                aria-label={`${category.highlighted ? "Unhighlight" : "Highlight"} category ${category.title}`}
              >
                <div className="h-3 w-3 bg-yellow-500"></div>
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its environmental guidances? This action cannot be undone.",
                    )
                  ) {
                    const result = await deleteItem(category.id, "category")
                    if (result.success) {
                      router.refresh()
                    }
                  }
                }}
                title="Delete"
                aria-label={`Delete category ${category.title}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && environmentalGuidances && environmentalGuidances.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Environmental Guidance</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={environmentalGuidances.map((eg) => eg.id)} strategy={verticalListSortingStrategy}>
              {environmentalGuidances.map((environmentalGuidance: EnvironmentalGuidanceItem) => (
                <SortableEnvironmentalGuidance
                  key={environmentalGuidance.id}
                  environmentalGuidance={environmentalGuidance}
                >
                  <EnvironmentalGuidanceItem
                    environmentalGuidance={environmentalGuidance}
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
                </SortableEnvironmentalGuidance>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function EnvironmentalGuidanceClient({
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
          currentSectionId: "environmental-guidance",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move environmental guidance: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving environmental guidance:", error)
      alert("Network error occurred while moving environmental guidance. Please check your connection and try again.")
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
    router.push(`/environmental-guidance?${params.toString()}`)
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
    router.push(`/environmental-guidance?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Environmental Guidance</h1>
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

          {/* Add Category and New Environmental Guidance buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/environmental-guidance/new">Add New</Link>
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
              ? "No archived environmental guidances found."
              : "No environmental guidances found. Click 'Add New' to create your first environmental guidance."}
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
                const result = await addCategory(title)
                if (result.success) {
                  router.refresh()
                }
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
                const result = await editCategory(category.id, title)
                if (result.success) {
                  router.refresh()
                }
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

function AddEnvironmentalGuidanceDialog({
  categoryId,
  onEnvironmentalGuidanceCreated,
}: {
  categoryId: string
  onEnvironmentalGuidanceCreated: (environmentalGuidance: EnvironmentalGuidanceItem) => void
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
          <DialogTitle>Add New Environmental Guidance</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            const location = formData.get("location") as string
            if (title && location) {
              try {
                const result = await addEnvironmentalGuidance({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  location,
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newEnvironmentalGuidance: EnvironmentalGuidanceItem = {
                    id: result.environmentalGuidance?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    department: location, // Store location in department field
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onEnvironmentalGuidanceCreated(newEnvironmentalGuidance)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add environmental guidance")
                }
              } catch (error) {
                console.error("Error adding environmental guidance:", error)
                alert("Failed to add environmental guidance. Please try again.")
              }
            } else {
              alert("Environmental guidance title and location are required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Environmental Guidance Title</Label>
              <Input id="title" name="title" placeholder="Enter environmental guidance title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Enter location" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Environmental Guidance</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

