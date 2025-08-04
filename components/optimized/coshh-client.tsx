"use client"

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Archive, 
  RotateCcw, 
  CheckCircle, 
  Star,
  Move,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"
import { FixedSizeList as List } from 'react-window'

// Memoized COSHH Item Component
const COSHHItem = React.memo(({
  coshh,
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
  coshh: any
  category: any
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: any[]
  isLoading: boolean
  onMove: (coshhId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (coshhId: string) => void
  onUnarchive: (coshhId: string) => void
  onDelete: (coshhId: string) => void
  onApprove: (coshhId: string) => void
  onHighlight: (coshhId: string) => void
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})

  const handleAction = useCallback(async (action: string, coshhId: string) => {
    setLoading(prev => ({ ...prev, [action]: true }))
    try {
      switch (action) {
        case 'archive':
          await onArchive(coshhId)
          break
        case 'unarchive':
          await onUnarchive(coshhId)
          break
        case 'delete':
          await onDelete(coshhId)
          break
        case 'approve':
          await onApprove(coshhId)
          break
        case 'highlight':
          await onHighlight(coshhId)
          break
      }
    } catch (error) {
      console.error(`Error in ${action}:`, error)
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }))
    }
  }, [onArchive, onUnarchive, onDelete, onApprove, onHighlight])

  const handleMove = useCallback(async (newSectionId: string, newCategoryId: string) => {
    setLoading(prev => ({ ...prev, move: true }))
    try {
      await onMove(coshh.id, newSectionId, newCategoryId)
    } catch (error) {
      console.error('Error moving COSHH:', error)
    } finally {
      setLoading(prev => ({ ...prev, move: false }))
    }
  }, [coshh.id, onMove])

  return (
    <div className="grid grid-cols-4 items-center p-3 border-b hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-2">
        <span className="font-medium truncate">{coshh.title}</span>
        {coshh.highlighted && <Star className="h-4 w-4 text-yellow-500" />}
        {coshh.approved && <CheckCircle className="h-4 w-4 text-green-500" />}
      </div>
      <div>{coshh.version}</div>
      <div>{new Date(coshh.reviewDate).toLocaleDateString()}</div>
      <div className="flex items-center justify-between">
        <span>{coshh.department}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canEdit && (
              <DropdownMenuItem onClick={() => router.push(`/coshh/${coshh.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {canEdit && !isArchived && (
              <DropdownMenuItem onClick={() => handleAction('archive', coshh.id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            {canEdit && isArchived && (
              <DropdownMenuItem onClick={() => handleAction('unarchive', coshh.id)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Unarchive
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem onClick={() => handleAction('delete', coshh.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
            {canEdit && !coshh.approved && (
              <DropdownMenuItem onClick={() => handleAction('approve', coshh.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
            {canEdit && !coshh.highlighted && (
              <DropdownMenuItem onClick={() => handleAction('highlight', coshh.id)}>
                <Star className="mr-2 h-4 w-4" />
                Highlight
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
})

COSHHItem.displayName = 'COSHHItem'

// Memoized Category Section Component
const CategorySection = React.memo(({
  category,
  canEdit,
  canDelete,
  isArchived,
  onMove,
  sections,
  isLoading,
}: {
  category: any
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  onMove: (coshhId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  sections: any[]
  isLoading: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sortType, setSortType] = useState<"name" | "date" | "order">("order")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [coshhs, setCOSHHs] = useState<any[]>(category.coshhs || [])

  // Memoized sorting logic
  const sortedCOSHHs = useMemo(() => {
    const sorted = [...(category.coshhs || [])]
    
    if (sortType === "name") {
      sorted.sort((a, b) => {
        const cmp = a.title.localeCompare(b.title)
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else if (sortType === "date") {
      sorted.sort((a, b) => {
        const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
        return sortDirection === "asc" ? cmp : -cmp
      })
    } else {
      sorted.sort((a, b) => a.order - b.order)
    }
    
    return sorted
  }, [category.coshhs, sortType, sortDirection])

  // Update local state when props change
  useEffect(() => {
    setCOSHHs(sortedCOSHHs)
  }, [sortedCOSHHs])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setCOSHHs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleArchive = useCallback(async (coshhId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}/archive`, {
        method: "PATCH",
      })
      if (response.ok) {
        toast.success("COSHH archived successfully")
        // Optimistic update
        setCOSHHs(prev => prev.filter(c => c.id !== coshhId))
      } else {
        toast.error("Failed to archive COSHH")
      }
    } catch (error) {
      toast.error("Error archiving COSHH")
    }
  }, [])

  const handleUnarchive = useCallback(async (coshhId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}/unarchive`, {
        method: "PATCH",
      })
      if (response.ok) {
        toast.success("COSHH unarchived successfully")
        // Optimistic update
        setCOSHHs(prev => prev.filter(c => c.id !== coshhId))
      } else {
        toast.error("Failed to unarchive COSHH")
      }
    } catch (error) {
      toast.error("Error unarchiving COSHH")
    }
  }, [])

  const handleDelete = useCallback(async (coshhId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("COSHH deleted successfully")
        // Optimistic update
        setCOSHHs(prev => prev.filter(c => c.id !== coshhId))
      } else {
        toast.error("Failed to delete COSHH")
      }
    } catch (error) {
      toast.error("Error deleting COSHH")
    }
  }, [])

  const handleApprove = useCallback(async (coshhId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}/approve`, {
        method: "PATCH",
      })
      if (response.ok) {
        toast.success("COSHH approved successfully")
        // Optimistic update
        setCOSHHs(prev => prev.map(c => 
          c.id === coshhId ? { ...c, approved: true } : c
        ))
      } else {
        toast.error("Failed to approve COSHH")
      }
    } catch (error) {
      toast.error("Error approving COSHH")
    }
  }, [])

  const handleHighlight = useCallback(async (coshhId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}/highlight`, {
        method: "PATCH",
      })
      if (response.ok) {
        toast.success("COSHH highlighted successfully")
        // Optimistic update
        setCOSHHs(prev => prev.map(c => 
          c.id === coshhId ? { ...c, highlighted: true } : c
        ))
      } else {
        toast.error("Failed to highlight COSHH")
      }
    } catch (error) {
      toast.error("Error highlighting COSHH")
    }
  }, [])

  // Virtualized list item renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const coshh = coshhs[index]
    if (!coshh) return null

    return (
      <div style={style}>
        <COSHHItem
          coshh={coshh}
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
      </div>
    )
  }, [coshhs, category, canEdit, canDelete, isArchived, sections, isLoading, onMove, handleArchive, handleUnarchive, handleDelete, handleApprove, handleHighlight])

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            <CardTitle className="text-lg">{category.title}</CardTitle>
            <Badge variant="secondary">{coshhs.length}</Badge>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/coshh/new?categoryId=${category.id}`)}
            >
              Add COSHH
            </Button>
          )}
        </div>
      </CardHeader>

      {isExpanded && coshhs.length > 0 && (
        <CardContent className="pt-0">
          <div className="border border-gray-200 rounded-lg">
            <div className="grid grid-cols-4 bg-gray-100 p-2 border-b rounded-t-lg">
              <div>COSHH</div>
              <div>Version</div>
              <div>Review Date</div>
              <div>Department</div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={coshhs.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {isLoading ? (
                  <div>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full mb-2" />
                    ))}
                  </div>
                ) : (
                  <List
                    height={Math.min(coshhs.length * 60, 400)}
                    itemCount={coshhs.length}
                    itemSize={60}
                    width="100%"
                  >
                    {Row}
                  </List>
                )}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      )}
    </Card>
  )
})

CategorySection.displayName = 'CategorySection'

// Main optimized component
export default function OptimizedCOSHHClient({
  categories,
  canEdit,
  canDelete,
  showArchived = false,
  currentSort,
}: {
  categories: any[]
  canEdit: boolean
  canDelete: boolean
  showArchived?: boolean
  currentSort?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sections, setSections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Memoized filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => 
      category.coshhs?.some((coshh: any) => coshh.archived === showArchived)
    )
  }, [categories, showArchived])

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

  const handleMove = useCallback(async (coshhId: string, newSectionId: string, newCategoryId: string) => {
    try {
      const response = await fetch(`/api/coshh/${coshhId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newSectionId,
          newCategoryId,
        }),
      })
      
      if (response.ok) {
        toast.success("COSHH moved successfully")
        return true
      } else {
        toast.error("Failed to move COSHH")
        return false
      }
    } catch (error) {
      toast.error("Error moving COSHH")
      return false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        {filteredCategories.map((category) => (
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
      </Suspense>
    </div>
  )
} 