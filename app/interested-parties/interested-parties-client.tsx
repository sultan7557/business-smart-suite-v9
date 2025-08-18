"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ArrowUpDown, Archive, Plus, RotateCcw, Home, History, FileText } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { 
  deleteInterestedParty, 
  archiveInterestedParty, 
  reorderInterestedParty,
  unarchiveInterestedParty 
} from "@/app/actions/interested-party-actions"
import InterestedPartyForm from "./interested-party-form"
import VersionHistoryDialog from "./version-history-dialog"
import PageReviewsDialog from "./page-reviews-dialog"
import { Loader } from '@/components/ui/loader'

interface InterestedPartiesClientProps {
  interestedParties: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function InterestedPartiesClient({ 
  interestedParties, 
  canEdit, 
  canDelete 
}: InterestedPartiesClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedParty, setSelectedParty] = useState<any>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [pageReviewsOpen, setPageReviewsOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  
  const handleAddNew = () => {
    setSelectedParty(null)
    setFormOpen(true)
  }
  
  const handleEdit = (party: any) => {
    setSelectedParty(party)
    setFormOpen(true)
  }
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this interested party? This action cannot be undone.")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteInterestedParty(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Interested party deleted",
          description: "The interested party has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete interested party.",
          variant: "destructive",
        })
      }
    }
  }
  
  const handleArchive = async (id: string) => {
    setLoadingAction((prev) => ({ ...prev, [id]: 'archive' }))
    const result = await archiveInterestedParty(id)
    setLoadingAction((prev) => ({ ...prev, [id]: null }))
    if (result.success) {
      toast({
        title: "Interested party archived",
        description: "The interested party has been archived successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to archive interested party.",
        variant: "destructive",
      })
    }
  }

  const handleUnarchive = async (id: string) => {
    setLoadingAction((prev) => ({ ...prev, [id]: 'unarchive' }))
    const result = await unarchiveInterestedParty(id)
    setLoadingAction((prev) => ({ ...prev, [id]: null }))
    if (result.success) {
      toast({
        title: "Interested party restored",
        description: "The interested party has been restored successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to restore interested party.",
        variant: "destructive",
      })
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setLoadingAction((prev) => ({ ...prev, [id]: 'reorder' }))
    const result = await reorderInterestedParty(id, direction)
    setLoadingAction((prev) => ({ ...prev, [id]: null }))
    if (result.success) {
      toast({
        title: "Interested party reordered",
        description: `The interested party has been moved ${direction}.`,
      })
      // Refresh the page to show the new order
      window.location.reload()
    } else {
      toast({
        title: "Error",
        description: result.error || `Failed to move interested party ${direction}.`,
        variant: "destructive",
      })
    }
  }

  const getRiskLevelColor = (level: number) => {
    if (level <= 3) return "bg-green-500"
    if (level <= 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const filteredParties = interestedParties.filter(party => 
    showArchived ? true : !party.archived
  )

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={handleAddNew} disabled={!canEdit}>
            <Plus className="mr-2 h-4 w-4" />
            Add Interested Party
          </Button>
          <Button variant="outline" onClick={() => setVersionHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            Version History
          </Button>
          <Button variant="outline" onClick={() => setPageReviewsOpen(true)}>
            <Home className="mr-2 h-4 w-4" />
            Page Reviews
          </Button>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center space-x-2"
        >
          {showArchived ? (
            <>
              <RotateCcw className="h-4 w-4" />
              Hide Archived
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              Show Archived
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Interested Party</th>
              <th className="border p-2 text-center">Risk Level</th>
              <th className="border p-2 text-left">Controls and Recommendations</th>
              <th className="border p-2 text-center">Residual Risk</th>
              <th className="border p-2 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-4 text-center text-gray-500">
                  No interested parties found. Click the "Add Interested Party" button to create one.
                </td>
              </tr>
            ) : (
              filteredParties.map((party) => (
                <tr 
                  key={party.id} 
                  className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${party.archived ? 'bg-gray-100' : ''}`}
                  onClick={(e) => {
                    // Don't navigate if clicking on action buttons
                    if ((e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    handleEdit(party);
                  }}
                >
                  <td className="border p-2">
                    <div className="font-medium">{party.name}</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{party.needsExpectations}</div>
                  </td>
                  <td className={`border p-2 text-center ${getRiskLevelColor(party.riskLevel)} text-white font-bold`}>
                    {party.riskLevel}
                  </td>
                  <td className="border p-2">
                    <div className="text-sm whitespace-pre-wrap">{party.controlsRecommendations}</div>
                  </td>
                  <td className={`border p-2 text-center ${getRiskLevelColor(party.residualRiskLevel)} text-white font-bold`}>
                    {party.residualRiskLevel}
                  </td>
                  <td className="border p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center space-x-1">
                      {canEdit && !party.archived && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleReorder(party.id, "up")}
                            title="Move up"
                            disabled={loadingAction[party.id] === 'reorder'}
                            className="px-1"
                          >
                            {loadingAction[party.id] === 'reorder' ? <Loader size="sm" ariaLabel="Reordering..." /> : <ArrowUpDown className="h-4 w-4 rotate-180" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleReorder(party.id, "down")}
                            title="Move down"
                            disabled={loadingAction[party.id] === 'reorder'}
                            className="px-1"
                          >
                            {loadingAction[party.id] === 'reorder' ? <Loader size="sm" ariaLabel="Reordering..." /> : <ArrowUpDown className="h-4 w-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(party)}
                            title="Edit"
                            disabled={loadingAction[party.id] === 'edit'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <>
                          {party.archived ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleUnarchive(party.id)}
                              title="Restore"
                              disabled={loadingAction[party.id] === 'unarchive'}
                            >
                              {loadingAction[party.id] === 'unarchive' ? <Loader size="sm" ariaLabel="Restoring..." /> : <RotateCcw className="h-4 w-4" />}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleArchive(party.id)}
                              title="Archive"
                              disabled={loadingAction[party.id] === 'archive'}
                            >
                              {loadingAction[party.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(party.id)}
                            className="text-red-500"
                            title="Delete"
                            disabled={loadingAction[party.id] === 'delete'}
                          >
                            {loadingAction[party.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <InterestedPartyForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        interestedParty={selectedParty} 
      />
      
      <VersionHistoryDialog 
        open={versionHistoryOpen} 
        onOpenChange={setVersionHistoryOpen} 
        interestedPartyId={filteredParties[0]?.id || ""} 
        interestedPartyName="Interested Parties"
      />
      
      <PageReviewsDialog 
        open={pageReviewsOpen} 
        onOpenChange={setPageReviewsOpen} 
        interestedPartyId={filteredParties[0]?.id || ""} 
        interestedPartyName="Interested Parties"
      />
    </>
  )
}