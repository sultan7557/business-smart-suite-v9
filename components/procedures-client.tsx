"use client"

import { Button } from "@/components/ui/button"
import { FileText, Edit, Check, X, Plus, Archive, RefreshCw, GripVertical } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  toggleHighlight,
  archiveProcedure,
  unarchiveProcedure,
  deleteProcedure,
  archiveProcedureCategory,
  unarchiveProcedureCategory,
  deleteProcedureCategory,
  reorderItem,
  createProcedure,
  createProcedureCategory,
  updateProcedureCategory,
} from "@/app/actions/procedure-actions"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MoveEntryDialog from "@/components/move-entry-dialog"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SortButtons, SortType, SortDirection } from "@/components/ui/sort-buttons"
import { Loader } from "@/components/ui/loader"
import { Skeleton } from "@/components/ui/skeleton"

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  procedures?: Procedure[]
  archived?: boolean
  highlighted?: boolean
}

interface Procedure {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  highlighted: boolean
  approved: boolean
  archived?: boolean
  categoryId?: string
}

interface ProcedureResponse {
  success: boolean
  procedure?: Procedure
  error?: string
}

interface CategoryResponse {
  success: boolean
  category?: Category
  error?: string
}

export default function ProceduresClient({
  categories: initialCategories,
  canEdit,
  canDelete,
}: {
  categories: any[]
  canEdit: boolean
  canDelete: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/sections")
        if (!response.ok) throw new Error("Failed to fetch sections")
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
    try {
      const response = await fetch("/api/entries/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, currentSectionId: "procedures", newSectionId, newCategoryId }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to move entry")
      }
      setCategories(prev => prev.map(cat => ({
        ...cat,
        procedures: cat.procedures?.filter(proc => proc.id !== entryId) || []
      })))
      router.refresh()
    } catch (error) {
      console.error("Error moving entry:", error)
      throw error
    }
  }

  const handleAddCategory = async (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory])
  }

  const handleAddProcedure = async (categoryId: string, newProcedure: Procedure) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, procedures: [...(cat.procedures || []), newProcedure] } : cat
    ))
  }

  const handleArchiveCategory = async (categoryId: string) => {
    try {
      await archiveProcedureCategory(categoryId)
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, archived: true } : cat
      ))
    } catch (error) {
      console.error('Error archiving category:', error)
    }
  }

  const handleUnarchiveCategory = async (categoryId: string) => {
    try {
      await unarchiveProcedureCategory(categoryId)
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, archived: false } : cat
      ))
    } catch (error) {
      console.error('Error unarchiving category:', error)
    }
  }

  const handleUpdateCategory = async (categoryId: string, updatedData: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, ...updatedData } : cat
    ))
  }

  const handleUpdateProcedure = async (procedureId: string, updatedData: Partial<Procedure>) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      procedures: cat.procedures?.map(proc => 
        proc.id === procedureId ? { ...proc, ...updatedData } : proc
      ) || []
    })))
  }

  const handleRemoveProcedure = async (procedureId: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      procedures: cat.procedures?.filter(proc => proc.id !== procedureId) || []
    })))
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Procedures</h1>
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <AddCategoryDialog onCategoryCreated={handleAddCategory} />
            <Link href="/procedures/new">
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
          {isLoading && <div className="my-4"><Skeleton className="h-16 w-full rounded" /></div>}
          {categories.filter(cat => !cat.archived).map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              canEdit={canEdit}
              canDelete={canDelete}
              isArchived={false}
              onMove={handleMove}
              sections={sections}
              isLoading={isLoading}
              onAddProcedure={handleAddProcedure}
              onArchiveCategory={handleArchiveCategory}
              onUnarchiveCategory={handleUnarchiveCategory}
              onUpdateCategory={handleUpdateCategory}
              onUpdateProcedure={handleUpdateProcedure}
              onRemoveProcedure={handleRemoveProcedure}
            />
          ))}
        </TabsContent>

        <TabsContent value="archived">
          {isLoading && <div className="my-4"><Skeleton className="h-16 w-full rounded" /></div>}
          {categories.filter(cat => cat.procedures?.some(proc => proc.archived)).map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              canEdit={canEdit}
              canDelete={canDelete}
              isArchived={true}
              onMove={handleMove}
              sections={sections}
              isLoading={isLoading}
              onAddProcedure={handleAddProcedure}
              onArchiveCategory={handleArchiveCategory}
              onUnarchiveCategory={handleUnarchiveCategory}
              onUpdateCategory={handleUpdateCategory}
              onUpdateProcedure={handleUpdateProcedure}
              onRemoveProcedure={handleRemoveProcedure}
            />
          ))}
        </TabsContent>
      </Tabs>

      {categories.length === 0 && (
        <div className="text-center p-8 border rounded-md mt-4">
          <p className="text-gray-500">
            No procedures found. Click 'Add New' to create your first procedure.
          </p>
        </div>
      )}
    </div>
  )
}

