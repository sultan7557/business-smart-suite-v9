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
  reorderHseGuidances,
  addHseGuidance,
  addCategory,
  editCategory,
  approveHseGuidance,
  disapproveHseGuidance,
} from "@/app/actions/hse-guidance-actions"
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
  hseGuidances: HseGuidanceItem[]
}

interface HseGuidanceItem {
  id: string
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  department: string
  highlighted: boolean
  approved: boolean
  archived: boolean
  order: number
}

function SortableHseGuidance({ hseGuidance, children }: { hseGuidance: HseGuidanceItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hseGuidance.id })

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

function HseGuidanceItem({
  hseGuidance,
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
  hseGuidance: HseGuidanceItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (hseGuidanceId: string) => void
  onUnarchive: (hseGuidanceId: string) => void
  onDelete: (hseGuidanceId: string) => void
  onApprove: (hseGuidanceId: string) => void
  onHighlight: (hseGuidanceId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: hseGuidance.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move HSE guidance")
        alert("Failed to move HSE guidance. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the HSE guidance. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${hseGuidance.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/hse-guidance/${hseGuidance.id}`} className="text-blue-600 hover:underline">
          {hseGuidance.title}
        </Link>
        {hseGuidance.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{hseGuidance.version}</div>
      <div>{new Date(hseGuidance.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{hseGuidance.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={hseGuidance.id}
                  entryType="hse-guidance"
                  currentSectionId="hse-guidance"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(hseGuidance.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[hseGuidance.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], archive: true}}));
                  await onUnarchive(hseGuidance.id);
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive HSE guidance ${hseGuidance.title}`}
              >
                {loading[hseGuidance.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[hseGuidance.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], archive: true}}));
                  await onArchive(hseGuidance.id);
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive HSE guidance ${hseGuidance.title}`}
              >
                {loading[hseGuidance.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[hseGuidance.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], delete: true}}));
                  await onDelete(hseGuidance.id);
                  setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], delete: false}}));
                }}
                aria-label={`Delete HSE guidance ${hseGuidance.title}`}
              >
                {loading[hseGuidance.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${hseGuidance.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[hseGuidance.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], highlight: true}}));
                    await onHighlight(hseGuidance.id);
                    setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], highlight: false}}));
                  }}
                  aria-label={`${hseGuidance.highlighted ? "Unhighlight" : "Highlight"} HSE guidance ${hseGuidance.title}`}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${hseGuidance.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[hseGuidance.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], approve: true}}));
                    await onApprove(hseGuidance.id);
                    setLoading(l => ({...l, [hseGuidance.id]: {...l[hseGuidance.id], approve: false}}));
                  }}
                  title={hseGuidance.approved ? "Unapprove" : "Approve"}
                  aria-label={`${hseGuidance.approved ? "Unapprove" : "Approve"} HSE guidance ${hseGuidance.title}`}
                >
                  {loading[hseGuidance.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [hseGuidances, setHseGuidances] = useState<HseGuidanceItem[]>(category.hseGuidances || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setHseGuidances(category.hseGuidances || [])
  }, [category.hseGuidances])

  // Sorting logic
  useEffect(() => {
    const sortedHseGuidances = [...hseGuidances]
    if (sortType === "name") {
      sortedHseGuidances.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedHseGuidances.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setHseGuidances(sortedHseGuidances)
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
      // Use the original category.hseGuidances array for consistent ordering
      const originalHseGuidances = category.hseGuidances || []
      const oldIndex = originalHseGuidances.findIndex((item: HseGuidanceItem) => item.id === active.id)
      const newIndex = originalHseGuidances.findIndex((item: HseGuidanceItem) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find HSE guidance indices")
        return
      }

      const newOrder = arrayMove(originalHseGuidances, oldIndex, newIndex)
      setHseGuidances(newOrder)

      try {
        // Call the server action with the reordered IDs
        const hseGuidanceIds = newOrder.map((item) => item.id)
        const result = await reorderHseGuidances(category.id, hseGuidanceIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setHseGuidances(category.hseGuidances || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder HSE guidances. Please try again.")
      }
    }
  }

  const handleArchive = async (hseGuidanceId: string) => {
    try {
      await archiveItem(hseGuidanceId, "hseGuidance")
      setHseGuidances((prevHseGuidances) => prevHseGuidances.filter((hg) => hg.id !== hseGuidanceId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving HSE guidance:", error)
    }
  }

  const handleUnarchive = async (hseGuidanceId: string) => {
    try {
      await unarchiveItem(hseGuidanceId, "hseGuidance")
      setHseGuidances((prevHseGuidances) => prevHseGuidances.filter((hg) => hg.id !== hseGuidanceId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving HSE guidance:", error)
    }
  }

  const handleDelete = async (hseGuidanceId: string) => {
    if (confirm("Are you sure you want to delete this HSE guidance? This action cannot be undone.")) {
      try {
        await deleteItem(hseGuidanceId, "hseGuidance")
        setHseGuidances((prevHseGuidances) => prevHseGuidances.filter((hg) => hg.id !== hseGuidanceId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting HSE guidance:", error)
      }
    }
  }

  const handleApprove = async (hseGuidanceId: string) => {
    try {
      const hseGuidance = hseGuidances.find((hg) => hg.id === hseGuidanceId)
      if (hseGuidance?.approved) {
        await disapproveHseGuidance(hseGuidanceId)
      } else {
        await approveHseGuidance(hseGuidanceId)
      }
      setHseGuidances((prevHseGuidances) =>
        prevHseGuidances.map((hg) => (hg.id === hseGuidanceId ? { ...hg, approved: !hg.approved } : hg)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (hseGuidanceId: string) => {
    try {
      await toggleHighlight(hseGuidanceId, "hseGuidance")
      setHseGuidances((prevHseGuidances) =>
        prevHseGuidances.map((hg) => (hg.id === hseGuidanceId ? { ...hg, highlighted: !hg.highlighted } : hg)),
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
                <AddHseGuidanceDialog
                  categoryId={category.id}
                  onHseGuidanceCreated={(newHseGuidance) =>
                    setHseGuidances((prevHseGuidances) => [...prevHseGuidances, newHseGuidance])
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
                      "Are you sure you want to delete this category and all its HSE guidances? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setHseGuidances([]);
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

      {isExpanded && hseGuidances && hseGuidances.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>HSE Guidance</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={hseGuidances.map((hg) => hg.id)} strategy={verticalListSortingStrategy}>
              {hseGuidances.map((hseGuidance: HseGuidanceItem) => (
                <SortableHseGuidance key={hseGuidance.id} hseGuidance={hseGuidance}>
                  <HseGuidanceItem
                    hseGuidance={hseGuidance}
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
                </SortableHseGuidance>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function HseGuidanceClient({
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
          currentSectionId: "hse-guidance",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move HSE guidance: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving HSE guidance:", error)
      alert("Network error occurred while moving HSE guidance. Please check your connection and try again.")
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
    router.push(`/hse-guidance?${params.toString()}`)
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
    router.push(`/hse-guidance?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">HSE Guidance</h1>
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

          {/* Add Category and New HSE Guidance buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/hse-guidance/new">Add New</Link>
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
              ? "No archived HSE guidances found."
              : "No HSE guidances found. Click 'Add New' to create your first HSE guidance."}
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

function AddHseGuidanceDialog({
  categoryId,
  onHseGuidanceCreated,
}: {
  categoryId: string
  onHseGuidanceCreated: (hseGuidance: HseGuidanceItem) => void
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
          <DialogTitle>Add New HSE Guidance</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            const department = formData.get("department") as string
            if (title && department) {
              try {
                const result = await addHseGuidance({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  department,
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newHseGuidance: HseGuidanceItem = {
                    id: result.hseGuidance?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    department,
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onHseGuidanceCreated(newHseGuidance)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add HSE guidance")
                }
              } catch (error) {
                console.error("Error adding HSE guidance:", error)
                alert("Failed to add HSE guidance. Please try again.")
              }
            } else {
              alert("HSE guidance title and location are required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">HSE Guidance Title</Label>
              <Input id="title" name="title" placeholder="Enter HSE guidance title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Location</Label>
              <Input id="department" name="department" placeholder="Enter location" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add HSE Guidance</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
