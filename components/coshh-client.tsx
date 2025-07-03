// "use client"

// import { useState, useEffect } from "react"
// import { FileText, ArrowUpDown, Edit, Check, X, Plus, Archive, RefreshCw, SortAsc } from "lucide-react"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useRouter, useSearchParams } from "next/navigation"
// import {
//   toggleHighlight,
//   archiveItem,
//   unarchiveItem,
//   deleteItem,
//   reorderItem,
//   addCOSHH,
//   addCategory,
//   editCategory,
//   approveCOSHH,
// } from "@/app/actions/coshh-actions"
// import MoveEntryDialog from "@/components/move-entry-dialog"

// interface Section {
//   id: string
//   title: string
//   categories: Category[]
// }

// interface COSHH {
//   id: string
//   title: string
//   version: string
//   reviewDate: Date
//   nextReviewDate?: Date
//   department: string
//   highlighted: boolean
//   approved: boolean
//   archived: boolean
//   order: number
//   createdAt: Date
//   updatedAt: Date
//   createdBy: {
//     name: string
//   }
//   updatedBy?: {
//     name: string
//   }
// }

// interface Category {
//   id: string
//   title: string
//   order: number
//   archived: boolean
//   highlighted: boolean
//   coshhs: COSHH[]
// }

// interface COSHHClientProps {
//   categories: Category[]
//   canEdit: boolean
//   canDelete: boolean
//   showArchived: boolean
//   currentSort?: string
// }

// export default function COSHHClient({
//   categories,
//   canEdit,
//   canDelete,
//   showArchived,
//   currentSort,
// }: COSHHClientProps) {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [sections, setSections] = useState<Section[]>([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const fetchSections = async () => {
//       try {
//         const response = await fetch("/api/sections")
//         if (!response.ok) {
//           throw new Error("Failed to fetch sections")
//         }
//         const data = await response.json()
//         setSections(data)
//       } catch (error) {
//         console.error("Error fetching sections:", error)
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchSections()
//   }, [])

//   const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string) => {
//     const response = await fetch("/api/entries/move", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         entryId,
//         currentSectionId: "coshh",
//         newSectionId,
//         newCategoryId,
//       }),
//     })

//     if (!response.ok) {
//       const error = await response.json()
//       throw new Error(error.error || "Failed to move entry")
//     }

//     router.refresh()
//   }

//   const toggleArchiveView = () => {
//     const params = new URLSearchParams(searchParams?.toString() || "")
//     if (showArchived) {
//       params.delete('showArchived')
//     } else {
//       params.set('showArchived', 'true')
//     }
//     router.push(`/coshh?${params.toString()}`)
//   }

//   const toggleSort = (sortType: string) => {
//     const params = new URLSearchParams(searchParams?.toString() || "")
//     if (currentSort === sortType) {
//       params.delete('sort')
//     } else {
//       params.set('sort', sortType)
//     }
//     router.push(`/coshh?${params.toString()}`)
//   }

//   return (
//     <div className="p-4">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center">
//           <FileText className="h-6 w-6 mr-2" />
//           <h1 className="text-2xl font-bold">COSHH</h1>
//           {showArchived && (
//             <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">
//               Archived View
//             </span>
//           )}
//         </div>
        
//         <div className="flex items-center gap-2">
//           {/* Sort Options */}
//           <div className="flex items-center gap-1">
//             <Button 
//               variant={currentSort === "name" ? "default" : "outline"} 
//               size="sm"
//               onClick={() => toggleSort("name")}
//             >
//               <SortAsc className="h-4 w-4 mr-1" />
//               Name
//             </Button>
//             <Button 
//               variant={currentSort === "date" ? "default" : "outline"} 
//               size="sm"
//               onClick={() => toggleSort("date")}
//             >
//               <SortAsc className="h-4 w-4 mr-1" />
//               Date
//             </Button>
//           </div>

//           {/* Archive Toggle */}
//           <Button variant="outline" onClick={toggleArchiveView}>
//             {showArchived ? "Show Active" : "Show Archived"}
//           </Button>

