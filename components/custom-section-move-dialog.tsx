"use client"

import MoveEntryDialog from "@/components/move-entry-dialog"
import { moveCustomSectionDocument } from "@/app/actions/custom-section-actions"

interface CustomSectionMoveDialogProps {
  entryId: string
  entryType: string
  currentSectionId: string
  currentCategoryId: string
  sections: {
    id: string
    title: string
    categories: {
      id: string
      title: string
    }[]
  }[]
}

export function CustomSectionMoveDialog({
  entryId,
  entryType,
  currentSectionId,
  currentCategoryId,
  sections,
}: CustomSectionMoveDialogProps) {
  const handleMove = async (newSectionId: string, newCategoryId: string) => {
    await moveCustomSectionDocument(entryId, newCategoryId)
  }

  return (
    <MoveEntryDialog
      entryId={entryId}
      entryType={entryType}
      currentSectionId={currentSectionId}
      currentCategoryId={currentCategoryId}
      sections={sections}
      isLoading={false}
      onMove={handleMove}
    />
  )
} 