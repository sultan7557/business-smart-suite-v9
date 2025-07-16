"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Archive, Eye, RotateCcw, Printer, ChevronDown, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { archiveImprovementRegister, deleteImprovementRegister, restoreImprovementRegister } from "../actions/improvement-register-actions"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import VersionHistoryDialog from "./version-history-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from '@/components/ui/loader'

interface ImprovementRegisterClientProps {
  improvements: any[]
  completedImprovements: any[]
  users: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function ImprovementRegisterClient({
  improvements,
  completedImprovements,
  users,
  canEdit,
  canDelete,
}: ImprovementRegisterClientProps) {
  const [categoryFilter, setCategoryFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [rootCauseFilter, setRootCauseFilter] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  
  // Collapsible state for sections
  const [currentItemsExpanded, setCurrentItemsExpanded] = useState(true)
  const [completedItemsExpanded, setCompletedItemsExpanded] = useState(true)

  // Category options
  const categoryOptions = [
    "Accident",
    "Complaint",
    "Environment",
    "External Audit",
    "Goods Damaged in Transit",
    "Health and Safety",
    "Improvement Suggestion",
    "Information Security",
    "Installation Issue",
    "Internal Audit",
    "Management Review",
    "Near Miss",
    "Process Issue",
    "Safeguarding",
    "Supplier Defect",
  ]

  // Type options
  const typeOptions = ["OFI", "Non Conformance", "Major Non Conformance"]

  // Root cause options
  const rootCauseOptions = [
    "Materials",
    "Machinery",
    "Location",
    "Human Error",
    "Management Error",
    "Lack of Control Procedure",
    "Software",
    "Information Security",
  ]

  // Filter improvements based on selected filters
  const filteredImprovements = improvements.filter((improvement) => {
    // Skip if category filter is set and doesn't match
    if (categoryFilter && categoryFilter !== "all" && improvement.category !== categoryFilter) return false
    
    // Skip if type filter is set and doesn't match
    if (typeFilter && typeFilter !== "all" && improvement.type !== typeFilter) return false
    
    // Skip if root cause filter is set and doesn't match
    if (rootCauseFilter && rootCauseFilter !== "all" && improvement.rootCauseType !== rootCauseFilter) return false
    
    // Show archived items only when showArchived is true
    if (showArchived && !improvement.archived) return false
    if (!showArchived && improvement.archived) return false
    
    return true
  })

  const filteredCompletedImprovements = completedImprovements.filter((improvement) => {
    // Skip if category filter is set and doesn't match
    if (categoryFilter && categoryFilter !== "all" && improvement.category !== categoryFilter) return false
    
    // Skip if type filter is set and doesn't match
    if (typeFilter && typeFilter !== "all" && improvement.type !== typeFilter) return false
    
    // Skip if root cause filter is set and doesn't match
    if (rootCauseFilter && rootCauseFilter !== "all" && improvement.rootCauseType !== rootCauseFilter) return false
    
    // Show archived items only when showArchived is true
    if (showArchived && !improvement.archived) return false
    if (!showArchived && improvement.archived) return false
    
    return true
  })

  // Add local loading states for archive, restore, and delete actions
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this improvement?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'archive' }))
      const result = await archiveImprovementRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement archived successfully",
        })
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive improvement",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this improvement? This action cannot be undone.")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteImprovementRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete improvement",
          variant: "destructive",
        })
      }
    }
  }

  const handleRestore = async (id: string) => {
    if (confirm("Are you sure you want to restore this improvement?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'restore' }))
      const result = await restoreImprovementRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Improvement restored successfully",
        })
        // Refresh the page to show updated list
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to restore improvement",
          variant: "destructive",
        })
      }
    }
  }

  const getOwnerName = (improvement: any) => {
    if (improvement.internalOwner) {
      return improvement.internalOwner.name
    }
    if (improvement.externalOwner) {
      return improvement.externalOwner
    }
    return "Not assigned"
  }

  const handlePrintImprovement = (improvement: any) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Problem Report - ${improvement.number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .report-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .field-value {
              padding: 8px;
              border: 1px solid #ddd;
              background-color: #f9f9f9;
              min-height: 20px;
            }
            .full-width {
              grid-column: 1 / -1;
            }
            .description {
              grid-column: 1 / -1;
              margin-bottom: 20px;
            }
            .checkboxes {
              grid-column: 1 / -1;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .checkbox-item {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .checkbox {
              width: 20px;
              height: 20px;
              border: 2px solid #333;
              display: inline-block;
              text-align: center;
              line-height: 16px;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: right;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Problem Report</h1>
          </div>
          
          <div class="report-grid">
            <div class="field">
              <div class="field-label">No:</div>
              <div class="field-value">${improvement.number}${improvement.numberSuffix ? `-${improvement.numberSuffix}` : ''}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Type:</div>
              <div class="field-value">${improvement.type}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Raised by:</div>
              <div class="field-value">${improvement.internalRaisedBy ? improvement.internalRaisedBy.name : improvement.externalRaisedBy || 'Not specified'}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Category:</div>
              <div class="field-value">${improvement.category}${improvement.otherCategory ? ` (${improvement.otherCategory})` : ''}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Date:</div>
              <div class="field-value">${format(new Date(improvement.dateRaised), 'dd/MMM/yyyy')}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Originator:</div>
              <div class="field-value">${improvement.originator || 'Not specified'}</div>
            </div>
          </div>
          
          <div class="description">
            <div class="field-label">Description of problem/potential problem/non conformance:</div>
            <div class="field-value" style="min-height: 60px;">${improvement.description}</div>
          </div>
          
          <div class="checkboxes">
            <div class="checkbox-item">
              <div class="checkbox">${improvement.evaluatedForSimilar ? '✓' : ''}</div>
              <div>Evaluated for similar non-conformances?</div>
            </div>
            
            <div class="checkbox-item">
              <div class="checkbox">${improvement.requiresRiskAnalysis ? '✓' : ''}</div>
              <div>Any changes required to risk analysis?</div>
            </div>
            
            <div class="checkbox-item">
              <div class="checkbox">${improvement.affectedPolicies ? '✓' : ''}</div>
              <div>Has this effected the company's policies and/or objectives?</div>
            </div>
            
            <div class="checkbox-item">
              <div class="checkbox">${improvement.justified ? '✓' : ''}</div>
              <div>Justified?</div>
            </div>
          </div>
          
          <div class="report-grid">
            <div class="field">
              <div class="field-label">Containment action taken:</div>
              <div class="field-value">${improvement.containmentAction || 'Not specified'}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Root cause type:</div>
              <div class="field-value">${improvement.rootCauseType || 'Not specified'}</div>
            </div>
            
            <div class="field full-width">
              <div class="field-label">Cause of problem/investigation:</div>
              <div class="field-value">${improvement.rootCause || 'Not specified'}</div>
            </div>
            
            <div class="field full-width">
              <div class="field-label">Corrective or preventive action:</div>
              <div class="field-value">${improvement.correctiveAction || 'Not specified'}</div>
            </div>
            
            <div class="field full-width">
              <div class="field-label">Additional notes:</div>
              <div class="field-value">${improvement.comments || 'Not specified'}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Action required by:</div>
              <div class="field-value">${improvement.dateDue ? format(new Date(improvement.dateDue), 'dd/MMM/yyyy') : 'Not specified'}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Completion date:</div>
              <div class="field-value">${improvement.dateCompleted ? format(new Date(improvement.dateCompleted), 'dd/MMM/yyyy') : 'Not completed'}</div>
            </div>
            
            <div class="field full-width">
              <div class="field-label">Result of action:</div>
              <div class="field-value">${improvement.effectivenessOfAction || 'Not specified'}</div>
            </div>
          </div>
          
          <div class="footer">
            Report generated on: ${new Date().toLocaleString()}
          </div>
          
          <div class="no-print">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (!improvements) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" message="Loading improvements..." />
      </div>
    )
  }

  const renderImprovementTable = (items: any[], title: string, isExpanded: boolean, onToggle: () => void) => {
    if (typeof items === 'undefined') {
      return (
        <div className="py-8 flex justify-center">
          <Loader size="lg" message={`Loading ${title.toLowerCase()}...`} />
        </div>
      )
    }

    if (items.length === 0) {
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
              <p className="text-muted-foreground">No improvement register items found.</p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date raised</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead>Date due</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((improvement) => (
                    <TableRow key={improvement.id}>
                      <TableCell>{improvement.number}</TableCell>
                      <TableCell>{format(new Date(improvement.dateRaised), "dd/MMM/yyyy")}</TableCell>
                      <TableCell>{improvement.category}</TableCell>
                      <TableCell>
                        <Badge variant={improvement.type === "OFI" ? "outline" : "destructive"}>{improvement.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{improvement.description}</TableCell>
                      <TableCell>{improvement.correctiveAction ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {improvement.dateDue ? format(new Date(improvement.dateDue), "MMM yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>{getOwnerName(improvement)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handlePrintImprovement(improvement)}
                            title="Print Report"
                            disabled={!!loadingAction[improvement.id]}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild disabled={!!loadingAction[improvement.id]}>
                            <Link href={`/improvement-register/${improvement.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canEdit && !improvement.archived && (
                            <Button variant="ghost" size="icon" asChild disabled={!!loadingAction[improvement.id]}>
                              <Link href={`/improvement-register/${improvement.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canEdit && (
                            <>
                              {improvement.archived ? (
                                <Button variant="ghost" size="icon" onClick={() => handleRestore(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                                  {loadingAction[improvement.id] === 'restore' ? <Loader size="sm" ariaLabel="Restoring..." /> : <RotateCcw className="h-4 w-4" />}
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => handleArchive(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                                  {loadingAction[improvement.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                                </Button>
                              )}
                            </>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                              {loadingAction[improvement.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderCompletedImprovementTable = (items: any[], title: string, isExpanded: boolean, onToggle: () => void) => {
    if (typeof items === 'undefined') {
      return (
        <div className="py-8 flex justify-center">
          <Loader size="lg" message={`Loading ${title.toLowerCase()}...`} />
        </div>
      )
    }

    if (items.length === 0) {
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
              <p className="text-muted-foreground">No completed improvement register items found.</p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Date raised</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((improvement) => (
                    <TableRow key={improvement.id}>
                      <TableCell>{improvement.number}</TableCell>
                      <TableCell>{format(new Date(improvement.dateRaised), "dd/MMM/yyyy")}</TableCell>
                      <TableCell>{improvement.category}</TableCell>
                      <TableCell>
                        <Badge variant={improvement.type === "OFI" ? "outline" : "destructive"}>{improvement.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{improvement.description}</TableCell>
                      <TableCell>{improvement.correctiveAction ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {improvement.dateDue ? format(new Date(improvement.dateDue), "MMM yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {improvement.dateCompleted ? format(new Date(improvement.dateCompleted), "MMM yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>{getOwnerName(improvement)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handlePrintImprovement(improvement)}
                            title="Print Report"
                            disabled={!!loadingAction[improvement.id]}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild disabled={!!loadingAction[improvement.id]}>
                            <Link href={`/improvement-register/${improvement.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {canEdit && !improvement.archived && (
                            <Button variant="ghost" size="icon" asChild disabled={!!loadingAction[improvement.id]}>
                              <Link href={`/improvement-register/${improvement.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canEdit && (
                            <>
                              {improvement.archived ? (
                                <Button variant="ghost" size="icon" onClick={() => handleRestore(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                                  {loadingAction[improvement.id] === 'restore' ? <Loader size="sm" ariaLabel="Restoring..." /> : <RotateCcw className="h-4 w-4" />}
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" onClick={() => handleArchive(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                                  {loadingAction[improvement.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                                </Button>
                              )}
                            </>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(improvement.id)} disabled={!!loadingAction[improvement.id]}>
                              {loadingAction[improvement.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Improvement Register</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsVersionDialogOpen(true)}>
            Version History
          </Button>
        {canEdit && (
          <Button asChild>
            <Link href="/improvement-register/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Entry
            </Link>
          </Button>
        )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Category filter</label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Category filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Categories --</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Type filter</label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Type filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Types --</SelectItem>
              {typeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Root cause filter</label>
          <Select value={rootCauseFilter} onValueChange={setRootCauseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Root cause filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Root Causes --</SelectItem>
              {rootCauseOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            setCategoryFilter("")
            setTypeFilter("")
            setRootCauseFilter("")
          }}
          variant="outline"
        >
          Clear Filters
        </Button>

        <Button
          onClick={() => setShowArchived(!showArchived)}
          variant={showArchived ? "default" : "outline"}
          className="ml-auto"
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>

      <div className="bg-gray-100 p-4">
        <p className="font-medium">
          Current latest improvement report reference is: {improvements[0]?.number || "N/A"}
        </p>
      </div>

      {renderImprovementTable(filteredImprovements, "Current Improvement Register Items", currentItemsExpanded, () => setCurrentItemsExpanded(!currentItemsExpanded))}
      {renderCompletedImprovementTable(filteredCompletedImprovements, "Completed Improvement Register Items", completedItemsExpanded, () => setCompletedItemsExpanded(!completedItemsExpanded))}

      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
                          </Button>
      </div>

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={isVersionDialogOpen}
        onOpenChange={setIsVersionDialogOpen}
      />
    </div>
  )
}