//           {/* Add Category and New COSHH buttons */}
//           {canEdit && (
//             <>
//               <AddCategoryDialog />
//               <Button asChild>
//                 <Link href="/coshh/new">Add New COSHH</Link>
//               </Button>
//             </>
//           )}
//         </div>
//       </div>

//       {categories.length > 0 ? (
//         categories.map((category) => (
//           <CategorySection
//             key={category.id}
//             category={category}
//             canEdit={canEdit}
//             canDelete={canDelete}
//             isArchived={showArchived}
//             onMove={handleMove}
//             sections={sections}
//             isLoading={isLoading}
//           />
//         ))
//       ) : (
//         <div className="text-center p-8 border rounded-md mt-4">
//           <p className="text-gray-500">
//             {showArchived ? "No archived COSHH found." : "No COSHH found."}
//           </p>
//           {canEdit && !showArchived && (
//             <div className="mt-4">
//               <AddCategoryDialog />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

// function CategorySection({
//   category,
//   canEdit,
//   canDelete,
//   isArchived,
//   onMove,
//   sections,
//   isLoading,
// }: {
//   category: Category
//   canEdit: boolean
//   canDelete: boolean
//   isArchived: boolean
//   onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
//   sections: Section[]
//   isLoading: boolean
// }) {
//   const router = useRouter()
  
//   return (
//     <div key={category.id} className="mb-4">
//       <div
//         className={`${category.highlighted ? "bg-yellow-600" : "bg-[#2d1e3e]"} text-white p-3 flex justify-between items-center rounded-sm`}
//       >
//         <span>{category.title}</span>
//         {canEdit && (
//           <div className="flex gap-1">
//             {!isArchived && (
//               <>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="h-6 w-6 bg-gray-600 text-white border-none"
//                   onClick={async () => {
//                     const result = await reorderItem(category.id, "category", "up");
//                     if (result.success) {
//                       router.refresh();
//                     }
//                   }}
//                   aria-label={`Move category ${category.title} up`}
//                 >
//                   <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="h-6 w-6 bg-gray-600 text-white border-none"
//                   onClick={async () => {
//                     const result = await reorderItem(category.id, "category", "down");
//                     if (result.success) {
//                       router.refresh();
//                     }
//                   }}
//                   aria-label={`Move category ${category.title} down`}
//                 >
//                   <ArrowUpDown className="h-3 w-3 rotate-90" aria-hidden="true" />
//                 </Button>
//                 <EditCategoryDialog category={category} />
//                 <AddCOSHHDialog categoryId={category.id} />
//               </>
//             )}

//             {isArchived ? (
//               <Button
//                 variant="outline"
//                 size="icon"
//                 className="h-6 w-6 bg-green-600 text-white border-none"
//                 onClick={async () => {
//                   await unarchiveItem(category.id, "category")
//                   router.refresh()
//                 }}
//                 title="Unarchive"
//                 aria-label={`Unarchive category ${category.title}`}
//               >
//                 <RefreshCw className="h-3 w-3" aria-hidden="true" />
//               </Button>
//             ) : (
//               <Button
//                 variant="outline"
//                 size="icon"
//                 className="h-6 w-6 bg-gray-600 text-white border-none"
//                 onClick={async () => {
//                   await archiveItem(category.id, "category")
//                   router.refresh()
//                 }}
//                 title="Archive"
//                 aria-label={`Archive category ${category.title}`}
//               >
//                 <Archive className="h-3 w-3" aria-hidden="true" />
//               </Button>
//             )}

//             {!isArchived && (
//               <Button
//                 variant="outline"
//                 size="icon"
//                 className={`h-6 w-6 ${category.highlighted ? "bg-gray-600" : "bg-yellow-500"} text-white border-none`}
//                 onClick={async () => {
//                   await toggleHighlight(category.id, "category")
//                   router.refresh()
//                 }}
//                 aria-label={`${category.highlighted ? "Unhighlight" : "Highlight"} category ${category.title}`}
//               >
//                 <div className="h-3 w-3 bg-yellow-500"></div>
//               </Button>
//             )}

