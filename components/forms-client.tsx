"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { FileText, Edit, Check, X, Plus, Archive, RefreshCw, GripVertical } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  toggleHighlight,
  archiveForm,
  unarchiveForm,
  deleteForm,
  archiveFormCategory,
  unarchiveFormCategory,
  deleteFormCategory,
  reorderItem,
  createForm,
  createFormCategory,
  updateFormCategory,
  approveForm,
} from "@/app/actions/form-actions"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"

// Define TypeScript interfaces for type safety
interface Form {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  retentionPeriod?: string
  highlighted: boolean
  approved: boolean
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  forms: Form[]
}

interface Section {
  id: string
  title: string
  categories: Category[]
}

function SortableForm({ form, children }: { form: Form; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: form.id })

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

function FormItem({
  form,
  categoryId,
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
  onDelete,
  onHighlight,
  onApprove,
  onArchive,
  onUnarchive,
}: {
  form: Form
  categoryId: string
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
  onDelete: (formId: string) => Promise<void>
  onHighlight: (formId: string) => Promise<void>
  onApprove: (formId: string) => Promise<void>
  onArchive: (formId: string) => Promise<void>
  onUnarchive: (formId: string) => Promise<void>
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: form.id })

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<void> => {
    if (!newCategoryId) {
      console.error("newCategoryId is required for move operation")
      alert("Invalid move operation: Category ID is required.")
      return
    }
    try {
      const response = await fetch("/api/entries/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          currentSectionId: "forms",
          newSectionId,
          newCategoryId,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move form: ${errorMessage}`)
        return
      }
      await response.json()
      // router.refresh() is already called after move
    } catch (error) {
      console.error("Error moving form:", error)
      alert("Network error occurred while moving form. Please check your connection and try again.")
    }
  }

  return (
    <div className={`grid grid-cols-5 p-2 border-b items-center ${form.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        <Link href={`/forms/${form.id}`} className="text-blue-600 hover:underline">
          {form.title}
        </Link>
        {form.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{form.version}</div>
      <div>{new Date(form.issueDate).toLocaleDateString()}</div>
      <div>{form.location}</div>
      <div className="flex justify-between">
        <span>{form.retentionPeriod || "N/A"}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" />
                </Button>
                <MoveEntryDialog
                  entryId={form.id}
                  entryType="form"
                  currentSectionId="forms"
                  currentCategoryId={categoryId}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(form.id, newSectionId, newCategoryId)}
                />
              </>
            )}
            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={async () => {
                  try {
                    await onUnarchive(form.id)
                    router.refresh()
                  } catch (error) {
                    console.error("Error unarchiving form:", error)
                    alert("Failed to unarchive form. Please try again.")
                  }
                }}
                title="Unarchive"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={async () => {
                  try {
                    await onArchive(form.id)
                    router.refresh()
                  } catch (error) {
                    console.error("Error archiving form:", error)
                    alert("Failed to archive form. Please try again.")
                  }
                }}
                title="Archive"
              >
                <Archive className="h-3 w-3" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
                    try {
                      await onDelete(form.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error deleting form:", error)
                      alert("Failed to delete form. Please try again.")
                    }
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${form.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  onClick={async () => {
                    try {
                      await onHighlight(form.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error highlighting form:", error)
                      alert("Failed to highlight form. Please try again.")
                    }
                  }}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${form.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  onClick={async () => {
                    try {
                      await onApprove(form.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error approving form:", error)
                      alert("Failed to approve form. Please try again.")
                    }
                  }}
                >
                  <Check className="h-3 w-3" />
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
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
}) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [forms, setForms] = useState<Form[]>(category.forms)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    setForms(category.forms)
  }, [category.forms])

  useEffect(() => {
    const sortedForms = [...forms]
    if (sortType === "name") {
      sortedForms.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedForms.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setForms(sortedForms)
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
      // Use the original category.forms array for consistent ordering
      const originalForms = category.forms
      const oldIndex = originalForms.findIndex((item: Form) => item.id === active.id)
      const newIndex = originalForms.findIndex((item: Form) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find form indices")
        return
      }

      const newOrder = arrayMove(originalForms, oldIndex, newIndex)
      setForms(newOrder)

      try {
        // Call the server action with the new position
        const result = await reorderItem(active.id, "form", newIndex)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setForms(category.forms)
        console.error("Failed to update order:", error)
        alert("Failed to reorder forms. Please try again.")
      }
    }
  }

  const handleCreateForm = (newForm: Form) => {
    setForms((prev) => [...prev, { ...newForm, categoryId: category.id }])
    setIsExpanded(true)
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      await deleteForm(formId)
      setForms((prev) => prev.filter((f) => f.id !== formId))
    } catch (error) {
      console.error("Error deleting form:", error)
      throw error
    }
  }

  const handleHighlightForm = async (formId: string) => {
    try {
      await toggleHighlight(formId, "form")
      setForms((prev) => prev.map((f) => (f.id === formId ? { ...f, highlighted: !f.highlighted } : f)))
    } catch (error) {
      console.error("Error highlighting form:", error)
      throw error
    }
  }

  const handleApproveForm = async (formId: string) => {
    try {
      await approveForm(formId)
      setForms((prev) => prev.map((f) => (f.id === formId ? { ...f, approved: !f.approved } : f)))
    } catch (error) {
      console.error("Error approving form:", error)
      throw error
    }
  }

  const handleArchiveForm = async (formId: string) => {
    try {
      await archiveForm(formId)
      router.refresh()
    } catch (error) {
      console.error("Error archiving form:", error)
      throw error
    }
  }

  const handleUnarchiveForm = async (formId: string) => {
    try {
      await unarchiveForm(formId)
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving form:", error)
      throw error
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
                <AddFormDialog categoryId={category.id} onFormCreated={handleCreateForm} />
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
              onClick={async () => {
                try {
                  await toggleHighlight(category.id, "category")
                  router.refresh()
                } catch (error) {
                  console.error("Error highlighting category:", error)
                  alert("Failed to highlight category. Please try again.")
                }
              }}
            >
              <div className="h-3 w-3 bg-yellow-500"></div>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`h-6 w-6 ${isArchived ? "bg-blue-500" : "bg-gray-600"} text-white border-none`}
              onClick={async () => {
                try {
                  if (isArchived) {
                    await unarchiveFormCategory(category.id)
                  } else {
                    await archiveFormCategory(category.id)
                  }
                  router.refresh()
                } catch (error) {
                  console.error("Error archiving/unarchiving category:", error)
                  alert("Failed to archive/unarchive category. Please try again.")
                }
              }}
              title={isArchived ? "Restore this category" : "Archive this category"}
            >
              <Archive className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its forms? This action cannot be undone.",
                    )
                  ) {
                    try {
                      await deleteFormCategory(category.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error deleting category:", error)
                      alert("Failed to delete category. Please try again.")
                    }
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && forms.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-5 bg-gray-100 p-2 border-b">
            <div>Form</div>
            <div>Version</div>
            <div>Issue Date</div>
            <div>Location</div>
            <div>Retention Period</div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={forms.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {forms.map((form: Form) => (
                <SortableForm key={form.id} form={form}>
                  <FormItem
                    form={form}
                    categoryId={category.id}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    isArchived={isArchived}
                    onMove={onMove}
                    sections={sections}
                    isLoading={isLoading}
                    onDelete={handleDeleteForm}
                    onHighlight={handleHighlightForm}
                    onApprove={handleApproveForm}
                    onArchive={handleArchiveForm}
                    onUnarchive={handleUnarchiveForm}
                  />
                </SortableForm>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function FormsClient({
  categories,
  canEdit,
  canDelete,
  showArchived = false,
}: {
  categories: Category[]
  canEdit: boolean
  canDelete: boolean
  showArchived?: boolean
}) {
  const router = useRouter()
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/sections")
        if (!response.ok) {
          throw new Error(`Failed to fetch sections: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setSections(data)
      } catch (error) {
        console.error("Error fetching sections:", error)
        alert("Failed to load sections. Some features may not work properly.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSections()
  }, [])

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<void> => {
    if (!newCategoryId) {
      console.error("newCategoryId is required for move operation")
      alert("Invalid move operation: Category ID is required.")
      return
    }
    try {
      const response = await fetch("/api/entries/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          currentSectionId: "forms",
          newSectionId,
          newCategoryId,
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move form: ${errorMessage}`)
        return
      }
      await response.json()
      // router.refresh() is already called after move
    } catch (error) {
      console.error("Error moving form:", error)
      alert("Network error occurred while moving form. Please check your connection and try again.")
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 mr-2" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Forms</h1>
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <AddCategoryDialog />
            <Button
              variant="outline"
              onClick={() => {
                router.push(showArchived ? "/forms" : "/forms?showArchived=true")
              }}
            >
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
            <Link href="/forms/new">
              <Button>Add New</Button>
            </Link>
          </div>
        )}
      </div>

      {isLoading && <div className="my-4"><Skeleton className="h-16 w-full rounded" /></div>}

      {categories.map((category) => (
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
      ))}

      {categories.length === 0 && (
        <div className="text-center p-8 border rounded-md mt-4">
          <p className="text-gray-500">
            {showArchived ? "No archived forms found." : "No forms found. Click 'Add Category' to get started."}
          </p>
        </div>
      )}
    </div>
  )
}

// Add Category Dialog Component
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
                await createFormCategory(formData)
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

// Edit Category Dialog Component
function EditCategoryDialog({ category }: { category: Category }) {
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-gray-600 text-white border-none">
          <Edit className="h-3 w-3" />
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
                await updateFormCategory(category.id, formData)
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

// Add Form Dialog Component
function AddFormDialog({ categoryId, onFormCreated }: { categoryId: string; onFormCreated: (form: Form) => void }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-6 w-6 bg-green-500 text-white border-none">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Form</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                const newFormData = new FormData()
                newFormData.append("title", title)
                newFormData.append("version", "1")
                newFormData.append("issueDate", new Date().toISOString().split("T")[0])
                newFormData.append("location", "IMS")
                newFormData.append("categoryId", categoryId)
                newFormData.append("retentionPeriod", (formData.get("retentionPeriod") as string) || "")

                await createForm(newFormData)
                const newForm: Form = {
                  id: Math.random().toString(),
                  title,
                  version: "1",
                  issueDate: new Date().toISOString().split("T")[0],
                  location: "IMS",
                  retentionPeriod: (formData.get("retentionPeriod") as string) || "",
                  highlighted: false,
                  approved: false,
                }
                onFormCreated(newForm)
                setIsOpen(false)
                router.refresh()
              } catch (error) {
                console.error("Error adding form:", error)
                alert("Failed to add form. Please try again.")
              }
            } else {
              alert("Form title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Form Title</Label>
              <Input id="title" name="title" placeholder="Enter form title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="retentionPeriod">Retention Period</Label>
              <Input id="retentionPeriod" name="retentionPeriod" placeholder="e.g. 3 years" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Form</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
