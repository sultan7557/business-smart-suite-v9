



"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  FileText,
  ArrowUpDown,
  Edit,
  Check,
  FileArchive,
  X,
  Plus,
  Archive,
  RefreshCw,
  GripVertical,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  toggleHighlight,
  approvePolicy,
  archiveItem,
  unarchiveItem,
  deleteItem,
  reorderItem,
  addPolicy,
  addCategory,
  editCategory,
} from "@/app/actions/policy-actions"
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

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
  highlighted: boolean
  policies: Policy[]
}

interface Policy {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  highlighted: boolean
  approved: boolean
  categoryId?: string
}

interface CategorySectionProps {
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  sections: Section[]
  isLoading: boolean
}

function SortablePolicy({ policy, children }: { policy: Policy; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: policy.id })

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

function PolicyItem({
  policy,
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
  policy: Policy
  categoryId: string
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  sections: Section[]
  isLoading: boolean
  onDelete: (policyId: string) => Promise<void>
  onHighlight: (policyId: string) => Promise<void>
  onApprove: (policyId: string) => Promise<void>
  onArchive: (policyId: string) => Promise<void>
  onUnarchive: (policyId: string) => Promise<void>
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: policy.id })

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move policy")
        alert("Failed to move policy. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the policy. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${policy.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        <Link href={`/policies/${policy.id}`} className="text-blue-600 hover:underline">
          {policy.title}
        </Link>
        {policy.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{policy.version}</div>
      <div>{new Date(policy.issueDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{policy.location}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" />
                </Button>
                <MoveEntryDialog
                  entryId={policy.id}
                  entryType="policy"
                  currentSectionId="policies"
                  currentCategoryId={categoryId}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(policy.id, newSectionId, newCategoryId)}
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
                    await onUnarchive(policy.id)
                    router.refresh()
                  } catch (error) {
                    console.error("Error unarchiving policy:", error)
                    alert("Failed to unarchive policy. Please try again.")
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
                    await onArchive(policy.id)
                    router.refresh()
                  } catch (error) {
                    console.error("Error archiving policy:", error)
                    alert("Failed to archive policy. Please try again.")
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
                  if (confirm("Are you sure you want to delete this policy? This action cannot be undone.")) {
                    try {
                      await onDelete(policy.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error deleting policy:", error)
                      alert("Failed to delete policy. Please try again.")
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
                  className={`h-6 w-6 ${policy.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  onClick={async () => {
                    try {
                      await onHighlight(policy.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error highlighting policy:", error)
                      alert("Failed to highlight policy. Please try again.")
                    }
                  }}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${policy.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  onClick={async () => {
                    try {
                      await onApprove(policy.id)
                      router.refresh()
                    } catch (error) {
                      console.error("Error approving policy:", error)
                      alert("Failed to approve policy. Please try again.")
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
}: CategorySectionProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>(category.policies)
  const [sortType, setSortType] = useState<SortType>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    setPolicies(category.policies)
  }, [category.policies])

  useEffect(() => {
    const sortedPolicies = [...policies]
    if (sortType === "name") {
      sortedPolicies.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sortedPolicies.sort((a, b) => {
        const cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    }
    setPolicies(sortedPolicies)
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
      // Use the original category.policies array for consistent ordering
      const originalPolicies = category.policies
      const oldIndex = originalPolicies.findIndex((item: Policy) => item.id === active.id)
      const newIndex = originalPolicies.findIndex((item: Policy) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find policy indices")
        return
      }

      const newOrder = arrayMove(originalPolicies, oldIndex, newIndex)
      setPolicies(newOrder)

      try {
        // Call the server action with the new position
        const result = await reorderItem(active.id, "policy", newIndex)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setPolicies(category.policies)
        console.error("Failed to update order:", error)
        alert("Failed to reorder policies. Please try again.")
      }
    }
  }

  const handleCreatePolicy = (newPolicy: Policy) => {
    setPolicies((prev) => [...prev, { ...newPolicy, categoryId: category.id }])
    setIsExpanded(true)
  }

  const handleDeletePolicy = async (policyId: string) => {
    try {
      await deleteItem(policyId, "policy")
      setPolicies((prev) => prev.filter((p) => p.id !== policyId))
    } catch (error) {
      console.error("Error deleting policy:", error)
      throw error // Re-throw to be caught by the calling function
    }
  }

  const handleHighlightPolicy = async (policyId: string) => {
    try {
      await toggleHighlight(policyId, "policy")
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? { ...p, highlighted: !p.highlighted } : p)))
    } catch (error) {
      console.error("Error highlighting policy:", error)
      throw error
    }
  }

  const handleApprovePolicy = async (policyId: string) => {
    try {
      await approvePolicy(policyId)
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? { ...p, approved: !p.approved } : p)))
    } catch (error) {
      console.error("Error approving policy:", error)
      throw error
    }
  }

  const handleArchivePolicy = async (policyId: string) => {
    try {
      await archiveItem(policyId, "policy")
      // Don't remove from local state, let router.refresh() handle the update
      router.refresh()
    } catch (error) {
      console.error("Error archiving policy:", error)
      throw error
    }
  }

  const handleUnarchivePolicy = async (policyId: string) => {
    try {
      await unarchiveItem(policyId, "policy")
      // Don't remove from local state, let router.refresh() handle the update
      router.refresh()
    } catch (error) {
      console.error("Error unarchiving policy:", error)
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
                <AddPolicyDialog categoryId={category.id} onPolicyCreated={handleCreatePolicy} />
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
                    await unarchiveItem(category.id, "category")
                  } else {
                    await archiveItem(category.id, "category")
                  }
                  router.refresh()
                } catch (error) {
                  console.error("Error archiving/unarchiving category:", error)
                  alert("Failed to archive/unarchive category. Please try again.")
                }
              }}
              title={isArchived ? "Restore this category" : "Archive this category"}
            >
              <FileArchive className="h-3 w-3" />
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this category and all its policies? This action cannot be undone.",
                    )
                  ) {
                    try {
                      await deleteItem(category.id, "category")
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

      {isExpanded && policies.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>Policy</div>
            <div>Issue Level</div>
            <div>Issue Date</div>
            <div>Location</div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={policies.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {policies.map((policy: Policy) => (
                <SortablePolicy key={policy.id} policy={policy}>
                  <PolicyItem
                    policy={policy}
                    categoryId={category.id}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    isArchived={isArchived}
                    onMove={onMove}
                    sections={sections}
                    isLoading={isLoading}
                    onDelete={handleDeletePolicy}
                    onHighlight={handleHighlightPolicy}
                    onApprove={handleApprovePolicy}
                    onArchive={handleArchivePolicy}
                    onUnarchive={handleUnarchivePolicy}
                  />
                </SortablePolicy>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function PoliciesClient({
  categories,
  canEdit,
  canDelete,
  showArchived = false,
  currentSort = "",
}: {
  categories: any[]
  canEdit: boolean
  canDelete: boolean
  showArchived?: boolean
  currentSort?: string
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
          currentSectionId: "policies",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move policy: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)
      
      // Refresh the page to reflect changes
      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving policy:", error)
      alert("Network error occurred while moving policy. Please check your connection and try again.")
      return false
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <FileText className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Policies {showArchived && "(Archived)"}</h1>

        <Button
          variant="outline"
          className="ml-4"
          onClick={() => {
            router.push(showArchived ? "/policies" : "/policies?showArchived=true")
          }}
        >
          {showArchived ? "View Active Policies" : "View Archived Policies"}
        </Button>

        {canEdit && (
          <div className="ml-auto flex gap-2">
            <AddCategoryDialog />
            <Button
              variant={currentSort === "name" ? "default" : "outline"}
              onClick={() => {
                router.push(showArchived ? "/policies?showArchived=true&sort=name" : "/policies?sort=name")
              }}
              title="Sort by Name"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by Name
            </Button>
            <Button
              variant={currentSort === "date" ? "default" : "outline"}
              onClick={() => {
                router.push(showArchived ? "/policies?showArchived=true&sort=date" : "/policies?sort=date")
              }}
              title="Sort by Date"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by Date
            </Button>
            {showArchived && (
              <Button
                variant="outline"
                className="bg-blue-500 text-white"
                onClick={async () => {
                  try {
                    const highlightedPolicies = categories.flatMap((cat) =>
                      cat.policies.filter((p: any) => p.highlighted),
                    )
                    const highlightedCategories = categories.filter((cat) => cat.highlighted)

                    const totalHighlighted = highlightedPolicies.length + highlightedCategories.length

                    if (totalHighlighted === 0) {
                      alert("No highlighted items to restore")
                      return
                    }

                    if (confirm(`Restore ${totalHighlighted} highlighted items?`)) {
                      const promises = [
                        ...highlightedPolicies.map((p: any) => unarchiveItem(p.id, "policy")),
                        ...highlightedCategories.map((c: any) => unarchiveItem(c.id, "category")),
                      ]

                      await Promise.all(promises)
                      router.refresh()
                    }
                  } catch (error) {
                    console.error("Error restoring items:", error)
                    alert("Failed to restore items. Please try again.")
                  }
                }}
                title="Restore highlighted items"
              >
                Restore Items
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="Edit Categories">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Categories</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p>Select a category to edit:</p>
                  <ul className="mt-2 space-y-2">
                    {categories.map((category) => (
                      <li key={category.id} className="flex items-center justify-between">
                        <span>{category.title}</span>
                        <EditCategoryDialog category={category} />
                      </li>
                    ))}
                  </ul>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              className="bg-green-500 text-white"
              onClick={async () => {
                try {
                  const highlightedPolicies = categories.flatMap((cat) =>
                    cat.policies.filter((p: any) => p.highlighted && !p.approved),
                  )

                  if (highlightedPolicies.length === 0) {
                    alert("No highlighted policies to approve")
                    return
                  }

                  if (confirm(`Approve ${highlightedPolicies.length} highlighted policies?`)) {
                    await Promise.all(highlightedPolicies.map((p: any) => approvePolicy(p.id)))
                    router.refresh()
                  }
                } catch (error) {
                  console.error("Error approving policies:", error)
                  alert("Failed to approve policies. Please try again.")
                }
              }}
              title="Approve highlighted policies"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                try {
                  const highlightedPolicies = categories.flatMap((cat) =>
                    cat.policies.filter((p: any) => p.highlighted),
                  )
                  const highlightedCategories = categories.filter((cat) => cat.highlighted)

                  const totalHighlighted = highlightedPolicies.length + highlightedCategories.length

                  if (totalHighlighted === 0) {
                    alert("No highlighted items to archive")
                    return
                  }

                  if (confirm(`Archive ${totalHighlighted} highlighted items?`)) {
                    const promises = [
                      ...highlightedPolicies.map((p: any) => archiveItem(p.id, "policy")),
                      ...highlightedCategories.map((c: any) => archiveItem(c.id, "category")),
                    ]

                    await Promise.all(promises)
                    router.refresh()
                  }
                } catch (error) {
                  console.error("Error archiving items:", error)
                  alert("Failed to archive items. Please try again.")
                }
              }}
              title="Archive highlighted items"
            >
              <FileArchive className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                try {
                  const highlightedPolicies = categories.flatMap((cat) =>
                    cat.policies.filter((p: any) => p.highlighted),
                  )
                  const highlightedCategories = categories.filter((cat) => cat.highlighted)

                  const totalHighlighted = highlightedPolicies.length + highlightedCategories.length

                  if (totalHighlighted === 0) {
                    alert("No highlighted items to clear")
                    return
                  }

                  if (confirm(`Clear highlights from ${totalHighlighted} items?`)) {
                    const promises = [
                      ...highlightedPolicies.map((p: any) => toggleHighlight(p.id, "policy")),
                      ...highlightedCategories.map((c: any) => toggleHighlight(c.id, "category")),
                    ]

                    await Promise.all(promises)
                    router.refresh()
                  }
                } catch (error) {
                  console.error("Error clearing highlights:", error)
                  alert("Failed to clear highlights. Please try again.")
                }
              }}
              title="Clear all highlights"
            >
              <div className="h-4 w-4 border border-gray-400"></div>
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="bg-red-500 text-white"
                onClick={async () => {
                  try {
                    const highlightedPolicies = categories.flatMap((cat) =>
                      cat.policies.filter((p: any) => p.highlighted),
                    )
                    const highlightedCategories = categories.filter((cat) => cat.highlighted)

                    const totalHighlighted = highlightedPolicies.length + highlightedCategories.length

                    if (totalHighlighted === 0) {
                      alert("No highlighted items to delete")
                      return
                    }

                    if (confirm(`Delete ${totalHighlighted} highlighted items? This action cannot be undone.`)) {
                      const promises = [
                        ...highlightedPolicies.map((p: any) => deleteItem(p.id, "policy")),
                        ...highlightedCategories.map((c: any) => deleteItem(c.id, "category")),
                      ]

                      await Promise.all(promises)
                      router.refresh()
                    }
                  } catch (error) {
                    console.error("Error deleting highlighted items:", error)
                    alert("Failed to delete highlighted items. Please try again.")
                  }
                }}
                title="Delete highlighted items"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

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

// Edit Category Dialog Component
function EditCategoryDialog({ category }: { category: any }) {
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

// Add Policy Dialog Component
function AddPolicyDialog({
  categoryId,
  onPolicyCreated,
}: { categoryId: string; onPolicyCreated: (policy: Policy) => void }) {
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
          <DialogTitle>Add New Policy</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            if (title) {
              try {
                await addPolicy(categoryId, title)
                const newPolicy: Policy = {
                  id: Math.random().toString(), // Temporary ID, server should provide real ID
                  title,
                  version: "1.0",
                  issueDate: new Date().toISOString(),
                  location: "Default Location",
                  highlighted: false,
                  approved: false,
                  categoryId,
                }
                onPolicyCreated(newPolicy)
                setIsOpen(false)
                router.refresh()
              } catch (error) {
                console.error("Error adding policy:", error)
                alert("Failed to add policy. Please try again.")
              }
            } else {
              alert("Policy title is required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Policy Title</Label>
              <Input id="title" name="title" placeholder="Enter policy title" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add Policy</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