function SortableProcedure({ procedure, children }: { procedure: Procedure, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: procedure.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <div ref={setNodeRef} style={style}>{children}</div>
}

function CategorySection({
  category,
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
  onAddProcedure,
  onArchiveCategory,
  onUnarchiveCategory,
  onUpdateCategory,
  onUpdateProcedure,
  onRemoveProcedure,
}: {
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
  onAddProcedure: (categoryId: string, newProcedure: Procedure) => Promise<void>
  onArchiveCategory: (categoryId: string) => Promise<void>
  onUnarchiveCategory: (categoryId: string) => Promise<void>
  onUpdateCategory: (categoryId: string, updatedData: Partial<Category>) => Promise<void>
  onUpdateProcedure: (procedureId: string, updatedData: Partial<Procedure>) => Promise<void>
  onRemoveProcedure: (procedureId: string) => Promise<void>
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [procedures, setProcedures] = useState<Procedure[]>(category.procedures || [])
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [isOperationLoading, setIsOperationLoading] = useState(false)

  const filteredProcedures = procedures.filter(proc => isArchived ? proc.archived : !proc.archived)

  useEffect(() => {
    let sortedProcedures = [...filteredProcedures]
    if (sortType === "name") {
      sortedProcedures.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedProcedures.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setProcedures(prev => {
      const otherProcedures = prev.filter(proc => isArchived ? !proc.archived : proc.archived)
      return [...otherProcedures, ...sortedProcedures]
    })
  }, [sortType, sortDirection, isArchived])

  useEffect(() => {
    setProcedures(category.procedures || [])
  }, [category.procedures])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = filteredProcedures.findIndex((item: Procedure) => item.id === active.id)
      const newIndex = filteredProcedures.findIndex((item: Procedure) => item.id === over.id)
      const newOrder = arrayMove(filteredProcedures, oldIndex, newIndex)
      setProcedures(prev => {
        const otherProcedures = prev.filter(proc => isArchived ? !proc.archived : proc.archived)
        return [...otherProcedures, ...newOrder]
      })
      try {
        const updates = newOrder.map((procedure, index) => 
          reorderItem(procedure.id, "procedure", index === 0 ? "up" : "down")
        )
        await Promise.all(updates)
      } catch (error) {
        setProcedures(category.procedures || [])
        console.error('Failed to update order:', error)
      }
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    setIsOperationLoading(true)
    try {
      await deleteProcedureCategory(categoryId)
      window.location.reload()
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleHighlightCategory = async (categoryId: string) => {
    setIsOperationLoading(true)
    try {
      await toggleHighlight(categoryId, "category")
      await onUpdateCategory(categoryId, { highlighted: !category.highlighted })
    } catch (error) {
      console.error('Error highlighting category:', error)
    } finally {
      setIsOperationLoading(false)
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
            {isOperationLoading && <Loader size="sm" />}
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
                <EditCategoryDialog category={category} onCategoryUpdated={onUpdateCategory} />
                <AddProcedureDialog categoryId={category.id} onProcedureCreated={onAddProcedure} />
              </>
            )}
            {category.archived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={() => onUnarchiveCategory(category.id)}
                title="Unarchive"
                disabled={isOperationLoading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-gray-600 text-white border-none"
                onClick={() => onArchiveCategory(category.id)}
                title="Archive"
                disabled={isOperationLoading}
              >
                <Archive className="h-3 w-3" />
              </Button>
            )}
            {!isArchived && (
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
                onClick={() => handleHighlightCategory(category.id)}
                disabled={isOperationLoading}
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
                  if (confirm("Are you sure you want to delete this category and all its procedures? This action cannot be undone.")) {
                    await handleDeleteCategory(category.id)
                  }
                }}
                disabled={isOperationLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && filteredProcedures.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Procedure</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredProcedures.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {filteredProcedures.map((procedure: Procedure) => (
                <SortableProcedure key={procedure.id} procedure={procedure}>
                  <ProcedureItem
                    procedure={procedure}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    isArchived={isArchived}
                    onMove={onMove}
                    sections={sections}
                    isLoading={isLoading}
                    onUpdateProcedure={onUpdateProcedure}
                    onRemoveProcedure={onRemoveProcedure}
                  />
                </SortableProcedure>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

function ProcedureItem({
  procedure,
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
  onUpdateProcedure,
  onRemoveProcedure,
}: {
  procedure: Procedure
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
  sections: Section[]
  isLoading: boolean
  onUpdateProcedure: (procedureId: string, updatedData: Partial<Procedure>) => Promise<void>
  onRemoveProcedure: (procedureId: string) => Promise<void>
}) {
  const { attributes, listeners } = useSortable({ id: procedure.id })
  const [isOperationLoading, setIsOperationLoading] = useState(false)

  const handleUnarchive = async (id: string) => {
    setIsOperationLoading(true)
    try {
      await unarchiveProcedure(id)
      await onUpdateProcedure(id, { archived: false })
    } catch (error) {
      console.error('Error unarchiving procedure:', error)
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    setIsOperationLoading(true)
    try {
      await archiveProcedure(id)
      await onUpdateProcedure(id, { archived: true })
    } catch (error) {
      console.error('Error archiving procedure:', error)
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsOperationLoading(true)
    try {
      await deleteProcedure(id)
      await onRemoveProcedure(id)
    } catch (error) {
      console.error('Error deleting procedure:', error)
    } finally {
      setIsOperationLoading(false)
    }
  }

  const handleHighlight = async (id: string) => {
    setIsOperationLoading(true)
    try {
      await toggleHighlight(id, "procedure")
      await onUpdateProcedure(id, { highlighted: !procedure.highlighted })
    } catch (error) {
      console.error('Error highlighting procedure:', error)
    } finally {
      setIsOperationLoading(false)
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${procedure.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        <Link href={`/procedures/${procedure.id}`} className="text-blue-600 hover:underline">
          {procedure.title}
        </Link>
        {procedure.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{procedure.version}</div>
      <div>{new Date(procedure.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{procedure.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {isOperationLoading && <Loader size="sm" />}
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" />
                </Button>
                <MoveEntryDialog
                  entryId={procedure.id}
                  entryType="procedure"
                  currentSectionId="procedures"
                  currentCategoryId={procedure.categoryId || ""}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => onMove(procedure.id, newSectionId, newCategoryId)}
                />
              </>
            )}
            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                onClick={() => handleUnarchive(procedure.id)}
                title="Unarchive"
                disabled={isOperationLoading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleArchive(procedure.id)}
                title="Archive"
                disabled={isOperationLoading}
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
                  if (confirm("Are you sure you want to delete this procedure? This action cannot be undone.")) {
                    await handleDelete(procedure.id)
                  }
                }}
                disabled={isOperationLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            {!isArchived && (
              <Button
                variant="outline"
                size="icon"
                className={`h-6 w-6 ${procedure.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                onClick={() => handleHighlight(procedure.id)}
                disabled={isOperationLoading}
              >
                <div className="h-3 w-3 bg-yellow-500"></div>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AddCategoryDialog({ onCategoryCreated }: { onCategoryCreated: (category: Category) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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
          action={async (formData) => {
            setIsLoading(true)
            try {
              const title = formData.get("title") as string
              const highlighted = formData.get("highlighted") === "on"
              if (title) {
                const result = await createProcedureCategory(formData) as CategoryResponse
                if (result.success && result.category) {
                  await onCategoryCreated({ ...result.category, highlighted, procedures: [] })
                  setIsOpen(false)
                }
              }
            } catch (error) {
              console.error("Error adding category:", error)
            } finally {
              setIsLoading(false)
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" placeholder="Enter category title" disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="highlighted" name="highlighted" className="rounded border-gray-300" disabled={isLoading} />
              <Label htmlFor="highlighted">Highlight this category</Label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader variant="overlay" message="Saving..." /> : null}
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditCategoryDialog({ 
  category, 
  onCategoryUpdated 
}: { 
  category: Category
  onCategoryUpdated: (categoryId: string, updatedData: Partial<Category>) => Promise<void>
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            setIsLoading(true)
            try {
              const title = formData.get("title") as string
              const highlighted = formData.get("highlighted") === "on"
              await updateProcedureCategory(category.id, formData)
              await onCategoryUpdated(category.id, { title: title || category.title, highlighted })
              setIsOpen(false)
            } catch (error) {
              console.error("Error updating category:", error)
            } finally {
              setIsLoading(false)
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Category Title</Label>
              <Input id="title" name="title" defaultValue={category.title} disabled={isLoading} />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="highlighted" 
                name="highlighted" 
                className="rounded border-gray-300"
                defaultChecked={category.highlighted} 
                disabled={isLoading}
              />
              <Label htmlFor="highlighted">Highlight this category</Label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader variant="overlay" message="Saving..." /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddProcedureDialog({ 
  categoryId, 
  onProcedureCreated 
}: { 
  categoryId: string
  onProcedureCreated: (categoryId: string, newProcedure: Procedure) => Promise<void>
}) {
  const [isLoading, setIsLoading] = useState(false)
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
          <DialogTitle>Add New Procedure</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            setIsLoading(true)
            try {
              const title = formData.get("title") as string
              if (title) {
                const newFormData = new FormData()
                newFormData.append("title", title)
                newFormData.append("version", "1")
                newFormData.append("issueDate", new Date().toISOString().split("T")[0])
                newFormData.append("location", "IMS")
                newFormData.append("categoryId", categoryId)
                const result = await createProcedure(newFormData) as unknown as ProcedureResponse
                if (result.success && result.procedure) {
                  let issueDateStr = result.procedure.issueDate
                  if (typeof issueDateStr !== 'string') {
                    issueDateStr = new Date(issueDateStr).toISOString()
                  }
                  const procedure = {
                    ...result.procedure,
                    issueDate: issueDateStr,
                  }
                  await onProcedureCreated(categoryId, procedure)
                  setIsOpen(false)
                }
              }
            } catch (error) {
              console.error("Error adding procedure:", error)
            } finally {
              setIsLoading(false)
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Procedure Title</Label>
              <Input id="title" name="title" placeholder="Enter procedure title" disabled={isLoading} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader variant="overlay" message="Saving..." /> : null}
              Add Procedure
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}