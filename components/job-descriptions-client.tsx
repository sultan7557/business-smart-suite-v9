"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FileText, Edit, Check, X, Plus, Archive, RefreshCw, SortAsc, GripVertical } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  reorderJobDescriptions,
  addJobDescription,
  addCategory,
  editCategory,
  approveJobDescription,
  disapproveJobDescription,
} from "@/app/actions/job-description-actions"
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
  jobDescriptions: JobDescriptionItem[]
}

interface JobDescriptionItem {
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

function SortableJobDescription({
  jobDescription,
  children,
}: { jobDescription: JobDescriptionItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: jobDescription.id })

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

function JobDescriptionItem({
  jobDescription,
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
  jobDescription: JobDescriptionItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (jobDescriptionId: string) => void
  onUnarchive: (jobDescriptionId: string) => void
  onDelete: (jobDescriptionId: string) => void
  onApprove: (jobDescriptionId: string) => void
  onHighlight: (jobDescriptionId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: jobDescription.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move job description")
        alert("Failed to move job description. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the job description. Please try again.")
      return false
    }
  }

  return (
    <div
      className={`grid grid-cols-12 gap-4 p-3 border-b items-center ${jobDescription.highlighted ? "bg-yellow-50" : ""}`}
    >
      <div className="col-span-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/job-descriptions/${jobDescription.id}`} className="text-blue-600 hover:underline">
          {jobDescription.title}
        </Link>
        {jobDescription.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div className="col-span-2">{jobDescription.version}</div>
      <div className="col-span-2">{new Date(jobDescription.reviewDate).toLocaleDateString()}</div>
      <div className="col-span-2">{jobDescription.department}</div>
      <div className="col-span-2">
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={jobDescription.id}
                  entryType="job-description"
                  currentSectionId="job-descriptions"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(jobDescription.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[jobDescription.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], archive: true}}));
                  await onUnarchive(jobDescription.id);
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive job description ${jobDescription.title}`}
              >
                {loading[jobDescription.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[jobDescription.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], archive: true}}));
                  await onArchive(jobDescription.id);
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive job description ${jobDescription.title}`}
              >
                {loading[jobDescription.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[jobDescription.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], delete: true}}));
                  await onDelete(jobDescription.id);
                  setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], delete: false}}));
                }}
                aria-label={`Delete job description ${jobDescription.title}`}
              >
                {loading[jobDescription.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${jobDescription.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[jobDescription.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], highlight: true}}));
                    await onHighlight(jobDescription.id);
                    setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], highlight: false}}));
                  }}
                  aria-label={`${jobDescription.highlighted ? "Unhighlight" : "Highlight"} job description ${jobDescription.title}`}
                >
                  {loading[jobDescription.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${jobDescription.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[jobDescription.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], approve: true}}));
                    await onApprove(jobDescription.id);
                    setLoading(l => ({...l, [jobDescription.id]: {...l[jobDescription.id], approve: false}}));
                  }}
                  title={jobDescription.approved ? "Unapprove" : "Approve"}
                  aria-label={`${jobDescription.approved ? "Unapprove" : "Approve"} job description ${jobDescription.title}`}
                >
                  {loading[jobDescription.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionItem[]>(category.jobDescriptions || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setJobDescriptions(category.jobDescriptions || [])
  }, [category.jobDescriptions])

  // Sorting logic
  useEffect(() => {
    const sortedJobDescriptions = [...jobDescriptions]
    if (sortType === "name") {
      sortedJobDescriptions.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedJobDescriptions.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setJobDescriptions(sortedJobDescriptions)
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
      // Use the original category.jobDescriptions array for consistent ordering
      const originalJobDescriptions = category.jobDescriptions || []
      const oldIndex = originalJobDescriptions.findIndex((item: JobDescriptionItem) => item.id === active.id)
      const newIndex = originalJobDescriptions.findIndex((item: JobDescriptionItem) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find job description indices")
        return
      }

      const newOrder = arrayMove(originalJobDescriptions, oldIndex, newIndex)
      setJobDescriptions(newOrder)

      try {
        // Call the server action with the reordered IDs
        const jobDescriptionIds = newOrder.map((item) => item.id)
        const result = await reorderJobDescriptions(category.id, jobDescriptionIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setJobDescriptions(category.jobDescriptions || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder job descriptions. Please try again.")
      }
    }
  }

  const handleArchive = async (jobDescriptionId: string) => {
    try {
      await archiveItem(jobDescriptionId, "jobDescription")
      setJobDescriptions((prevJobDescriptions) => prevJobDescriptions.filter((jd) => jd.id !== jobDescriptionId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving job description:", error)
    }
  }

  const handleUnarchive = async (jobDescriptionId: string) => {
    try {
      await unarchiveItem(jobDescriptionId, "jobDescription")
      setJobDescriptions((prevJobDescriptions) => prevJobDescriptions.filter((jd) => jd.id !== jobDescriptionId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving job description:", error)
    }
  }

  const handleDelete = async (jobDescriptionId: string) => {
    if (confirm("Are you sure you want to delete this job description? This action cannot be undone.")) {
      try {
        await deleteItem(jobDescriptionId, "jobDescription")
        setJobDescriptions((prevJobDescriptions) => prevJobDescriptions.filter((jd) => jd.id !== jobDescriptionId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting job description:", error)
      }
    }
  }

  const handleApprove = async (jobDescriptionId: string) => {
    try {
      const jobDescription = jobDescriptions.find((jd) => jd.id === jobDescriptionId)
      if (jobDescription?.approved) {
        await disapproveJobDescription(jobDescriptionId)
      } else {
        await approveJobDescription(jobDescriptionId)
      }
      setJobDescriptions((prevJobDescriptions) =>
        prevJobDescriptions.map((jd) => (jd.id === jobDescriptionId ? { ...jd, approved: !jd.approved } : jd)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (jobDescriptionId: string) => {
    try {
      await toggleHighlight(jobDescriptionId, "jobDescription")
      setJobDescriptions((prevJobDescriptions) =>
        prevJobDescriptions.map((jd) => (jd.id === jobDescriptionId ? { ...jd, highlighted: !jd.highlighted } : jd)),
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
                <AddJobDescriptionDialog
                  categoryId={category.id}
                  onJobDescriptionCreated={(newJobDescription) =>
                    setJobDescriptions((prevJobDescriptions) => [...prevJobDescriptions, newJobDescription])
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
                      "Are you sure you want to delete this category and all its job descriptions? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category");
                    setJobDescriptions([]);
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

      {isExpanded && jobDescriptions && jobDescriptions.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
            <div className="col-span-4">Document</div>
            <div className="col-span-2">Issue Level</div>
            <div className="col-span-2">Issue Date</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Actions</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={jobDescriptions.map((jd) => jd.id)} strategy={verticalListSortingStrategy}>
              {jobDescriptions.map((jobDescription: JobDescriptionItem) => (
                <SortableJobDescription key={jobDescription.id} jobDescription={jobDescription}>
                  <JobDescriptionItem
                    jobDescription={jobDescription}
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
                </SortableJobDescription>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function JobDescriptionsClient({
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
          currentSectionId: "job-descriptions",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move job description: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving job description:", error)
      alert("Network error occurred while moving job description. Please check your connection and try again.")
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
    router.push(`/job-descriptions?${params.toString()}`)
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
    router.push(`/job-descriptions?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Job Descriptions</h1>
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

          {/* Add Category and New Job Description buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/job-descriptions/new">Add New</Link>
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
              ? "No archived job descriptions found."
              : "No job descriptions found. Click 'Add New' to create your first job description."}
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

function AddJobDescriptionDialog({
  categoryId,
  onJobDescriptionCreated,
}: {
  categoryId: string
  onJobDescriptionCreated: (jobDescription: JobDescriptionItem) => void
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
          <DialogTitle>Add New Job Description</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            const version = formData.get("version") as string
            const reviewDate = formData.get("reviewDate") as string
            const department = formData.get("department") as string
            const content = formData.get("content") as string

            if (title && version && reviewDate && department) {
              try {
                const result = await addJobDescription({
                  title,
                  version,
                  reviewDate,
                  department,
                  content,
                  categoryId,
                })
                if (result.success) {
                  const newJobDescription: JobDescriptionItem = {
                    id: result.jobDescription?.id || Math.random().toString(),
                    title,
                    version,
                    reviewDate,
                    department,
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onJobDescriptionCreated(newJobDescription)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add job description")
                }
              } catch (error) {
                console.error("Error adding job description:", error)
                alert("Failed to add job description. Please try again.")
              }
            } else {
              alert("All required fields must be filled.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter job description title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="version">Version</Label>
              <Input id="version" name="version" defaultValue="1.0" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                name="reviewDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue="IMS" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={3} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Job Description</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
