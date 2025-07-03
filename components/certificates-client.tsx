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
  addCertificate,
  addCategory,
  editCategory,
  approveCertificate,
} from "@/app/actions/certificate-actions"
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

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  certificates: Certificate[]
}

interface Certificate {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  approved: boolean
  highlighted: boolean
}

function SortableCertificate({ certificate, children }: { certificate: Certificate; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: certificate.id })

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

function CertificateItem({
  certificate,
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
  certificate: Certificate
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (certificateId: string) => void
  onUnarchive: (certificateId: string) => void
  onDelete: (certificateId: string) => void
  onApprove: (certificateId: string) => void
  onHighlight: (certificateId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: certificate.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move certificate")
        alert("Failed to move certificate. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the certificate. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${certificate.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/certificate/${certificate.id}`} className="text-blue-600 hover:underline">
          {certificate.title}
        </Link>
        {certificate.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{certificate.version}</div>
      <div>{new Date(certificate.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{certificate.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={certificate.id}
                  entryType="certificate"
                  currentSectionId="certificates"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(certificate.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[certificate.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], archive: true}}));
                  await onUnarchive(certificate.id);
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive certificate ${certificate.title}`}
              >
                {loading[certificate.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                disabled={loading[certificate.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], archive: true}}));
                  await onArchive(certificate.id);
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], archive: false}}));
                }}
                title="Archive"
                aria-label={`Archive certificate ${certificate.title}`}
              >
                {loading[certificate.id]?.archive ? <Spinner size="sm" /> : <Archive className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                disabled={loading[certificate.id]?.delete}
                onClick={async () => {
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], delete: true}}));
                  await onDelete(certificate.id);
                  setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], delete: false}}));
                }}
                aria-label={`Delete certificate ${certificate.title}`}
              >
                {loading[certificate.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${certificate.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  disabled={loading[certificate.id]?.highlight}
                  onClick={async () => {
                    setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], highlight: true}}));
                    await onHighlight(certificate.id);
                    setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], highlight: false}}));
                  }}
                  aria-label={`${certificate.highlighted ? "Unhighlight" : "Highlight"} certificate ${certificate.title}`}
                >
                  {loading[certificate.id]?.highlight ? <Spinner size="sm" /> : <div className="h-3 w-3 bg-yellow-500"></div>}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${certificate.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  disabled={loading[certificate.id]?.approve}
                  onClick={async () => {
                    setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], approve: true}}));
                    await onApprove(certificate.id);
                    setLoading(l => ({...l, [certificate.id]: {...l[certificate.id], approve: false}}));
                  }}
                  title={certificate.approved ? "Unapprove" : "Approve"}
                  aria-label={`${certificate.approved ? "Unapprove" : "Approve"} certificate ${certificate.title}`}
                >
                  {loading[certificate.id]?.approve ? <Spinner size="sm" /> : <Check className="h-3 w-3" aria-hidden="true" />}
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
  const [certificates, setCertificates] = useState<Certificate[]>(category.certificates)
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setCertificates(category.certificates)
  }, [category.certificates])

  // Sorting logic
  useEffect(() => {
    const sortedCertificates = [...certificates]
    if (sortType === "name") {
      sortedCertificates.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedCertificates.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setCertificates(sortedCertificates)
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
      // Use the original category.certificates array for consistent ordering
      const originalCertificates = category.certificates
      const oldIndex = originalCertificates.findIndex((item: Certificate) => item.id === active.id)
      const newIndex = originalCertificates.findIndex((item: Certificate) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find certificate indices")
        return
      }

      const newOrder = arrayMove(originalCertificates, oldIndex, newIndex)
      setCertificates(newOrder)

      try {
        // Call the server action with the new position
        const result = await reorderItem(active.id, "certificate", newIndex)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setCertificates(category.certificates)
        console.error("Failed to update order:", error)
        alert("Failed to reorder certificates. Please try again.")
      }
    }
  }

  const handleArchive = async (certificateId: string) => {
    try {
      await archiveItem(certificateId, "certificate")
      setCertificates((prevCertificates) => prevCertificates.filter((c) => c.id !== certificateId))
      router.refresh()
    } catch (error) {
      console.error("Error archiving certificate:", error)
    }
  }

  const handleUnarchive = async (certificateId: string) => {
    try {
      await unarchiveItem(certificateId, "certificate")
      setCertificates((prevCertificates) => prevCertificates.filter((c) => c.id !== certificateId))
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving certificate:", error)
    }
  }

  const handleDelete = async (certificateId: string) => {
    if (confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) {
      try {
        await deleteItem(certificateId, "certificate")
        setCertificates((prevCertificates) => prevCertificates.filter((c) => c.id !== certificateId))
        router.refresh()
      } catch (error) {
        console.error("Error deleting certificate:", error)
      }
    }
  }

  const handleApprove = async (certificateId: string) => {
    try {
      await approveCertificate(certificateId)
      setCertificates((prevCertificates) =>
        prevCertificates.map((c) => (c.id === certificateId ? { ...c, approved: !c.approved } : c)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (certificateId: string) => {
    try {
      await toggleHighlight(certificateId, "certificate")
      setCertificates((prevCertificates) =>
        prevCertificates.map((c) => (c.id === certificateId ? { ...c, highlighted: !c.highlighted } : c)),
      )
      router.refresh()
    } catch (error) {
      console.error("Error toggling highlight:", error)
    }
  }

  return (
    <div className="mb-4">
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
                <AddCertificateDialog
                  categoryId={category.id}
                  onCertificateCreated={(newCertificate) =>
                    setCertificates((prevCertificates) => [...prevCertificates, newCertificate])
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
                  await unarchiveItem(category.id, "category")
                  router.refresh()
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
                  await archiveItem(category.id, "category")
                  router.refresh()
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
                  await toggleHighlight(category.id, "category")
                  router.refresh()
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
                      "Are you sure you want to delete this category and all its certificates? This action cannot be undone.",
                    )
                  ) {
                    await deleteItem(category.id, "category")
                    router.refresh()
                  }
                  setLoading(l => ({...l, [category.id]: {...l[category.id], delete: false}}));
                }}
                aria-label={`Delete category ${category.title}`}
              >
                {loading[category.id]?.delete ? <Spinner size="sm" /> : <X className="h-3 w-3" aria-hidden="true" />}
              </Button>
            )}
          </div>
        )}
      </div>

      {isExpanded && certificates && certificates.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Certificate</div>
            <div>Version</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>

          {isLoading ? (
            <div>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={certificates.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {certificates.map((certificate) => (
                  <SortableCertificate key={certificate.id} certificate={certificate}>
                    <CertificateItem
                      certificate={certificate}
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
                  </SortableCertificate>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  )
}

export default function CertificatesClient({
  categories,
  canEdit,
  canDelete,
  showArchived,
  currentSort,
}: {
  categories: Category[]
  canEdit: boolean
  canDelete: boolean
  showArchived: boolean
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
          currentSectionId: "certificates",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move certificate: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving certificate:", error)
      alert("Network error occurred while moving certificate. Please check your connection and try again.")
      return false
    }
  }

  const toggleArchiveView = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (showArchived) {
      params.delete("showArchived")
    } else {
      params.set("showArchived", "true")
    }
    router.push(`/certificate?${params.toString()}`)
  }

  const toggleSort = (sortType: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "")
    if (currentSort === sortType) {
      params.delete("sort")
    } else {
      params.set("sort", sortType)
    }
    router.push(`/certificate?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Certificates</h1>
          {showArchived && (
            <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">Archived View</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={currentSort === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSort("name")}
            >
              <SortAsc className="h-4 w-4 mr-1" />
              Name
            </Button>
            <Button
              variant={currentSort === "date" ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSort("date")}
            >
              <SortAsc className="h-4 w-4 mr-1" />
              Date
            </Button>
          </div>

          <Button variant="outline" onClick={toggleArchiveView}>
            {showArchived ? "Show Active" : "Show Archived"}
          </Button>

          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/certificate/new">Add New Certificate</Link>
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
          <p className="text-gray-500">{showArchived ? "No archived certificates found." : "No certificates found."}</p>
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
            const result = await addCategory(formData.get("title") as string)
            if (result.success) {
              router.refresh()
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
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-gray-600 text-white border-none"
          aria-label={`Edit category ${category.title}`}
        >
          <Edit className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const result = await editCategory(category.id, formData.get("title") as string)
            if (result.success) {
              router.refresh()
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

function AddCertificateDialog({
  categoryId,
  onCertificateCreated,
}: {
  categoryId: string
  onCertificateCreated: (certificate: Certificate) => void
}) {
  const router = useRouter()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-green-500 text-white border-none"
          aria-label="Add new certificate"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Certificate</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const result = await addCertificate(categoryId, formData.get("title") as string)
            if (result.success) {
              const newCertificate: Certificate = {
                id: result.certificate?.id || Math.random().toString(),
                title: formData.get("title") as string,
                version: "1",
                issueDate: new Date().toISOString().split("T")[0],
                location: "Default Location",
                approved: false,
                highlighted: false,
              }
              onCertificateCreated(newCertificate)
              router.refresh()
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Certificate Title</Label>
              <Input id="title" name="title" placeholder="Enter certificate title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Certificate</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
