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
  reorderItem,
  addCorrectiveAction,
  addCategory,
  editCategory,
  approveCorrectiveAction,
} from "@/app/actions/corrective-action-actions"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Loader } from "@/components/ui/loader"

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  correctiveActions: CorrectiveAction[]
}

interface CorrectiveAction {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  approved: boolean
  highlighted: boolean
}

function SortableCorrectiveAction({
  correctiveAction,
  children,
}: { correctiveAction: CorrectiveAction; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: correctiveAction.id })

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

function CorrectiveActionItem({
  correctiveAction,
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
  correctiveAction: CorrectiveAction
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (correctiveActionId: string) => void
  onUnarchive: (correctiveActionId: string) => void
  onDelete: (correctiveActionId: string) => void
  onApprove: (correctiveActionId: string) => void
  onHighlight: (correctiveActionId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: correctiveAction.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move corrective action")
        alert("Failed to move corrective action. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the corrective action. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${correctiveAction.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/corrective-actions/${correctiveAction.id}`} className="text-blue-600 hover:underline">
          {correctiveAction.title}
        </Link>
        {correctiveAction.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{correctiveAction.version}</div>
      <div>{new Date(correctiveAction.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{correctiveAction.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={correctiveAction.id}
                  entryType="corrective-action"
                  currentSectionId="corrective-actions"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(correctiveAction.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[correctiveAction.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], archive: true}}));
                  await onUnarchive(correctiveAction.id);
                  setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive corrective action ${correctiveAction.title}`}
              >
                {loading[correctiveAction.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[correctiveAction.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], archive: true}}));
                  await onArchive(correctiveAction.id);
                  setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive corrective action ${correctiveAction.title}`}
              >
                {loading[correctiveAction.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[correctiveAction.id]?.delete}
                onClick={() => {
                  setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], delete: true}}));
                  onDelete(correctiveAction.id);
                }}
                aria-label={`Delete corrective action ${correctiveAction.title}`}
              >
                {loading[correctiveAction.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${correctiveAction.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[correctiveAction.id]?.highlight}
                  onClick={() => {
                    setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], highlight: true}}));
                    onHighlight(correctiveAction.id);
                  }}
                  aria-label={`${correctiveAction.highlighted ? "Unhighlight" : "Highlight"} corrective action ${correctiveAction.title}`}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${correctiveAction.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[correctiveAction.id]?.approve}
                  onClick={() => {
                    setLoading(l => ({...l, [correctiveAction.id]: {...l[correctiveAction.id], approve: true}}));
                    onApprove(correctiveAction.id);
                  }}
                  title={correctiveAction.approved ? "Unapprove" : "Approve"}
                  aria-label={`${correctiveAction.approved ? "Unapprove" : "Approve"} corrective action ${correctiveAction.title}`}
                >
                  {loading[correctiveAction.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(category.correctiveActions || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setCorrectiveActions(category.correctiveActions || [])
  }, [category.correctiveActions])

  // Sorting logic
  useEffect(() => {
    const sortedCorrectiveActions = [...correctiveActions]
    if (sortType === "name") {
      sortedCorrectiveActions.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedCorrectiveActions.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setCorrectiveActions(sortedCorrectiveActions)
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
      // Use the original category.correctiveActions array for consistent ordering
      const originalCorrectiveActions = category.correctiveActions || []
      const oldIndex = originalCorrectiveActions.findIndex((item: CorrectiveAction) => item.id === active.id)
      const newIndex = originalCorrectiveActions.findIndex((item: CorrectiveAction) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find corrective action indices")
        return
      }

      const newOrder = arrayMove(originalCorrectiveActions, oldIndex, newIndex)
      setCorrectiveActions(newOrder)

      try {
        // Call the server action with the new position
        const result = await reorderItem(active.id, "correctiveAction", newIndex)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setCorrectiveActions(category.correctiveActions || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder corrective actions. Please try again.")
      }
    }
  }

  const handleArchive = async (correctiveActionId: string) => {
    try {
      await archiveItem(correctiveActionId, "correctiveAction")
      setCorrectiveActions((prevCorrectiveActions) =>
        prevCorrectiveActions.filter((ca) => ca.id !== correctiveActionId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error archiving corrective action:", error)
    }
  }

  const handleUnarchive = async (correctiveActionId: string) => {
    try {
      await unarchiveItem(correctiveActionId, "correctiveAction")
      setCorrectiveActions((prevCorrectiveActions) =>
        prevCorrectiveActions.filter((ca) => ca.id !== correctiveActionId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving corrective action:", error)
    }
  }

  const handleDelete = async (correctiveActionId: string) => {
    if (confirm("Are you sure you want to delete this corrective action? This action cannot be undone.")) {
      try {
        await deleteItem(correctiveActionId, "correctiveAction")
        setCorrectiveActions((prevCorrectiveActions) =>
          prevCorrectiveActions.filter((ca) => ca.id !== correctiveActionId),
        )
        router.refresh()
      } catch (error) {
        console.error("Error deleting corrective action:", error)
      }
    }
  }

  const handleApprove = async (correctiveActionId: string) => {
    try {
      await approveCorrectiveAction(correctiveActionId)
      setCorrectiveActions((prevCorrectiveActions) =>
        prevCorrectiveActions.map((ca) => (ca.id === correctiveActionId ? { ...ca, approved: !ca.approved } : ca)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (correctiveActionId: string) => {
    try {
      await toggleHighlight(correctiveActionId, "correctiveAction")
      setCorrectiveActions((prevCorrectiveActions) =>
        prevCorrectiveActions.map((ca) =>
          ca.id === correctiveActionId ? { ...ca, highlighted: !ca.highlighted } : ca,
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
                <AddCorrectiveActionDialog
                  categoryId={category.id}
                  onCorrectiveActionCreated={(newCorrectiveAction) =>
                    setCorrectiveActions((prevCorrectiveActions) => [...prevCorrectiveActions, newCorrectiveAction])
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
                  router.refresh();
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
                disabled={loading[category.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], delete: true}}));
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its corrective actions? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
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

      {isExpanded && correctiveActions && correctiveActions.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Corrective Action</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={correctiveActions.map((ca) => ca.id)} strategy={verticalListSortingStrategy}>
              {correctiveActions.map((correctiveAction: CorrectiveAction) => (
                <SortableCorrectiveAction key={correctiveAction.id} correctiveAction={correctiveAction}>
                  <CorrectiveActionItem
                    correctiveAction={correctiveAction}
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
                </SortableCorrectiveAction>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function CorrectiveActionsClient({
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
          currentSectionId: "corrective-actions",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move corrective action: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving corrective action:", error)
      alert("Network error occurred while moving corrective action. Please check your connection and try again.")
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
    router.push(`/corrective-actions?${params.toString()}`)
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
    router.push(`/corrective-actions?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Corrective Actions</h1>
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

          {/* Add Category and New Corrective Action buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/corrective-actions/new">Add New</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </div>
      ) : (
        categories.length > 0 ? (
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
                ? "No archived corrective actions found."
                : "No corrective actions found. Click 'Add New' to create your first corrective action."}
            </p>
            {canEdit && !showArchived && (
              <div className="mt-4">
                <AddCategoryDialog />
              </div>
            )}
          </div>
        )
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

function AddCorrectiveActionDialog({
  categoryId,
  onCorrectiveActionCreated,
}: {
  categoryId: string
  onCorrectiveActionCreated: (correctiveAction: CorrectiveAction) => void
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
          <DialogTitle>Add New Corrective Action</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const result = await addCorrectiveAction(categoryId, title)
                if (result.success) {
                  const newCorrectiveAction: CorrectiveAction = {
                    id: result.correctiveAction?.id || Math.random().toString(),
                    title,
                    version: "1",
                    issueDate: new Date().toISOString().split("T")[0],
                    location: "Default Location",
                    approved: false,
                    highlighted: false,
                  }
                  onCorrectiveActionCreated(newCorrectiveAction)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add corrective action")
                }
              } catch (error) {
                console.error("Error adding corrective action:", error)
                alert("Failed to add corrective action. Please try again.")
              }
            } else {
              alert("Corrective action title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Corrective Action Title</Label>
              <Input id="title" name="title" placeholder="Enter corrective action title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Corrective Action</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
