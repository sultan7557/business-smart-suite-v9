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
  reorderBusinessContinuities,
  addBusinessContinuity,
  addCategory,
  editCategory,
  approveBusinessContinuity,
  disapproveBusinessContinuity,
} from "@/app/actions/business-continuity-actions"
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
  businessContinuities: BusinessContinuityItem[]
}

interface BusinessContinuityItem {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  highlighted: boolean
  approved: boolean
  archived: boolean
  order: number
}

function SortableBusinessContinuity({
  businessContinuity,
  children,
}: { businessContinuity: BusinessContinuityItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: businessContinuity.id })

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

function BusinessContinuityItem({
  businessContinuity,
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
  businessContinuity: BusinessContinuityItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (businessContinuityId: string) => void
  onUnarchive: (businessContinuityId: string) => void
  onDelete: (businessContinuityId: string) => void
  onApprove: (businessContinuityId: string) => void
  onHighlight: (businessContinuityId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: businessContinuity.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move business continuity")
        alert("Failed to move business continuity. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the business continuity. Please try again.")
      return false
    }
  }

  return (
    <div
      className={`grid grid-cols-4 p-2 border-b items-center ${businessContinuity.highlighted ? "bg-yellow-50" : ""}`}
    >
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/business-continuity/${businessContinuity.id}`} className="text-blue-600 hover:underline">
          {businessContinuity.title}
        </Link>
        {businessContinuity.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{businessContinuity.version}</div>
      <div>{new Date(businessContinuity.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{businessContinuity.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={businessContinuity.id}
                  entryType="business-continuity"
                  currentSectionId="business-continuity"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) =>
                    handleMove(businessContinuity.id, newSectionId, newCategoryId)
                  }
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[businessContinuity.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], archive: true}}));
                  await onUnarchive(businessContinuity.id);
                  setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive business continuity ${businessContinuity.title}`}
              >
                {loading[businessContinuity.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[businessContinuity.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], archive: true}}));
                  await onArchive(businessContinuity.id);
                  setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive business continuity ${businessContinuity.title}`}
              >
                {loading[businessContinuity.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[businessContinuity.id]?.delete}
                onClick={() => {
                  setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], delete: true}}));
                  onDelete(businessContinuity.id);
                }}
                aria-label={`Delete business continuity ${businessContinuity.title}`}
              >
                {loading[businessContinuity.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${businessContinuity.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[businessContinuity.id]?.highlight}
                  onClick={() => {
                    setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], highlight: true}}));
                    onHighlight(businessContinuity.id);
                    setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], highlight: false}}));
                  }}
                  aria-label={`${businessContinuity.highlighted ? "Unhighlight" : "Highlight"} business continuity ${businessContinuity.title}`}
                >
                  {loading[businessContinuity.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${businessContinuity.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[businessContinuity.id]?.approve}
                  onClick={() => {
                    setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], approve: true}}));
                    onApprove(businessContinuity.id);
                    setLoading(l => ({...l, [businessContinuity.id]: {...l[businessContinuity.id], approve: false}}));
                  }}
                  title={businessContinuity.approved ? "Unapprove" : "Approve"}
                  aria-label={`${businessContinuity.approved ? "Unapprove" : "Approve"} business continuity ${businessContinuity.title}`}
                >
                  {loading[businessContinuity.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [businessContinuities, setBusinessContinuities] = useState<BusinessContinuityItem[]>(
    category.businessContinuities || [],
  )
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setBusinessContinuities(category.businessContinuities || [])
  }, [category.businessContinuities])

  // Sorting logic
  useEffect(() => {
    const sortedBusinessContinuities = [...businessContinuities]
    if (sortType === "name") {
      sortedBusinessContinuities.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedBusinessContinuities.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setBusinessContinuities(sortedBusinessContinuities)
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
      // Use the original category.businessContinuities array for consistent ordering
      const originalBusinessContinuities = category.businessContinuities || []
      const oldIndex = originalBusinessContinuities.findIndex((item: BusinessContinuityItem) => item.id === active.id)
      const newIndex = originalBusinessContinuities.findIndex((item: BusinessContinuityItem) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find business continuity indices")
        return
      }

      const newOrder = arrayMove(originalBusinessContinuities, oldIndex, newIndex)
      setBusinessContinuities(newOrder)

      try {
        // Call the server action with the reordered IDs
        const businessContinuityIds = newOrder.map((item) => item.id)
        const result = await reorderBusinessContinuities(category.id, businessContinuityIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setBusinessContinuities(category.businessContinuities || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder business continuities. Please try again.")
      }
    }
  }

  const handleArchive = async (businessContinuityId: string) => {
    try {
      await archiveItem(businessContinuityId, "businessContinuity")
      setBusinessContinuities((prevBusinessContinuities) =>
        prevBusinessContinuities.filter((bc) => bc.id !== businessContinuityId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error archiving business continuity:", error)
    }
  }

  const handleUnarchive = async (businessContinuityId: string) => {
    try {
      await unarchiveItem(businessContinuityId, "businessContinuity")
      setBusinessContinuities((prevBusinessContinuities) =>
        prevBusinessContinuities.filter((bc) => bc.id !== businessContinuityId),
      )
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving business continuity:", error)
    }
  }

  const handleDelete = async (businessContinuityId: string) => {
    if (confirm("Are you sure you want to delete this business continuity? This action cannot be undone.")) {
      try {
        await deleteItem(businessContinuityId, "businessContinuity")
        setBusinessContinuities((prevBusinessContinuities) =>
          prevBusinessContinuities.filter((bc) => bc.id !== businessContinuityId),
        )
        router.refresh()
      } catch (error) {
        console.error("Error deleting business continuity:", error)
      }
    }
  }

  const handleApprove = async (businessContinuityId: string) => {
    try {
      const businessContinuity = businessContinuities.find((bc) => bc.id === businessContinuityId)
      if (businessContinuity?.approved) {
        await disapproveBusinessContinuity(businessContinuityId)
      } else {
        await approveBusinessContinuity(businessContinuityId)
      }
      setBusinessContinuities((prevBusinessContinuities) =>
        prevBusinessContinuities.map((bc) => (bc.id === businessContinuityId ? { ...bc, approved: !bc.approved } : bc)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (businessContinuityId: string) => {
    try {
      await toggleHighlight(businessContinuityId, "businessContinuity")
      setBusinessContinuities((prevBusinessContinuities) =>
        prevBusinessContinuities.map((bc) =>
          bc.id === businessContinuityId ? { ...bc, highlighted: !bc.highlighted } : bc,
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
                <AddBusinessContinuityDialog
                  categoryId={category.id}
                  onBusinessContinuityCreated={(newBusinessContinuity) =>
                    setBusinessContinuities((prevBusinessContinuities) => [
                      ...prevBusinessContinuities,
                      newBusinessContinuity,
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
                onClick={() => {
                  setLoading(l => ({...l, [category.id]: {...l[category.id], delete: true}}));
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its business continuities? This action cannot be undone.",
                    )
                  ) {
                    deleteItem(category.id, "category");
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

      {isExpanded && businessContinuities && businessContinuities.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Business Continuity</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={businessContinuities.map((bc) => bc.id)} strategy={verticalListSortingStrategy}>
              {businessContinuities.map((businessContinuity: BusinessContinuityItem) => (
                <SortableBusinessContinuity key={businessContinuity.id} businessContinuity={businessContinuity}>
                  <BusinessContinuityItem
                    businessContinuity={businessContinuity}
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
                </SortableBusinessContinuity>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function BusinessContinuityClient({
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
          currentSectionId: "business-continuity",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move business continuity: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving business continuity:", error)
      alert("Network error occurred while moving business continuity. Please check your connection and try again.")
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
    router.push(`/business-continuity?${params.toString()}`)
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
    router.push(`/business-continuity?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Business Continuity</h1>
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

          {/* Add Category and New Business Continuity buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/business-continuity/new">Add New</Link>
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
              ? "No archived business continuities found."
              : "No business continuities found. Click 'Add New' to create your first business continuity."}
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

function AddBusinessContinuityDialog({
  categoryId,
  onBusinessContinuityCreated,
}: {
  categoryId: string
  onBusinessContinuityCreated: (businessContinuity: BusinessContinuityItem) => void
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
          <DialogTitle>Add New Business Continuity</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const result = await addBusinessContinuity({
                  title,
                  version: "1.0",
                  issueDate: new Date().toISOString().split("T")[0],
                  location: "IMS",
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newBusinessContinuity: BusinessContinuityItem = {
                    id: result.businessContinuity?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    issueDate: new Date().toISOString().split("T")[0],
                    location: "IMS",
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onBusinessContinuityCreated(newBusinessContinuity)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add business continuity")
                }
              } catch (error) {
                console.error("Error adding business continuity:", error)
                alert("Failed to add business continuity. Please try again.")
              }
            } else {
              alert("Business continuity title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Business Continuity Title</Label>
              <Input id="title" name="title" placeholder="Enter business continuity title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Business Continuity</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