//             {canDelete && (
//               <Button
//                 variant="outline"
//                 size="icon"
//                 className="h-6 w-6 bg-red-500 text-white border-none"
//                 onClick={async () => {
//                   if (
//                     confirm(
//                       "Are you sure you want to delete this category and all its COSHH? This action cannot be undone."
//                     )
//                   ) {
//                     await deleteItem(category.id, "category")
//                     router.refresh()
//                   }
//                 }}
//                 aria-label={`Delete category ${category.title}`}
//               >
//                 <X className="h-3 w-3" aria-hidden="true" />
//               </Button>
//             )}
//           </div>
//         )}
//       </div>

//       {category.coshhs && category.coshhs.length > 0 && (
//         <div className="border border-gray-200">
//           <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b text-sm font-medium text-gray-500">
//             <div className="col-span-4">Document</div>
//             <div className="col-span-2">Issue Level</div>
//             <div className="col-span-2">Issue Date</div>
//             <div className="col-span-2">Location</div>
//             <div className="col-span-2">Actions</div>
//           </div>

//           {category.coshhs.map((coshh: COSHH) => (
//             <div
//               key={coshh.id}
//               className={`grid grid-cols-12 gap-4 p-3 border-b items-center ${coshh.highlighted ? "bg-yellow-50" : ""}`}
//             >
//               <div className="col-span-4 flex items-center">
//                 <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
//                 <Link href={`/coshh/${coshh.id}`} className="text-blue-600 hover:underline">
//                   {coshh.title}
//                 </Link>
//                 {coshh.approved && <Check className="h-4 w-4 ml-2 text-green-500" />}
//               </div>
//               <div className="col-span-2">{coshh.version}</div>
//               <div className="col-span-2">{new Date(coshh.reviewDate).toLocaleDateString()}</div>
//               <div className="col-span-2">{coshh.department}</div>
//               <div className="col-span-2">
//                 {canEdit && (
//                   <div className="flex gap-1">
//                     {!isArchived && (
//                       <>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           className="h-6 w-6"
//                           onClick={async () => {
//                             const result = await reorderItem(coshh.id, "coshh", "up");
//                             if (result.success) {
//                               router.refresh();
//                             }
//                           }}
//                           aria-label={`Move COSHH ${coshh.title} up`}
//                         >
//                           <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           className="h-6 w-6"
//                           onClick={async () => {
//                             const result = await reorderItem(coshh.id, "coshh", "down");
//                             if (result.success) {
//                               router.refresh();
//                             }
//                           }}
//                           aria-label={`Move COSHH ${coshh.title} down`}
//                         >
//                           <ArrowUpDown className="h-3 w-3 rotate-90" aria-hidden="true" />
//                         </Button>
//                         <MoveEntryDialog
//                           entryId={coshh.id}
//                           entryType="coshh"
//                           currentSectionId="coshh"
//                           currentCategoryId={category.id}
//                           sections={sections}
//                           isLoading={isLoading}
//                           onMove={(newSectionId, newCategoryId) => onMove(coshh.id, newSectionId, newCategoryId)}
//                         />
//                       </>
//                     )}

//                     {isArchived ? (
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="h-6 w-6 bg-green-600 text-white border-none"
//                         onClick={async () => {
//                           await unarchiveItem(coshh.id, "coshh")
//                           router.refresh()
//                         }}
//                         title="Unarchive"
//                         aria-label={`Unarchive COSHH ${coshh.title}`}
//                       >
//                         <RefreshCw className="h-3 w-3" aria-hidden="true" />
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="h-6 w-6"
//                         onClick={async () => {
//                           await archiveItem(coshh.id, "coshh")
//                           router.refresh()
//                         }}
//                         title="Archive"
//                         aria-label={`Archive COSHH ${coshh.title}`}
//                       >
//                         <Archive className="h-3 w-3" aria-hidden="true" />
//                       </Button>
//                     )}

