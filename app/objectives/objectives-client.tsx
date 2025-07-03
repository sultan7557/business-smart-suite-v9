"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Archive, Edit, Trash2, Eye, Check, X, Home, Printer, ChevronDown, ChevronRight } from 'lucide-react'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { toggleArchiveObjective, deleteObjective } from "@/app/actions/objective-actions"
import ObjectiveForm from "./objective-form"
import { format } from "date-fns"
import ObjectiveVersionHistoryDialog from "./version-history-dialog"
import ObjectivePageReviewsDialog from "./page-reviews-dialog"
import { Loader } from '@/components/ui/loader'

// Helper function to get risk level color
const getRiskLevelColor = (level: number) => {
  if (level >= 15) return "bg-red-500 text-white";
  if (level >= 9) return "bg-yellow-500 text-white";
  return "bg-green-500 text-white";
};

// Helper function to format date
const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  return format(new Date(date), "MMM yyyy");
};

interface ObjectivesClientProps {
  openObjectives: any[] | undefined;
  completedObjectives: any[] | undefined;
  canEdit: boolean;
  canDelete: boolean;
  showArchived: boolean;
  toggleShowArchived: (currentState: boolean) => Promise<{ success: boolean; data: boolean; error?: string }>;
}

export default function ObjectivesClient({
  openObjectives = [],
  completedObjectives = [],
  canEdit,
  canDelete,
  showArchived,
  toggleShowArchived,
}: ObjectivesClientProps) {
  const [selectedObjective, setSelectedObjective] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isReviewsDialogOpen, setIsReviewsDialogOpen] = useState(false);
  const [openObjectivesExpanded, setOpenObjectivesExpanded] = useState(true);
  const [completedObjectivesExpanded, setCompletedObjectivesExpanded] = useState(true);
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  
  const handleArchiveToggle = async (id: string) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'archive' }))
      const result = await toggleArchiveObjective(id);
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success && result.data) {
        toast({
          title: "Success",
          description: `Objective ${result.data.archived ? "archived" : "unarchived"} successfully.`,
        });
      } else {
        throw new Error(result.error || "Failed to toggle archive status");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while toggling archive status.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this objective? This action cannot be undone.")) {
      return;
    }

    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteObjective(id);
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Objective deleted successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to delete objective");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the objective.",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchived = async () => {
    try {
      const result = await toggleShowArchived(showArchived);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle archived view");
      }
      // Force a page refresh to update the view
      window.location.href = `/objectives?showArchived=${!showArchived}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while toggling archived view.",
        variant: "destructive",
      });
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  const renderObjectivesTable = (objectives: any[], title: string, isExpanded: boolean, onToggle: () => void) => {
    if (objectives.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader className="bg-gray-700 text-white py-3 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                {title}
              </CardTitle>
            </div>
          </CardHeader>
          {isExpanded && (
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No objectives found.</p>
          </CardContent>
          )}
        </Card>
      );
    }

    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-gray-700 text-white py-3 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        {isExpanded && (
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Objective</th>
                  <th className="px-4 py-2 text-left">Target</th>
                  <th className="px-4 py-2 text-left">Resources</th>
                  <th className="px-4 py-2 text-left">Progress to date</th>
                  <th className="px-4 py-2 text-left">Who</th>
                  <th className="px-4 py-2 text-center">Due</th>
                  <th className="px-4 py-2 text-center">Risk</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {objectives.map((objective) => (
                  <tr key={objective.id} className={`border-b ${objective.archived ? "bg-gray-100" : ""}`}>
                    <td className="px-4 py-2">
                      {objective.categories.map((category: string) => (
                        <div key={category} className="text-xs inline-block bg-gray-200 rounded px-2 py-1 mr-1 mb-1">
                          {category}
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium">{objective.objective}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm max-w-[200px] truncate" title={objective.target}>
                        {objective.target}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm max-w-[150px] truncate" title={objective.resourcesRequired}>
                        {objective.resourcesRequired}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm max-w-[200px] truncate" title={objective.progressToDate}>
                        {objective.progressToDate}
                      </div>
                    </td>
                    <td className="px-4 py-2">{objective.who}</td>
                    <td className="px-4 py-2 text-center">{formatDate(objective.dueDate)}</td>
                    <td className="px-4 py-2">
                      <div className={`text-center font-bold rounded-md p-2 ${getRiskLevelColor(objective.riskLevel)}`}>
                        {objective.riskLevel}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedObjective(objective);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedObjective(objective);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {canEdit && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleArchiveToggle(objective.id)}
                            disabled={loadingAction[objective.id] === 'archive'}
                          >
                            {loadingAction[objective.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                          </Button>
                        )}
                        
                        {canDelete && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(objective.id)}
                            disabled={loadingAction[objective.id] === 'delete'}
                          >
                            {loadingAction[objective.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4 text-red-500" />}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        )}
      </Card>
    );
  };

  // Skeleton for progressive loading (future SSR/CSR)
  if (!openObjectives || !completedObjectives) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" message="Loading objectives..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
      <Button
          variant="outline"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 text-center">Objectives</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsVersionDialogOpen(true)}>
            Version History
          </Button>
          <Button variant="outline" onClick={() => setIsReviewsDialogOpen(true)}>
            Page Reviews
          </Button>
          <Button variant="outline" onClick={handlePrint} title="Print Objectives">
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleArchived}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Objective</DialogTitle>
                </DialogHeader>
                <ObjectiveForm 
                  isDialog={true} 
                  onClose={() => setIsDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Objective</DialogTitle>
          </DialogHeader>
          {selectedObjective && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-medium">Source</h3>
                <p>{selectedObjective.source || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Categories</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedObjective.categories.map((category: string) => (
                    <div key={category} className="bg-gray-200 rounded px-2 py-1 text-sm">
                      {category}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium">Objective</h3>
                <p>{selectedObjective.objective}</p>
              </div>
              <div>
                <h3 className="font-medium">Target</h3>
                <p className="whitespace-pre-line">{selectedObjective.target}</p>
              </div>
              <div>
                <h3 className="font-medium">Resources Required</h3>
                <p className="whitespace-pre-line">{selectedObjective.resourcesRequired}</p>
              </div>
              <div>
                <h3 className="font-medium">Progress to Date</h3>
                <p className="whitespace-pre-line">{selectedObjective.progressToDate}</p>
              </div>
              <div>
                <h3 className="font-medium">Who</h3>
                <p>{selectedObjective.who}</p>
              </div>
              <div>
                <h3 className="font-medium">Due Date</h3>
                <p>{selectedObjective.dueDate ? format(new Date(selectedObjective.dueDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Risk Level</h3>
                <div className={`inline-block font-bold rounded-md p-2 ${getRiskLevelColor(selectedObjective.riskLevel)}`}>
                  {selectedObjective.riskLevel}
                </div>
                <p className="mt-1 text-sm">Likelihood: {selectedObjective.likelihood}, Severity: {selectedObjective.severity}</p>
              </div>
              {selectedObjective.completed && (
                <div>
                  <h3 className="font-medium">Date Completed</h3>
                  <p>{selectedObjective.dateCompleted ? format(new Date(selectedObjective.dateCompleted), "dd/MM/yyyy") : "-"}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Objective</DialogTitle>
          </DialogHeader>
          {selectedObjective && (
            <ObjectiveForm 
              objective={selectedObjective} 
              isDialog={true} 
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <ObjectiveVersionHistoryDialog
        open={isVersionDialogOpen}
        onOpenChange={setIsVersionDialogOpen}
      />

      {/* Page Reviews Dialog */}
      <ObjectivePageReviewsDialog
        open={isReviewsDialogOpen}
        onOpenChange={setIsReviewsDialogOpen}
      />

      {renderObjectivesTable(openObjectives, "Open objectives", openObjectivesExpanded, () => setOpenObjectivesExpanded(!openObjectivesExpanded))}
      {renderObjectivesTable(completedObjectives, "Completed objectives", completedObjectivesExpanded, () => setCompletedObjectivesExpanded(!completedObjectivesExpanded))}

      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
        </Button>
      </div>
    </div>
  );
}