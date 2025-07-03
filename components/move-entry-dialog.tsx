// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Move, Loader2 } from "lucide-react"
// import { toast } from "sonner"

// interface Section {
//   id: string
//   title: string
//   categories: Category[]
// }

// interface Category {
//   id: string
//   title: string
// }

// interface MoveEntryDialogProps {
//   entryId: string
//   entryType: string
//   currentSectionId: string
//   currentCategoryId: string
//   sections: Section[]
//   isLoading: boolean
//   onMove: (entryId: string, newSectionId: string, newCategoryId: string) => Promise<void>
// }

// export default function MoveEntryDialog({
//   entryId,
//   entryType,
//   currentSectionId,
//   currentCategoryId,
//   sections,
//   isLoading,
//   onMove,
// }: MoveEntryDialogProps) {
//   const [open, setOpen] = useState(false)
//   const [selectedSectionId, setSelectedSectionId] = useState<string>(currentSectionId)
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>(currentCategoryId)
//   const [isMoving, setIsMoving] = useState(false)

//   const handleMove = async () => {
//     if (selectedSectionId === currentSectionId && selectedCategoryId === currentCategoryId) {
//       toast.error("Please select a different section or category")
//       return
//     }

//     try {
//       setIsMoving(true)
//       await onMove(entryId, selectedSectionId, selectedCategoryId)
//       setOpen(false)
//       toast.success("Entry moved successfully")
//     } catch (error) {
//       toast.error("Failed to move entry")
//     } finally {
//       setIsMoving(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-6 w-6 bg-blue-500 text-white border-none"
//           aria-label={`Move ${entryType}`}
//         >
//           <Move className="h-3 w-3" aria-hidden="true" />
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-[425px]" aria-describedby="move-dialog-description">
//         <DialogHeader>
//           <DialogTitle>Move Entry</DialogTitle>
//         </DialogHeader>
//         <div id="move-dialog-description" className="sr-only">
//           Select a new section and category to move this entry to
//         </div>
//         <div className="grid gap-4 py-4">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-[300px]">
//               <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
//             </div>
//           ) : (
//             <ScrollArea className="h-[300px] pr-4">
//               {sections.map((section) => (
//                 <div key={section.id} className="mb-4">
//                   <h3 className="font-semibold mb-2">{section.title}</h3>
//                   <div className="space-y-2 pl-4">
//                     {section.categories.map((category) => (
//                       <div
//                         key={category.id}
//                         className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
//                           selectedSectionId === section.id && selectedCategoryId === category.id
//                             ? "bg-blue-100"
//                             : ""
//                         }`}
//                         onClick={() => {
//                           setSelectedSectionId(section.id)
//                           setSelectedCategoryId(category.id)
//                         }}
//                       >
//                         {category.title}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </ScrollArea>
//           )}
//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleMove} disabled={isMoving || isLoading}>
//               {isMoving ? "Moving..." : "Move"}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// } 


"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Move, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Section {
  id: string
  title: string
  categories: Category[]
}

interface Category {
  id: string
  title: string
}

interface MoveEntryDialogProps {
  entryId: string
  entryType: string
  currentSectionId: string
  currentCategoryId: string
  sections: Section[]
  isLoading: boolean
  onMove: (newSectionId: string, newCategoryId: string) => Promise<void>
}

export default function MoveEntryDialog({
  entryId,
  entryType,
  currentSectionId,
  currentCategoryId,
  sections,
  isLoading,
  onMove,
}: MoveEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>(currentSectionId)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(currentCategoryId)
  const [isMoving, setIsMoving] = useState(false)

  const handleMove = async () => {
    if (selectedSectionId === currentSectionId && selectedCategoryId === currentCategoryId) {
      toast.error("Please select a different section or category")
      return
    }

    // Validate that we have valid IDs
    if (!selectedSectionId || !selectedCategoryId) {
      toast.error("Please select both a section and category")
      return
    }

    // Ensure selectedSectionId is actually a section ID, not an entry ID
    const validSection = sections.find(section => section.id === selectedSectionId)
    if (!validSection) {
      toast.error("Invalid section selected")
      return
    }

    // Ensure selectedCategoryId exists in the selected section
    const validCategory = validSection.categories.find(cat => cat.id === selectedCategoryId)
    if (!validCategory) {
      toast.error("Invalid category selected")
      return
    }

    try {
      setIsMoving(true)
      // Fixed: Only pass newSectionId and newCategoryId (entryId is already known by parent)
      await onMove(selectedSectionId, selectedCategoryId)
      setOpen(false)
      toast.success("Entry moved successfully")
    } catch (error) {
      console.error("Move error:", error)
      toast.error("Failed to move entry")
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-blue-500 text-white border-none"
          aria-label={`Move ${entryType}`}
        >
          <Move className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="move-dialog-description">
        <DialogHeader>
          <DialogTitle>Move Entry</DialogTitle>
        </DialogHeader>
        <div id="move-dialog-description" className="sr-only">
          Select a new section and category to move this entry to
        </div>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {sections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <div className="space-y-2 pl-4">
                    {section.categories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedSectionId === section.id && selectedCategoryId === category.id
                            ? "bg-blue-100 border-2 border-blue-300"
                            : "border-2 border-transparent"
                        }`}
                        onClick={() => {
                          setSelectedSectionId(section.id)
                          setSelectedCategoryId(category.id)
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{category.title}</span>
                          {selectedSectionId === section.id && selectedCategoryId === category.id && (
                            <span className="text-blue-600 text-sm">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMove} 
              disabled={isMoving || isLoading || (selectedSectionId === currentSectionId && selectedCategoryId === currentCategoryId)}
            >
              {isMoving ? "Moving..." : "Move"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}