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
  reorderTechnicalFiles,
  addTechnicalFile,
  addCategory,
  editCategory,
  approveTechnicalFile,
  disapproveTechnicalFile,
} from "@/app/actions/technical-file-actions"
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
  technicalFiles: TechnicalFileItem[]
}

interface TechnicalFileItem {
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

function SortableTechnicalFile({
  technicalFile,
  children,
}: { technicalFile: TechnicalFileItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: technicalFile.id })

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

function TechnicalFileItem({
  technicalFile,
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
  technicalFile: TechnicalFileItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (technicalFileId: string) => void
  onUnarchive: (technicalFileId: string) => void
  onDelete: (technicalFileId: string) => void
  onApprove: (technicalFileId: string) => void
  onHighlight: (technicalFileId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: technicalFile.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move technical file")
        alert("Failed to move technical file. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the technical file. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${technicalFile.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/technical-file/${technicalFile.id}`} className="text-blue-600 hover:underline">
          {technicalFile.title}
        </Link>
        {technicalFile.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{technicalFile.version}</div>
      <div>{new Date(technicalFile.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{technicalFile.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={technicalFile.id}
                  entryType="technical-file"
                  currentSectionId="technical-file"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(technicalFile.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[technicalFile.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], archive: true}}));
                  await onUnarchive(technicalFile.id);
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive technical file ${technicalFile.title}`}
              >
                {loading[technicalFile.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[technicalFile.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], archive: true}}));
                  await onArchive(technicalFile.id);
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive technical file ${technicalFile.title}`}
              >
                {loading[technicalFile.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[technicalFile.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], delete: true}}));
                  await onDelete(technicalFile.id);
                  setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], delete: false}}));
                }}
                aria-label={`Delete technical file ${technicalFile.title}`}
              >
                {loading[technicalFile.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${technicalFile.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[technicalFile.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], highlight: true}}));
                    await onHighlight(technicalFile.id);
                    setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], highlight: false}}));
                  }}
                  aria-label={`${technicalFile.highlighted ? "Unhighlight" : "Highlight"} technical file ${technicalFile.title}`}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${technicalFile.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[technicalFile.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], approve: true}}));
                    await onApprove(technicalFile.id);
                    setLoading(l => ({...l, [technicalFile.id]: {...l[technicalFile.id], approve: false}}));
                  }}
                  title={technicalFile.approved ? "Unapprove" : "Approve"}
                  aria-label={`${technicalFile.approved ? "Unapprove" : "Approve"} technical file ${technicalFile.title}`}
                >
                  {loading[technicalFile.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [technicalFiles, setTechnicalFiles] = useState<TechnicalFileItem[]>(category.technicalFiles || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setTechnicalFiles(category.technicalFiles || [])
  }, [category.technicalFiles])

  useEffect(() => {
    const sortedTechnicalFiles = [...technicalFiles]
    if (sortType === "name") {
      sortedTechnicalFiles.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedTechnicalFiles.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setTechnicalFiles(sortedTechnicalFiles)
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
      const originalTechnicalFiles = category.technicalFiles || []
      const oldIndex = originalTechnicalFiles.findIndex((item: TechnicalFileItem) => item.id === active.id)
      const newIndex = originalTechnicalFiles.findIndex((item: TechnicalFileItem) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find technical file indices")
        return
      }

      const newOrder = arrayMove(originalTechnicalFiles, oldIndex, newIndex)
      setTechnicalFiles(newOrder)

      try {
        const technicalFileIds = newOrder.map((item) => item.id)
        const result = await reorderTechnicalFiles(category.id, technicalFileIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        setTechnicalFiles(category.technicalFiles || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder technical files. Please try again.")
      }
    }
  }

  const handleArchive = async (technicalFileId: string) => {
    try {
      await archiveItem(technicalFileId, "technicalFile")
      setTechnicalFiles((prevTechnicalFiles) => prevTechnicalFiles.filter((tf) => tf.id !== technicalFileId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving technical file:", error)
    }
  }

  const handleUnarchive = async (technicalFileId: string) => {
    try {
      await unarchiveItem(technicalFileId, "technicalFile")
      setTechnicalFiles((prevTechnicalFiles) => prevTechnicalFiles.filter((tf) => tf.id !== technicalFileId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving technical file:", error)
    }
  }

  const handleDelete = async (technicalFileId: string) => {
    if (confirm("Are you sure you want to delete this technical file? This action cannot be undone.")) {
      try {
        await deleteItem(technicalFileId, "technicalFile")
        setTechnicalFiles((prevTechnicalFiles) => prevTechnicalFiles.filter((tf) => tf.id !== technicalFileId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting technical file:", error)
      }
    }
  }

  const handleApprove = async (technicalFileId: string) => {
    try {
      const technicalFile = technicalFiles.find((tf) => tf.id === technicalFileId)
      if (technicalFile?.approved) {
        await disapproveTechnicalFile(technicalFileId)
      } else {
        await approveTechnicalFile(technicalFileId)
      }
      setTechnicalFiles((prevTechnicalFiles) =>
        prevTechnicalFiles.map((tf) => (tf.id === technicalFileId ? { ...tf, approved: !tf.approved } : tf)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (technicalFileId: string) => {
    try {
      await toggleHighlight(technicalFileId, "technicalFile")
      setTechnicalFiles((prevTechnicalFiles) =>
        prevTechnicalFiles.map((tf) => (tf.id === technicalFileId ? { ...tf, highlighted: !tf.highlighted } : tf)),
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
                <AddTechnicalFileDialog
                  categoryId={category.id}
                  onTechnicalFileCreated={(newTechnicalFile) =>
                    setTechnicalFiles((prevTechnicalFiles) => [...prevTechnicalFiles, newTechnicalFile])
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
                      "Are you sure you want to delete this category and all its technical files? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setTechnicalFiles([]);
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

      {isExpanded && technicalFiles && technicalFiles.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Technical File</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={technicalFiles.map((tf) => tf.id)} strategy={verticalListSortingStrategy}>
              {technicalFiles.map((technicalFile: TechnicalFileItem) => (
                <SortableTechnicalFile key={technicalFile.id} technicalFile={technicalFile}>
                  <TechnicalFileItem
                    technicalFile={technicalFile}
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
                </SortableTechnicalFile>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function TechnicalFileClient({
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
          currentSectionId: "technical-file",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move technical file: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving technical file:", error)
      alert("Network error occurred while moving technical file. Please check your connection and try again.")
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
    router.push(`/technical-file?${params.toString()}`)
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
    router.push(`/technical-file?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Technical Files</h1>
          {showArchived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived View</span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

          <Button variant="outline" onClick={toggleArchived}>
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>

          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/technical-file/new">Add New</Link>
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
              ? "No archived technical files found."
              : "No technical files found. Click 'Add New' to create your first technical file."}
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

function AddTechnicalFileDialog({
  categoryId,
  onTechnicalFileCreated,
}: {
  categoryId: string
  onTechnicalFileCreated: (technicalFile: TechnicalFileItem) => void
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
          <DialogTitle>Add New Technical File</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const result = await addTechnicalFile({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  department: "IMS",
                  categoryId,
                })
                if (result.success) {
                  const newTechnicalFile: TechnicalFileItem = {
                    id: result.technicalFile?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    department: "IMS",
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onTechnicalFileCreated(newTechnicalFile)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add technical file")
                }
              } catch (error) {
                console.error("Error adding technical file:", error)
                alert("Failed to add technical file. Please try again.")
              }
            } else {
              alert("Technical file title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Technical File Title</Label>
              <Input id="title" name="title" placeholder="Enter technical file title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Technical File</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
