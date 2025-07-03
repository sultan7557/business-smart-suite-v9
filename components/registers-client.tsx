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
  addRegister,
  addCategory,
  editCategory,
  approveRegister,
} from "@/app/actions/register-actions"
import { Textarea } from "@/components/ui/textarea"
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
import { Loader } from "@/components/ui/loader"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"

interface Register {
  id: string
  title: string
  version: string
  reviewDate: Date
  nextReviewDate: Date | null
  department: string
  content: string | null
  highlighted: boolean
  approved: boolean
  archived: boolean
  categoryId: string
  createdById: string
  updatedById: string | null
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    title: string
  }
  createdBy: {
    name: string
  }
  updatedBy: {
    name: string
  } | null
}

interface Category {
  id: string
  title: string
  order: number
  archived: boolean
  highlighted: boolean
  createdById: string
  updatedById: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: {
    name: string
  }
  updatedBy: {
    name: string
  } | null
  registers?: Register[]
}

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface RegistersClientProps {
  categories: Category[]
  canEdit: boolean
  canDelete: boolean
  showArchived: boolean
  currentSort?: string
}

function SortableRegister({ register, children }: { register: Register; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: register.id })

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

function RegisterItem({
  register,
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
  register: Register
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (registerId: string) => void
  onUnarchive: (registerId: string) => void
  onDelete: (registerId: string) => void
  onApprove: (registerId: string) => void
  onHighlight: (registerId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: register.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move register")
        alert("Failed to move register. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the register. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${register.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/registers/${register.id}`} className="text-blue-600 hover:underline">
          {register.title}
        </Link>
        {register.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{register.version}</div>
      <div>{new Date(register.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{register.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={register.id}
                  entryType="register"
                  currentSectionId="registers"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(register.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[register.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [register.id]: {...l[register.id], archive: true}}));
                  await onUnarchive(register.id);
                  setLoading(l => ({...l, [register.id]: {...l[register.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive register ${register.title}`}
              >
                {loading[register.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[register.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [register.id]: {...l[register.id], archive: true}}));
                  await onArchive(register.id);
                  setLoading(l => ({...l, [register.id]: {...l[register.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive register ${register.title}`}
              >
                {loading[register.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[register.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [register.id]: {...l[register.id], delete: true}}));
                  await onDelete(register.id);
                  setLoading(l => ({...l, [register.id]: {...l[register.id], delete: false}}));
                }}
                aria-label={`Delete register ${register.title}`}
              >
                {loading[register.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${register.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[register.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [register.id]: {...l[register.id], highlight: true}}));
                    await onHighlight(register.id);
                    setLoading(l => ({...l, [register.id]: {...l[register.id], highlight: false}}));
                  }}
                  aria-label={`${register.highlighted ? "Unhighlight" : "Highlight"} register ${register.title}`}
                >
                  {loading[register.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${register.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[register.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [register.id]: {...l[register.id], approve: true}}));
                    await onApprove(register.id);
                    setLoading(l => ({...l, [register.id]: {...l[register.id], approve: false}}));
                  }}
                  title={register.approved ? "Unapprove" : "Approve"}
                  aria-label={`${register.approved ? "Unapprove" : "Approve"} register ${register.title}`}
                >
                  {loading[register.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [registers, setRegisters] = useState<Register[]>(category.registers || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setRegisters(category.registers || [])
  }, [category.registers])

  // Sorting logic
  useEffect(() => {
    const sortedRegisters = [...registers]
    if (sortType === "name") {
      sortedRegisters.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedRegisters.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setRegisters(sortedRegisters)
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
      // Use the original category.registers array for consistent ordering
      const originalRegisters = category.registers || []
      const oldIndex = originalRegisters.findIndex((item: Register) => item.id === active.id)
      const newIndex = originalRegisters.findIndex((item: Register) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find register indices")
        return
      }

      const newOrder = arrayMove(originalRegisters, oldIndex, newIndex)
      setRegisters(newOrder)

      try {
        // Call the server action with the new position
        const result = await reorderItem(active.id, "register", newIndex)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setRegisters(category.registers || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder registers. Please try again.")
      }
    }
  }

  const handleArchive = async (registerId: string) => {
    try {
      await archiveItem(registerId, "register")
      setRegisters((prevRegisters) => prevRegisters.filter((r) => r.id !== registerId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving register:", error)
    }
  }

  const handleUnarchive = async (registerId: string) => {
    try {
      await unarchiveItem(registerId, "register")
      setRegisters((prevRegisters) => prevRegisters.filter((r) => r.id !== registerId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving register:", error)
    }
  }

  const handleDelete = async (registerId: string) => {
    if (confirm("Are you sure you want to delete this register? This action cannot be undone.")) {
      try {
        await deleteItem(registerId, "register")
        setRegisters((prevRegisters) => prevRegisters.filter((r) => r.id !== registerId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting register:", error)
      }
    }
  }

  const handleApprove = async (registerId: string) => {
    try {
      await approveRegister(registerId)
      setRegisters((prevRegisters) =>
        prevRegisters.map((r) => (r.id === registerId ? { ...r, approved: !r.approved } : r)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (registerId: string) => {
    try {
      await toggleHighlight(registerId, "register")
      setRegisters((prevRegisters) =>
        prevRegisters.map((r) => (r.id === registerId ? { ...r, highlighted: !r.highlighted } : r)),
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
                <AddRegisterDialog
                  categoryId={category.id}
                  onRegisterCreated={(newRegister) => setRegisters((prevRegisters) => [...prevRegisters, newRegister])}
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
                      "Are you sure you want to delete this category and all its register items? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setRegisters((prevRegisters) => prevRegisters.filter((r) => r.id !== category.id));
                    router.refresh();
                  }
                  setLoading(l => ({...l, [category.id]: {...l[category.id], delete: false}}));
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

      {isExpanded && registers && registers.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Document</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={registers.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              {isLoading ? (
                <div>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                  ))}
                </div>
              ) : (
                registers.map((register: Register) => (
                  <SortableRegister key={register.id} register={register}>
                    <RegisterItem
                      register={register}
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
                  </SortableRegister>
                ))
              )}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export function RegistersClient({ categories, canEdit, canDelete, showArchived, currentSort }: RegistersClientProps) {
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
          currentSectionId: "registers",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move register: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving register:", error)
      alert("Network error occurred while moving register. Please check your connection and try again.")
      return false
    }
  }

  const search = searchParams?.get("search") || ""
  const sort = searchParams?.get("sort") || ""
  const order = searchParams?.get("order") || "asc"

  const handleSort = (newSort: string) => {
    const params = new URLSearchParams()
    if (searchParams) {
      searchParams.forEach((value, key) => {
        if (key !== "sort" && key !== "order") {
          params.set(key, value)
        }
      })
    }

    if (newSort === sort) {
      if (order === "desc") {
        router.push(`/registers?${params.toString()}`)
        return
      }
      params.set("sort", newSort)
      params.set("order", "desc")
    } else {
      params.set("sort", newSort)
      params.set("order", "asc")
    }

    router.push(`/registers?${params.toString()}`)
  }

  const toggleArchiveView = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (showArchived) {
      params.delete("showArchived")
    } else {
      params.set("showArchived", "true")
    }
    router.push(`/registers?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Registers</h1>
          {showArchived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived View</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <div className="flex items-center gap-1">
            <Button variant={sort === "name" ? "default" : "outline"} size="sm" onClick={() => handleSort("name")}>
              <SortAsc className="h-4 w-4 mr-1" />
              Name {sort === "name" && (order === "asc" ? "↑" : "↓")}
            </Button>
            <Button variant={sort === "date" ? "default" : "outline"} size="sm" onClick={() => handleSort("date")}>
              <SortAsc className="h-4 w-4 mr-1" />
              Date {sort === "date" && (order === "asc" ? "↑" : "↓")}
            </Button>
          </div>

          {/* Archive Toggle */}
          <Button variant="outline" onClick={toggleArchiveView}>
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>

          {/* Add Category and New Register buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/registers/new">Add New Register</Link>
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
            {showArchived ? "No archived register items found." : "No register items found."}
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await addCategory(title)
      if (result.success) {
        setOpen(false)
        setTitle("")
        router.refresh()
      } else {
        alert(result.error || "Failed to add category")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Category Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(category.title)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await editCategory(category.id, title)
      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        alert(result.error || "Failed to edit category")
      }
    } catch (error) {
      console.error("Error editing category:", error)
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-gray-600 text-white border-none">
          <Edit className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Category Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddRegisterDialog({
  categoryId,
  onRegisterCreated,
}: {
  categoryId: string
  onRegisterCreated: (register: Register) => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    version: "1.0",
    reviewDate: new Date().toISOString().split("T")[0],
    department: "IMS",
    content: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await addRegister({
        ...formData,
        categoryId,
      })
      if (result.success) {
        const newRegister: Register = {
          id: result.data?.id || Math.random().toString(),
          title: formData.title,
          version: formData.version,
          reviewDate: new Date(formData.reviewDate),
          nextReviewDate: null,
          department: formData.department,
          content: formData.content,
          highlighted: false,
          approved: false,
          archived: false,
          categoryId,
          createdById: "",
          updatedById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: categoryId, title: "" },
          createdBy: { name: "" },
          updatedBy: null,
        }
        onRegisterCreated(newRegister)
        setOpen(false)
        setFormData({
          title: "",
          version: "1.0",
          reviewDate: new Date().toISOString().split("T")[0],
          department: "IMS",
          content: "",
        })
        router.refresh()
      } else {
        alert(result.error || "Failed to add register")
      }
    } catch (error) {
      console.error("Error adding register:", error)
      alert("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-green-500 text-white border-none">
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Register</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input
              id="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
