"use client"

import { useState, useEffect } from "react"
import { FileText, ArrowUpDown, Edit, Check, X, Plus, Archive, RefreshCw, GripVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  toggleHighlight,
  approveManual,
  archiveItem,
  unarchiveItem,
  deleteItem,
  reorderItem,
  addManual,
  addCategory,
  editCategory,
} from "@/app/actions/manual-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Textarea } from "@/components/ui/textarea"
import { SortButtons, SortType, SortDirection } from "@/components/ui/sort-buttons"
import { Loader } from '@/components/ui/loader'

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
}

interface ManualsClientProps {
  categories: any[]
  archivedCategories: any[]
  canEdit: boolean
  canDelete: boolean
}

interface Manual {
  id: string
  title: string
  versions: any[]
  highlighted: boolean
  approved: boolean
  version: string
  issueDate: string
  location: string
}

interface ManualResponse {
  success: boolean
  manual?: Manual
  error?: string
}

export default function ManualsClient({
  categories: initialCategories,
  archivedCategories: initialArchivedCategories,
  canEdit,
  canDelete,
}: ManualsClientProps) {
  const [showArchived, setShowArchived] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [archivedCategories, setArchivedCategories] = useState<any[]>(initialArchivedCategories)
  const router = useRouter()

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

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string) => {
    const response = await fetch("/api/entries/move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entryId,
        currentSectionId: "manuals",
        newSectionId,
        newCategoryId,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to move entry")
    }
  }

  // Handler to update category highlight state locally
  const handleCategoryHighlight = async (categoryId: string) => {
    await toggleHighlight(categoryId, "category")
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, highlighted: !cat.highlighted } : cat
      )
    )
  }

  // Handler to delete a category and update local state
  const handleDeleteCategory = async (categoryId: string) => {
    await deleteItem(categoryId, "category")
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }

  // Handler to archive a category and update local state
  const handleArchiveCategory = async (categoryId: string) => {
    await archiveItem(categoryId, "category")
    const categoryToArchive = categories.find((cat) => cat.id === categoryId)
    if (categoryToArchive) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      setArchivedCategories((prev) => [...prev, { ...categoryToArchive, archived: true }])
    }
  }

  // Handler to unarchive a category and update local state
  const handleUnarchiveCategory = async (categoryId: string) => {
    await unarchiveItem(categoryId, "category")
    const categoryToUnarchive = archivedCategories.find((cat) => cat.id === categoryId)
    if (categoryToUnarchive) {
      setArchivedCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      setCategories((prev) => [...prev, { ...categoryToUnarchive, archived: false }])
    }
  }

  // Handler to edit a category and update local state
  const handleEditCategory = async (categoryId: string, newTitle: string) => {
    await editCategory(categoryId, newTitle)
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, title: newTitle } : cat
      )
    )
  }

  // Handler to add a category and update local state
  const handleAddCategory = async (title: string) => {
    const result = await addCategory(title)
    if (result.success) {
      setCategories((prev) => [
        ...prev,
        { id: Math.random().toString(), title, manuals: [], highlighted: false, archived: false }
      ])
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" message="Loading manuals..." />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Manuals</h1>
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <AddCategoryDialog onAddCategory={handleAddCategory} />
            <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
              {showArchived ? "Show Active" : "Show Archived"}
            </Button>
            <Link href="/manual/new">
              <Button>Add New</Button>
            </Link>
          </div>
        )}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              canEdit={canEdit}
              canDelete={canDelete}
              isArchived={false}
              onMove={handleMove}
              sections={sections}
              isLoading={isLoading}
              onCategoryHighlight={handleCategoryHighlight}
              onDeleteCategory={handleDeleteCategory}
              onArchiveCategory={handleArchiveCategory}
              onEditCategory={handleEditCategory}
            />
          ))}
        </TabsContent>

        <TabsContent value="archived">
          {archivedCategories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              canEdit={canEdit}
              canDelete={canDelete}
              isArchived={true}
              onMove={handleMove}
              sections={sections}
              isLoading={isLoading}
              onCategoryHighlight={() => {}}
              onUnarchiveCategory={handleUnarchiveCategory}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CategorySectionProps {
  category: any
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
  onCategoryHighlight?: (categoryId: string) => void
  onDeleteCategory?: (categoryId: string) => void
  onArchiveCategory?: (categoryId: string) => void
  onUnarchiveCategory?: (categoryId: string) => void
  onEditCategory?: (categoryId: string, newTitle: string) => void
}

function SortableManual({ manual, children }: { manual: Manual, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: manual.id })

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

function ManualItem({ 
  manual, 
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
  onArchive,
  onUnarchive,
  onCreate,
  onDelete,
  onApprove,
  onHighlight,
  categoryId,
}: { 
  manual: Manual
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
  onArchive: (id: string) => Promise<void>
  onUnarchive: (id: string) => Promise<void>
  onCreate: (manual: Manual) => void
  onDelete: (id: string) => Promise<void>
  onApprove: (id: string, currentApproved: boolean) => Promise<void>
  onHighlight: (manualId: string) => void
  categoryId: string
}) {
  const { attributes, listeners } = useSortable({ id: manual.id })
  // Local loading states for each action
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${manual.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        <Link href={`/manual/${manual.id}`} className="text-blue-600 hover:underline">
          {manual.title}
        </Link>
        {manual.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{manual.version}</div>
      <div>{new Date(manual.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{manual.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 cursor-grab"
                  {...attributes}
                  {...listeners}
                  disabled={loadingAction === 'move'}
                  onMouseDown={() => setLoadingAction('move')}
                  onMouseUp={() => setLoadingAction(null)}
                >
                  {loadingAction === 'move' ? <Loader size="sm" ariaLabel="Moving..." /> : <GripVertical className="h-3 w-3" />}
                </Button>
                <MoveEntryDialog
                  entryId={manual.id}
                  entryType="manual"
                  currentSectionId="manuals"
                  currentCategoryId={categoryId}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={async (newSectionId, newCategoryId) => {
                    setLoadingAction('move')
                    await onMove(manual.id, newSectionId, newCategoryId)
                    setLoadingAction(null)
                  }}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={async () => {
                  setLoadingAction('unarchive')
                  await onUnarchive(manual.id)
                  setLoadingAction(null)
                }}
                title="Unarchive"
                disabled={loadingAction === 'unarchive'}
              >
                {loadingAction === 'unarchive' ? <Loader size="sm" ariaLabel="Unarchiving..." /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={async () => {
                  setLoadingAction('archive')
                  await onArchive(manual.id)
                  setLoadingAction(null)
                }}
                title="Archive"
                disabled={loadingAction === 'archive'}
              >
                {loadingAction === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-3 w-3" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this manual? This action cannot be undone.")) {
                    setLoadingAction('delete')
                    await onDelete(manual.id)
                    setLoadingAction(null)
                  }
                }}
                disabled={loadingAction === 'delete'}
              >
                {loadingAction === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <X className="h-3 w-3" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${manual.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  onClick={async () => {
                    setLoadingAction('highlight')
                    await onHighlight(manual.id)
                    setLoadingAction(null)
                  }}
                  disabled={loadingAction === 'highlight'}
                >
                  {loadingAction === 'highlight' ? <Loader size="sm" ariaLabel="Highlighting..." /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${manual.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  onClick={async () => {
                    setLoadingAction('approve')
                    await onApprove(manual.id, manual.approved)
                    setLoadingAction(null)
                  }}
                  disabled={loadingAction === 'approve'}
                >
                  {loadingAction === 'approve' ? <Loader size="sm" ariaLabel="Approving..." /> : <Check className="h-3 w-3" />}
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
  onCategoryHighlight,
  onDeleteCategory,
  onArchiveCategory,
  onUnarchiveCategory,
  onEditCategory,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [manuals, setManuals] = useState<Manual[]>(category.manuals)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  // For category-level actions, add similar local loading state and loader feedback
  const [categoryLoadingAction, setCategoryLoadingAction] = useState<string | null>(null)

  // Sorting logic
  useEffect(() => {
    let sortedManuals = [...manuals]
    if (sortType === "name") {
      sortedManuals.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedManuals.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setManuals(sortedManuals)
  }, [sortType, sortDirection])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = manuals.findIndex((item: Manual) => item.id === active.id)
      const newIndex = manuals.findIndex((item: Manual) => item.id === over.id)
      
      const newOrder = arrayMove(manuals, oldIndex, newIndex)
      setManuals(newOrder)

      try {
        const updates = newOrder.map((manual, index) => 
          reorderItem(manual.id, "manual", index === 0 ? "up" : "down")
        )
        await Promise.all(updates)
      } catch (error) {
        setManuals(category.manuals)
        console.error('Failed to update order:', error)
      }
    }
  }

  const handleMove = async (manualId: string, newSectionId: string, newCategoryId: string): Promise<void> => {
    try {
      await onMove(manualId, newSectionId, newCategoryId)
      setManuals(manuals.filter((m: Manual) => m.id !== manualId))
    } catch (error) {
      console.error("Error moving manual:", error)
      throw error
    }
  }

  const handleArchive = async (manualId: string): Promise<void> => {
    await archiveItem(manualId, "manual")
    setManuals((prevManuals: Manual[]) => prevManuals.filter((m: Manual) => m.id !== manualId))
  }

  const handleUnarchive = async (manualId: string): Promise<void> => {
    await unarchiveItem(manualId, "manual")
    setManuals((prevManuals: Manual[]) => prevManuals.filter((m: Manual) => m.id !== manualId))
  }

  const handleCreate = async (newManual: Manual): Promise<void> => {
    setManuals((prevManuals: Manual[]) => [...prevManuals, newManual])
    setIsExpanded(true)
  }

  const handleDelete = async (manualId: string): Promise<void> => {
    try {
      await deleteItem(manualId, "manual")
      setManuals(manuals.filter((m: Manual) => m.id !== manualId))
    } catch (error) {
      console.error("Error deleting manual:", error)
    }
  }

  const handleApprove = async (manualId: string, currentApproved: boolean): Promise<void> => {
    try {
      await approveManual(manualId)
      setManuals(manuals.map((m: Manual) => 
        m.id === manualId ? { ...m, approved: !currentApproved } : m
      ))
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (manualId: string) => {
    await toggleHighlight(manualId, "manual")
    setManuals((prevManuals: Manual[]) =>
      prevManuals.map((m: Manual) =>
        m.id === manualId ? { ...m, highlighted: !m.highlighted } : m
      )
    )
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
                <EditCategoryDialog category={category} onEditCategory={onEditCategory} />
                <AddManualDialog categoryId={category.id} onManualCreated={handleCreate} />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={async () => {
                  setCategoryLoadingAction('unarchive')
                  if (onUnarchiveCategory) {
                    await onUnarchiveCategory(category.id)
                  }
                  setCategoryLoadingAction(null)
                }}
                title="Unarchive"
                disabled={categoryLoadingAction === 'unarchive'}
              >
                {categoryLoadingAction === 'unarchive' ? <Loader size="sm" ariaLabel="Unarchiving..." /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-gray-600 text-white border-none"
                onClick={async () => {
                  setCategoryLoadingAction('archive')
                  if (onArchiveCategory) {
                    await onArchiveCategory(category.id)
                  }
                  setCategoryLoadingAction(null)
                }}
                title="Archive"
                disabled={categoryLoadingAction === 'archive'}
              >
                {categoryLoadingAction === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-3 w-3" />}
              </Button>
            )}

            {!isArchived && (
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
                onClick={async () => {
                  setCategoryLoadingAction('highlight')
                  if (onCategoryHighlight) {
                    await onCategoryHighlight(category.id)
                  }
                  setCategoryLoadingAction(null)
                }}
                disabled={categoryLoadingAction === 'highlight'}
              >
                {categoryLoadingAction === 'highlight' ? <Loader size="sm" ariaLabel="Highlighting..." /> : <div className="h-3 w-3 bg-yellow-500"></div>}
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
                      "Are you sure you want to delete this category and all its manuals? This action cannot be undone."
                    )
                  ) {
                    setCategoryLoadingAction('delete')
                    if (onDeleteCategory) {
                      await onDeleteCategory(category.id)
                    }
                    setCategoryLoadingAction(null)
                  }
                }}
                disabled={categoryLoadingAction === 'delete'}
              >
                {categoryLoadingAction === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <X className="h-3 w-3" />}
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && manuals.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Manual</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={manuals} strategy={verticalListSortingStrategy}>
              {manuals.map((manual: Manual) => (
                <SortableManual key={manual.id} manual={manual}>
                  <ManualItem
                    manual={manual}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    isArchived={isArchived}
                    onMove={handleMove}
                    sections={sections}
                    isLoading={isLoading}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onCreate={handleCreate}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onHighlight={isArchived ? () => {} : handleHighlight}
                    categoryId={category.id}
                  />
                </SortableManual>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

function AddCategoryDialog({ onAddCategory }: { onAddCategory: (title: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            const formData = new FormData(e.currentTarget);
            const title = formData.get("title") as string;
            if (title) {
              await onAddCategory(title);
              setIsOpen(false);
            }
            setIsSubmitting(false);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" placeholder="Enter category title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader size="sm" ariaLabel="Adding..." /> : "Add Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({ category, onEditCategory }: { category: any, onEditCategory?: (categoryId: string, newTitle: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            const formData = new FormData(e.currentTarget);
            const title = formData.get("title") as string;
            if (title && onEditCategory) {
              await onEditCategory(category.id, title);
            }
            setIsSubmitting(false);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" defaultValue={category.title} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddManualDialog({ categoryId, onManualCreated }: { categoryId: string, onManualCreated: (manual: Manual) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-green-500 text-white border-none"
          aria-label="Add new Manual"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Manual</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setIsSubmitting(true);
            const formData = new FormData(e.currentTarget);
            try {
              const result = await addManual({
                title: formData.get("title") as string,
                version: "1.0",
                issueDate: new Date().toISOString(),
                location: "Default Location",
                content: "",
                categoryId: categoryId,
                order: 0,
                highlighted: false,
                approved: false,
                archived: false
              }) as ManualResponse

              if (result.success && result.manual) {
                onManualCreated(result.manual)
                setIsOpen(false)
              }
            } catch (error) {
              console.error("Error creating manual:", error)
            }
            setIsSubmitting(false);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Manual Title</Label>
              <Input id="title" name="title" placeholder="Enter manual title" required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader size="sm" ariaLabel="Adding..." /> : "Add Manual"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
