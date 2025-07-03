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
  reorderWorkInstructions,
  addWorkInstruction,
  addCategory,
  editCategory,
  approveWorkInstruction,
  disapproveWorkInstruction,
} from "@/app/actions/work-instruction-actions"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { SortButtons, type SortType, type SortDirection } from "@/components/ui/sort-buttons"
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
  workInstructions: WorkInstructionItem[]
}

interface WorkInstructionItem {
  id: string
  title: string
  version: string
  reviewDate: string
  department: string
  highlighted: boolean
  approved: boolean
  archived: boolean
  order: number
}

function SortableWorkInstruction({
  workInstruction,
  children,
}: { workInstruction: WorkInstructionItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: workInstruction.id })

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

function WorkInstructionItem({
  workInstruction,
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
  workInstruction: WorkInstructionItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (workInstructionId: string) => void
  onUnarchive: (workInstructionId: string) => void
  onDelete: (workInstructionId: string) => void
  onApprove: (workInstructionId: string) => void
  onHighlight: (workInstructionId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: workInstruction.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move work instruction")
        alert("Failed to move work instruction. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the work instruction. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${workInstruction.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/work-instructions/${workInstruction.id}`} className="text-blue-600 hover:underline">
          {workInstruction.title}
        </Link>
        {workInstruction.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{workInstruction.version}</div>
      <div>{new Date(workInstruction.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{workInstruction.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={workInstruction.id}
                  entryType="work-instruction"
                  currentSectionId="work-instructions"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(workInstruction.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[workInstruction.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], archive: true}}));
                  await onUnarchive(workInstruction.id);
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive work instruction ${workInstruction.title}`}
              >
                {loading[workInstruction.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[workInstruction.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], archive: true}}));
                  await onArchive(workInstruction.id);
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive work instruction ${workInstruction.title}`}
              >
                {loading[workInstruction.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[workInstruction.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], delete: true}}));
                  await onDelete(workInstruction.id);
                  setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], delete: false}}));
                }}
                aria-label={`Delete work instruction ${workInstruction.title}`}
              >
                {loading[workInstruction.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${workInstruction.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[workInstruction.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], highlight: true}}));
                    await onHighlight(workInstruction.id);
                    setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], highlight: false}}));
                  }}
                  aria-label={`${workInstruction.highlighted ? "Unhighlight" : "Highlight"} work instruction ${workInstruction.title}`}
                >
                  {loading[workInstruction.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${workInstruction.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[workInstruction.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], approve: true}}));
                    await onApprove(workInstruction.id);
                    setLoading(l => ({...l, [workInstruction.id]: {...l[workInstruction.id], approve: false}}));
                  }}
                  title={workInstruction.approved ? "Unapprove" : "Approve"}
                  aria-label={`${workInstruction.approved ? "Unapprove" : "Approve"} work instruction ${workInstruction.title}`}
                >
                  {loading[workInstruction.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [workInstructions, setWorkInstructions] = useState<WorkInstructionItem[]>(category.workInstructions || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setWorkInstructions(category.workInstructions || [])
  }, [category.workInstructions])

  // Sorting logic
  useEffect(() => {
    const sortedWorkInstructions = [...workInstructions]
    if (sortType === "name") {
      sortedWorkInstructions.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedWorkInstructions.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setWorkInstructions(sortedWorkInstructions)
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
      // Use the original category.workInstructions array for consistent ordering
      const originalWorkInstructions = category.workInstructions || []
      const oldIndex = originalWorkInstructions.findIndex((item: WorkInstructionItem) => item.id === active.id)
      const newIndex = originalWorkInstructions.findIndex((item: WorkInstructionItem) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find work instruction indices")
        return
      }

      const newOrder = arrayMove(originalWorkInstructions, oldIndex, newIndex)
      setWorkInstructions(newOrder)

      try {
        // Call the server action with the reordered IDs
        const workInstructionIds = newOrder.map((item) => item.id)
        const result = await reorderWorkInstructions(category.id, workInstructionIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setWorkInstructions(category.workInstructions || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder work instructions. Please try again.")
      }
    }
  }

  const handleArchive = async (workInstructionId: string) => {
    try {
      await archiveItem(workInstructionId, "workInstruction")
      setWorkInstructions((prevWorkInstructions) => prevWorkInstructions.filter((wi) => wi.id !== workInstructionId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving work instruction:", error)
    }
  }

  const handleUnarchive = async (workInstructionId: string) => {
    try {
      await unarchiveItem(workInstructionId, "workInstruction")
      setWorkInstructions((prevWorkInstructions) => prevWorkInstructions.filter((wi) => wi.id !== workInstructionId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving work instruction:", error)
    }
  }

  const handleDelete = async (workInstructionId: string) => {
    if (confirm("Are you sure you want to delete this work instruction? This action cannot be undone.")) {
      try {
        await deleteItem(workInstructionId, "workInstruction")
        setWorkInstructions((prevWorkInstructions) => prevWorkInstructions.filter((wi) => wi.id !== workInstructionId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting work instruction:", error)
      }
    }
  }

  const handleApprove = async (workInstructionId: string) => {
    try {
      const workInstruction = workInstructions.find((wi) => wi.id === workInstructionId)
      if (workInstruction?.approved) {
        await disapproveWorkInstruction(workInstructionId)
      } else {
        await approveWorkInstruction(workInstructionId)
      }
      setWorkInstructions((prevWorkInstructions) =>
        prevWorkInstructions.map((wi) => (wi.id === workInstructionId ? { ...wi, approved: !wi.approved } : wi)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (workInstructionId: string) => {
    try {
      await toggleHighlight(workInstructionId, "workInstruction")
      setWorkInstructions((prevWorkInstructions) =>
        prevWorkInstructions.map((wi) => (wi.id === workInstructionId ? { ...wi, highlighted: !wi.highlighted } : wi)),
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
                <AddWorkInstructionDialog
                  categoryId={category.id}
                  onWorkInstructionCreated={(newWorkInstruction) =>
                    setWorkInstructions((prevWorkInstructions) => [...prevWorkInstructions, newWorkInstruction])
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
                      "Are you sure you want to delete this category and all its work instructions? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setWorkInstructions([]);
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

      {isExpanded && workInstructions && workInstructions.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Work Instruction</div>
            <div>Version</div>
            <div>Review Date</div>
            <div>Department</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={workInstructions.map((wi) => wi.id)} strategy={verticalListSortingStrategy}>
              {workInstructions.map((workInstruction: WorkInstructionItem) => (
                <SortableWorkInstruction key={workInstruction.id} workInstruction={workInstruction}>
                  <WorkInstructionItem
                    workInstruction={workInstruction}
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
                </SortableWorkInstruction>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function WorkInstructionsClient({
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
          currentSectionId: "work-instructions",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move work instruction: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving work instruction:", error)
      alert("Network error occurred while moving work instruction. Please check your connection and try again.")
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
    router.push(`/work-instructions?${params.toString()}`)
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
    router.push(`/work-instructions?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Work Instructions</h1>
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

          {/* Add Category and New Work Instruction buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/work-instructions/new">Add New</Link>
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
              ? "No archived work instructions found."
              : "No work instructions found. Click 'Add New' to create your first work instruction."}
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

function AddWorkInstructionDialog({
  categoryId,
  onWorkInstructionCreated,
}: {
  categoryId: string
  onWorkInstructionCreated: (workInstruction: WorkInstructionItem) => void
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
          <DialogTitle>Add New Work Instruction</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const result = await addWorkInstruction({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  department: "IMS",
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newWorkInstruction: WorkInstructionItem = {
                    id: result.workInstruction?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    department: "IMS",
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onWorkInstructionCreated(newWorkInstruction)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add work instruction")
                }
              } catch (error) {
                console.error("Error adding work instruction:", error)
                alert("Failed to add work instruction. Please try again.")
              }
            } else {
              alert("Work instruction title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Work Instruction Title</Label>
              <Input id="title" name="title" placeholder="Enter work instruction title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Work Instruction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