//                     {canDelete && (
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="h-6 w-6 bg-red-500 text-white border-none"
//                         onClick={async () => {
//                           if (confirm("Are you sure you want to delete this COSHH? This action cannot be undone.")) {
//                             await deleteItem(coshh.id, "coshh")
//                             router.refresh()
//                           }
//                         }}
//                         aria-label={`Delete COSHH ${coshh.title}`}
//                       >
//                         <X className="h-3 w-3" aria-hidden="true" />
//                       </Button>
//                     )}

//                     {!isArchived && (
//                       <>
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           className={`h-6 w-6 ${coshh.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
//                           onClick={async () => {
//                             await toggleHighlight(coshh.id, "coshh")
//                             router.refresh()
//                           }}
//                           aria-label={`${coshh.highlighted ? "Unhighlight" : "Highlight"} COSHH ${coshh.title}`}
//                         >
//                           <div className="h-3 w-3 bg-yellow-500"></div>
//                         </Button>
//                         {!coshh.approved && (
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-6 w-6 bg-green-500 text-white border-none"
//                             onClick={async () => {
//                               await approveCOSHH(coshh.id)
//                               router.refresh()
//                             }}
//                             title="Approve"
//                             aria-label={`Approve COSHH ${coshh.title}`}
//                           >
//                             <Check className="h-3 w-3" aria-hidden="true" />
//                           </Button>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // Add Category Dialog Component
// function AddCategoryDialog() {
//   const router = useRouter()
  
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline">Add Category</Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New Category</DialogTitle>
//         </DialogHeader>
//         <form
//           action={async (formData) => {
//             const result = await addCategory(formData.get("title") as string)
//             if (result.success) {
//               router.refresh()
//             }
//           }}
//         >
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="title">Category Title</Label>
//               <Input id="title" name="title" placeholder="Enter category title" />
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <Button type="submit">Add Category</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// // Edit Category Dialog Component
// function EditCategoryDialog({ category }: { category: Category }) {
//   const router = useRouter()
  
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-6 w-6 bg-gray-600 text-white border-none"
//           aria-label={`Edit category ${category.title}`}
//         >
//           <Edit className="h-3 w-3" aria-hidden="true" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Edit Category</DialogTitle>
//         </DialogHeader>
//         <form
//           action={async (formData) => {
//             const result = await editCategory(category.id, formData.get("title") as string)
//             if (result.success) {
//               router.refresh()
//             }
//           }}
//         >
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="title">Category Title</Label>
//               <Input id="title" name="title" defaultValue={category.title} />
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <Button type="submit">Save Changes</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// // Add COSHH Dialog Component
// function AddCOSHHDialog({ categoryId }: { categoryId: string }) {
//   const router = useRouter()
  
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-6 w-6 bg-green-500 text-white border-none"
//           aria-label="Add new COSHH"
//         >
//           <Plus className="h-3 w-3" aria-hidden="true" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New COSHH</DialogTitle>
//         </DialogHeader>
//         <form
//           action={async (formData) => {
//             const result = await addCOSHH({
//               title: formData.get("title") as string,
//               version: "1.0",
//               reviewDate: new Date().toISOString(),
//               department: formData.get("department") as string,
//               categoryId: categoryId
//             })
//             if (result.success) {
//               router.refresh()
//             }
//           }}
//         >
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="title">COSHH Title</Label>
//               <Input id="title" name="title" placeholder="Enter COSHH title" required />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="department">Department</Label>
//               <Input id="department" name="department" placeholder="Enter department" required />
//             </div>
//           </div>
//           <div className="flex justify-end">
//             <Button type="submit">Add COSHH</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// } 





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
  reorderCOSHHs,
  addCOSHH,
  addCategory,
  editCategory,
  approveCOSHH,
  disapproveCOSHH,
} from "@/app/actions/coshh-actions"
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
  coshhs: COSHHItem[]
}

interface COSHHItem {
  id: string
  title: string
  version: string
  reviewDate: string
  nextReviewDate?: string
  department: string
  highlighted: boolean
  approved: boolean
  archived: boolean
  order: number
}

function SortableCOSHH({ coshh, children }: { coshh: COSHHItem; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: coshh.id })

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

function COSHHItem({
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
  coshh: COSHHItem
  category: Category
  canEdit: boolean
  canDelete: boolean
  isArchived: boolean
  sections: Section[]
  isLoading: boolean
  onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<boolean>
  onArchive: (coshhId: string) => void
  onUnarchive: (coshhId: string) => void
  onDelete: (coshhId: string) => void
  onApprove: (coshhId: string) => void
  onHighlight: (coshhId: string) => void
}) {
  const router = useRouter()
  const { attributes, listeners } = useSortable({ id: coshh.id })
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  const handleMove = async (entryId: string, newSectionId: string, newCategoryId: string): Promise<boolean> => {
    try {
      const success = await onMove(entryId, newSectionId, newCategoryId)
      if (!success) {
        console.error("Failed to move COSHH")
        alert("Failed to move COSHH. Please try again.")
        return false
      }
      return true
    } catch (error) {
      console.error("Error in handleMove:", error)
      alert("An error occurred while moving the COSHH. Please try again.")
      return false
    }
  }

  return (
    <div className={`grid grid-cols-4 p-2 border-b items-center ${coshh.highlighted ? "bg-yellow-50" : ""}`}>
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-2" aria-hidden="true" />
        <Link href={`/coshh/${coshh.id}`} className="text-blue-600 hover:underline">
          {coshh.title}
        </Link>
        {coshh.approved && <span className="ml-2 text-green-600 text-xs">✓ Approved</span>}
      </div>
      <div>{coshh.version}</div>
      <div>{new Date(coshh.reviewDate).toLocaleDateString()}</div>
      <div className="flex justify-between">
        <span>{coshh.department}</span>
        {canEdit && (
          <div className="flex gap-1">
            {!isArchived && (
              <>
                <Button variant="outline" size="icon" className="h-6 w-6 cursor-grab" {...attributes} {...listeners}>
                  <GripVertical className="h-3 w-3" aria-hidden="true" />
                </Button>
                <MoveEntryDialog
                  entryId={coshh.id}
                  entryType="coshh"
                  currentSectionId="coshh"
                  currentCategoryId={category.id}
                  sections={sections}
                  isLoading={isLoading}
                  onMove={(newSectionId, newCategoryId) => handleMove(coshh.id, newSectionId, newCategoryId)}
                />
              </>
            )}

            {isArchived ? (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-green-600 text-white border-none"
                disabled={loading[coshh.id]?.archive}
                onClick={async () => {
                  setLoading(l => ({...l, [coshh.id]: {...l[coshh.id], archive: true}}));
                  await onUnarchive(coshh.id);
                  setLoading(l => ({...l, [coshh.id]: {...l[coshh.id], archive: false}}));
                }}
                title="Unarchive"
                aria-label={`Unarchive COSHH ${coshh.title}`}
              >
                {loading[coshh.id]?.archive ? <Spinner size="sm" /> : <RefreshCw className="h-3 w-3" aria-hidden="true" />}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onArchive(coshh.id)}
                title="Archive"
                aria-label={`Archive COSHH ${coshh.title}`}
              >
                <Archive className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}

            {canDelete && (
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 bg-red-500 text-white border-none"
                onClick={() => onDelete(coshh.id)}
                aria-label={`Delete COSHH ${coshh.title}`}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}

            {!isArchived && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${coshh.highlighted ? "bg-gray-200" : "bg-yellow-500 text-white"} border-none`}
                  onClick={() => onHighlight(coshh.id)}
                  aria-label={`${coshh.highlighted ? "Unhighlight" : "Highlight"} COSHH ${coshh.title}`}
                >
                  <div className="h-3 w-3 bg-yellow-500"></div>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-6 w-6 ${coshh.approved ? "bg-gray-200" : "bg-green-500 text-white"} border-none`}
                  onClick={() => onApprove(coshh.id)}
                  title={coshh.approved ? "Unapprove" : "Approve"}
                  aria-label={`${coshh.approved ? "Unapprove" : "Approve"} COSHH ${coshh.title}`}
                >
                  <Check className="h-3 w-3" aria-hidden="true" />
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
  const [coshhs, setCOSHHs] = useState<COSHHItem[]>(category.coshhs || [])
  const [loading, setLoading] = useState<{[id: string]: {archive?: boolean, unarchive?: boolean, delete?: boolean, approve?: boolean, highlight?: boolean, move?: boolean}}>({});

  useEffect(() => {
    setCOSHHs(category.coshhs || [])
  }, [category.coshhs])

  // Sorting logic
  useEffect(() => {
    if (sortType === "name" || sortType === "date") {
      const sortedCOSHHs = [...(category.coshhs || [])]
      if (sortType === "name") {
        sortedCOSHHs.sort((a, b) => {
          const cmp = a.title.localeCompare(b.title)
          return sortDirection === "asc" ? cmp : -cmp
        })
      } else if (sortType === "date") {
        sortedCOSHHs.sort((a, b) => {
          const cmp = new Date(a.reviewDate).getTime() - new Date(b.reviewDate).getTime()
          return sortDirection === "asc" ? cmp : -cmp
        })
      }
      setCOSHHs(sortedCOSHHs)
    } else {
      // Default order by database order
      setCOSHHs([...(category.coshhs || [])].sort((a, b) => a.order - b.order))
    }
  }, [sortType, sortDirection, category.coshhs])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = coshhs.findIndex((item) => item.id === active.id)
      const newIndex = coshhs.findIndex((item) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) {
        console.error("Could not find COSHH indices")
        return
      }

      const newOrder = arrayMove(coshhs, oldIndex, newIndex)
      setCOSHHs(newOrder)

      try {
        // Call the server action with the reordered IDs
        const coshhIds = newOrder.map((item) => item.id)
        const result = await reorderCOSHHs(category.id, coshhIds)
        if (!result.success) {
          throw new Error(result.error || "Failed to reorder")
        }
        router.refresh()
      } catch (error) {
        // Revert the local state on error
        setCOSHHs(category.coshhs || [])
        console.error("Failed to update order:", error)
        alert("Failed to reorder COSHHs. Please try again.")
      }
    }
  }

  const handleArchive = async (coshhId: string) => {
    try {
      setLoading(l => ({...l, [coshhId]: {...l[coshhId], archive: true}}));
      const result = await archiveItem(coshhId, "coshh")
      if (result.success) {
        setCOSHHs((prevCOSHHs) => prevCOSHHs.filter((c) => c.id !== coshhId))
        router.refresh()
      }
    } catch (error) {
      console.error("Error archiving COSHH:", error)
    }
  }

  const handleUnarchive = async (coshhId: string) => {
    try {
      setLoading(l => ({...l, [coshhId]: {...l[coshhId], unarchive: true}}));
      const result = await unarchiveItem(coshhId, "coshh")
      if (result.success) {
        setCOSHHs((prevCOSHHs) => prevCOSHHs.filter((c) => c.id !== coshhId))
        router.refresh()
      }
    } catch (error) {
      console.error("Error unarchiving COSHH:", error)
    }
  }

  const handleDelete = async (coshhId: string) => {
    if (confirm("Are you sure you want to delete this COSHH? This action cannot be undone.")) {
      try {
        setLoading(l => ({...l, [coshhId]: {...l[coshhId], delete: true}}));
        const result = await deleteItem(coshhId, "coshh")
        if (result.success) {
          setCOSHHs((prevCOSHHs) => prevCOSHHs.filter((c) => c.id !== coshhId))
          router.refresh()
        }
      } catch (error) {
        console.error("Error deleting COSHH:", error)
      }
    }
  }

  const handleApprove = async (coshhId: string) => {
    try {
      setLoading(l => ({...l, [coshhId]: {...l[coshhId], approve: true}}));
      const coshh = coshhs.find((c) => c.id === coshhId)
      let result
      if (coshh?.approved) {
        result = await disapproveCOSHH(coshhId)
      } else {
        result = await approveCOSHH(coshhId)
      }

      if (result.success) {
        setCOSHHs((prevCOSHHs) => prevCOSHHs.map((c) => (c.id === coshhId ? { ...c, approved: !c.approved } : c)))
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling approval:", error)
    }
  }

  const handleHighlight = async (coshhId: string) => {
    try {
      setLoading(l => ({...l, [coshhId]: {...l[coshhId], highlight: true}}));
      const result = await toggleHighlight(coshhId, "coshh")
      if (result.success) {
        setCOSHHs((prevCOSHHs) => prevCOSHHs.map((c) => (c.id === coshhId ? { ...c, highlighted: !c.highlighted } : c)))
        router.refresh()
      }
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
                <AddCOSHHDialog
                  categoryId={category.id}
                  onCOSHHCreated={(newCOSHH) => setCOSHHs((prevCOSHHs) => [...prevCOSHHs, newCOSHH])}
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
                  const result = await unarchiveItem(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
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
                  const result = await archiveItem(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
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
                  const result = await toggleHighlight(category.id, "category")
                  if (result.success) {
                    router.refresh()
                  }
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
                      "Are you sure you want to delete this category and all its COSHHs? This action cannot be undone.",
                    )
                  ) {
                    const result = await deleteItem(category.id, "category")
                    if (result.success) {
                      router.refresh()
                    }
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

      {isExpanded && coshhs && coshhs.length > 0 && (
        <div className="border border-gray-200">
          <div className="grid grid-cols-4 bg-gray-100 p-2 border-b">
            <div>COSHH</div>
            <div>Version</div>
            <div>Review Date</div>
            <div>Department</div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={coshhs.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {coshhs.map((coshh: COSHHItem) => (
                <SortableCOSHH key={coshh.id} coshh={coshh}>
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
                </SortableCOSHH>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

export default function COSHHClient({
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
          currentSectionId: "coshh",
          newSectionId,
          newCategoryId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`
        console.error("Move failed:", errorMessage)
        alert(`Failed to move COSHH: ${errorMessage}`)
        return false
      }

      const result = await response.json()
      console.log("Move successful:", result)

      router.refresh()
      return true
    } catch (error) {
      console.error("Error moving COSHH:", error)
      alert("Network error occurred while moving COSHH. Please check your connection and try again.")
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
    router.push(`/coshh?${params.toString()}`)
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
    router.push(`/coshh?${params.toString()}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">COSHH</h1>
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

          {/* Add Category and New COSHH buttons */}
          {canEdit && (
            <>
              <AddCategoryDialog />
              <Button asChild>
                <Link href="/coshh/new">Add New</Link>
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
              ? "No archived COSHHs found."
              : "No COSHHs found. Click 'Add New' to create your first COSHH."}
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
                const result = await addCategory(title)
                if (result.success) {
                  router.refresh()
                }
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
                const result = await editCategory(category.id, title)
                if (result.success) {
                  router.refresh()
                }
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

function AddCOSHHDialog({
  categoryId,
  onCOSHHCreated,
}: {
  categoryId: string
  onCOSHHCreated: (coshh: COSHHItem) => void
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
          <DialogTitle>Add New COSHH</DialogTitle>
        </DialogHeader>
        <form
          action={async (formData) => {
            const title = formData.get("title") as string
            const department = formData.get("department") as string
            if (title && department) {
              try {
                const result = await addCOSHH({
                  title,
                  version: "1.0",
                  reviewDate: new Date().toISOString().split("T")[0],
                  department,
                  content: "",
                  categoryId,
                })
                if (result.success) {
                  const newCOSHH: COSHHItem = {
                    id: result.coshh?.id || Math.random().toString(),
                    title,
                    version: "1.0",
                    reviewDate: new Date().toISOString().split("T")[0],
                    department,
                    approved: false,
                    highlighted: false,
                    archived: false,
                    order: 0,
                  }
                  onCOSHHCreated(newCOSHH)
                  setIsOpen(false)
                  router.refresh()
                } else {
                  alert(result.error || "Failed to add COSHH")
                }
              } catch (error) {
                console.error("Error adding COSHH:", error)
                alert("Failed to add COSHH. Please try again.")
              }
            } else {
              alert("COSHH title and department are required.")
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">COSHH Title</Label>
              <Input id="title" name="title" placeholder="Enter COSHH title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" placeholder="Enter department" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Add COSHH</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



