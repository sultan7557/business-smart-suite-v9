"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Archive, Edit, Trash2, Eye, Check, X, Filter, Home, Printer, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { toggleArchiveMaintenanceItem, deleteMaintenanceItem, getDocumentById } from "@/app/actions/maintenance-actions"
import MaintenanceForm from "./maintenance-form"
import DocumentUpload from "./document-upload"
import DocumentViewer from "./document-viewer"
import VersionHistoryDialog from "./version-history-dialog"
import { format } from "date-fns"
import Link from "next/link"
import { Loader } from '@/components/ui/loader'

// Helper function to get due date color
const getDueDateColor = (dueDate: string | Date) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Calculate difference in days
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "bg-red-600 text-white"; // Overdue
  if (diffDays < 30) return "bg-red-500 text-white"; // Due soon
  if (diffDays < 60) return "bg-yellow-500 text-white"; // Coming up
  return "bg-green-500 text-white"; // Plenty of time
};

interface MaintenanceClientProps {
  maintenanceItems: any[];
  closedMaintenanceItems: any[];
  calibrationItems: any[];
  closedCalibrationItems: any[];
  users: any[];
  subCategories: string[];
  canEdit: boolean;
  canDelete: boolean;
  showArchived: boolean;
  toggleShowArchived: (currentState: boolean) => Promise<{ success: boolean; data: boolean; error?: string }>;
}

export default function MaintenanceClient({
  maintenanceItems,
  closedMaintenanceItems,
  calibrationItems,
  closedCalibrationItems,
  users,
  subCategories,
  canEdit,
  canDelete,
  showArchived,
  toggleShowArchived,
}: MaintenanceClientProps) {
  // State for client-side rendering
  const [mounted, setMounted] = useState(false);
  const [localShowArchived, setLocalShowArchived] = useState(showArchived);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSubCategory, setFilterSubCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOwner, setFilterOwner] = useState<string>("all");
  const [filterAllocatedTo, setFilterAllocatedTo] = useState<string>("all");
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  
  // Collapsible state for sections
  const [openMaintenanceExpanded, setOpenMaintenanceExpanded] = useState(true);
  const [closedMaintenanceExpanded, setClosedMaintenanceExpanded] = useState(true);
  const [openCalibrationExpanded, setOpenCalibrationExpanded] = useState(true);
  const [closedCalibrationExpanded, setClosedCalibrationExpanded] = useState(true);

  // Local loading state per item id and action
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
    setLocalShowArchived(showArchived);
  }, [showArchived]);

  // Print handler for specific sections
  const handlePrintSection = (sectionName: string, items: any[]) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${sectionName} - Maintenance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { text-align: right; margin-bottom: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${sectionName}</h1>
            <h2>Maintenance Report</h2>
          </div>
          <div class="date">
            Generated on: ${new Date().toLocaleDateString()}
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Ref</th>
                <th>Serial</th>
                <th>Action</th>
                <th>Supplier</th>
                <th>Frequency</th>
                <th>Due Date</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.name || '-'}</td>
                  <td>${item.reference || '-'}</td>
                  <td>${item.serialNumber || '-'}</td>
                  <td>${item.actionRequired || '-'}</td>
                  <td>${item.supplier || '-'}</td>
                  <td>${item.frequency || '-'}</td>
                  <td>${item.dueDate ? format(new Date(item.dueDate), 'dd/MM/yyyy') : '-'}</td>
                  <td>${item.owner || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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

  const handleArchiveToggle = async (id: string) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'archive' }))
      const result = await toggleArchiveMaintenanceItem(id);
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success && result.data) {
        toast({
          title: "Success",
          description: `Maintenance item ${result.data.archived ? "archived" : "unarchived"} successfully.`,
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
    if (!confirm("Are you sure you want to delete this maintenance item? This action cannot be undone.")) {
      return;
    }

    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteMaintenanceItem(id);
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Maintenance item deleted successfully.",
        });
      } else {
        throw new Error(result.error || "Failed to delete maintenance item");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the maintenance item.",
        variant: "destructive",
      });
    }
  };

  const handleToggleArchived = async () => {
    try {
      const result = await toggleShowArchived(localShowArchived);
      if (!result.success) {
        throw new Error(result.error || "Failed to toggle archived view");
      }
      // Force a page refresh to update the view
      window.location.href = `/maintenance?showArchived=${!localShowArchived}`;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while toggling archived view.",
        variant: "destructive",
      });
    }
  };

  const renderMaintenanceTable = (items: any[], title: string, isExpanded: boolean, onToggle: () => void) => {
    // Filter items based on selected filters
    const filteredItems = items.filter(item => {
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (filterSubCategory !== "all" && item.subCategory !== filterSubCategory) return false;
      if (filterStatus !== "all") {
        if (filterStatus === "completed" && !item.completed) return false;
        if (filterStatus === "pending" && item.completed) return false;
      }
      if (filterOwner !== "all" && item.owner !== filterOwner) return false;
      if (filterAllocatedTo !== "all" && item.allocatedTo !== filterAllocatedTo) return false;
      return true;
    });

    if (filteredItems.length === 0) {
      return (
        <Card className="mb-6">
          <CardHeader className="bg-gray-700 text-white py-3 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                {title}
              </CardTitle>
              <Button 
                variant="ghost" 
                className="text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrintSection(title, filteredItems);
                }}
              >
                <Printer className="h-4 w-4" />
            </Button>
            </div>
          </CardHeader>
          {isExpanded && (
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No maintenance items found.</p>
          </CardContent>
          )}
        </Card>
      );
    }

    // Replace the table rendering with a flexbox-based layout
    return (
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="bg-gray-700 text-white py-3 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
              {title}
            </CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                className="text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrintSection(title, filteredItems);
                }}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleArchived();
                }}
              >
                {localShowArchived ? "Hide Archived" : "Show Archived"}
              </Button>
              {canEdit && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={(e) => e.stopPropagation()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Maintenance Item</DialogTitle>
                    </DialogHeader>
                    <MaintenanceForm
                      users={users}
                      subCategories={subCategories}
                      onClose={() => {
                        setIsDialogOpen(false);
                        // Refresh the page to show the new item
                        window.location.reload();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="p-0">
            <div className="hidden md:flex w-full bg-gray-100 font-semibold text-sm border-b">
              <div className="flex-[2] px-2 py-2">Item</div>
              <div className="flex-1 px-2 py-2">Ref</div>
              <div className="flex-1 px-2 py-2">Serial</div>
              <div className="flex-[2] px-2 py-2">Action</div>
              <div className="flex-1 px-2 py-2">Supplier</div>
              <div className="flex-1 px-2 py-2">Tolerance</div>
              <div className="flex-1 px-2 py-2">Frequency</div>
              <div className="flex-1 px-2 py-2 text-center">Due date</div>
              <div className="flex-1 px-2 py-2">Owner</div>
              <div className="flex-1 px-2 py-2 text-center">Actions</div>
            </div>
            <div className="flex flex-col w-full">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex flex-wrap md:flex-nowrap border-b items-center cursor-pointer hover:bg-gray-50 transition-colors ${item.archived ? "bg-gray-100" : ""}`} 
                  style={{ minWidth: 0 }}
                  onClick={(e) => {
                    // Don't navigate if clicking on action buttons
                    if ((e.target as HTMLElement).closest('button')) {
                      return;
                    }
                    // Open edit dialog
                    setSelectedItem(item);
                    setEditDialogOpen(true);
                  }}
                >
                  <div className="flex-[2] px-2 py-2 truncate" title={item.name}>{item.name}</div>
                  <div className="flex-1 px-2 py-2 truncate" title={item.reference}>{item.reference || "-"}</div>
                  <div className="flex-1 px-2 py-2 truncate" title={item.serialNumber}>{item.serialNumber || "-"}</div>
                  <div className="flex-[2] px-2 py-2 truncate" title={item.actionRequired}>{item.actionRequired}</div>
                  <div className="flex-1 px-2 py-2 truncate" title={item.supplier}>{item.supplier || "-"}</div>
                  <div className="flex-1 px-2 py-2">-</div>
                  <div className="flex-1 px-2 py-2 truncate" title={item.frequency}>{item.frequency}</div>
                  <div className="flex-1 px-2 py-2">
                    <div className={`text-center font-bold rounded-md p-2 ${getDueDateColor(item.dueDate)}`}>{format(new Date(item.dueDate), "dd/MM/yyyy")}</div>
                  </div>
                  <div className="flex-1 px-2 py-2 truncate" title={item.owner}>{item.owner}</div>
                  <div className="flex-1 px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedItem(item);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleArchiveToggle(item.id)}
                          disabled={loadingAction[item.id] === 'archive'}
                        >
                          {loadingAction[item.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          disabled={loadingAction[item.id] === 'delete'}
                        >
                          {loadingAction[item.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4 text-red-500" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Skeleton for progressive loading (future SSR/CSR)
  if (!maintenanceItems) {
    return (
      <div className="py-8 flex justify-center">
        <Loader size="lg" message="Loading maintenance items..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold flex-1 text-center">Planned Maintenance</h1>
          <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsVersionDialogOpen(true)}>
            Version History
            </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleArchived}
          >
            {localShowArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Maintenance Item</DialogTitle>
                </DialogHeader>
                <MaintenanceForm 
                  isDialog={true} 
                  onClose={() => setIsDialogOpen(false)} 
                  users={users}
                  subCategories={subCategories}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center justify-center space-x-2 bg-gray-50 p-3 rounded-lg">
        <span className="text-sm font-medium">Filter by sub-category:</span>
        <Select value={filterSubCategory} onValueChange={setFilterSubCategory}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="-- Select sub-category to filter --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">-- Select sub-category to filter --</SelectItem>
            {subCategories.map((subCategory) => (
              <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setFilterSubCategory("all")}>
          Clear Filter
        </Button>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Maintenance Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p>{selectedItem.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Category</h3>
                <p>{selectedItem.category}</p>
              </div>
              <div>
                <h3 className="font-medium">Sub-Category</h3>
                <p>{selectedItem.subCategory}</p>
              </div>
              <div>
                <h3 className="font-medium">Supplier</h3>
                <p>{selectedItem.supplier || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Serial Number</h3>
                <p>{selectedItem.serialNumber || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Reference</h3>
                <p>{selectedItem.reference || "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Action Required</h3>
                <p className="whitespace-pre-line">{selectedItem.actionRequired}</p>
              </div>
              <div>
                <h3 className="font-medium">Frequency</h3>
                <p>{selectedItem.frequency}</p>
              </div>
              <div>
                <h3 className="font-medium">Due Date</h3>
                <p>{selectedItem.dueDate ? format(new Date(selectedItem.dueDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <h3 className="font-medium">Owner</h3>
                <p>{selectedItem.owner}</p>
              </div>
              <div>
                <h3 className="font-medium">Allocated To</h3>
                <p>{selectedItem.allocatedTo || "-"}</p>
              </div>
              {selectedItem.completed && (
                <div>
                  <h3 className="font-medium">Date Completed</h3>
                  <p>{selectedItem.dateCompleted ? format(new Date(selectedItem.dateCompleted), "dd/MM/yyyy") : "-"}</p>
                </div>
              )}

              {/* Documents Section */}
              {selectedItem.documents && selectedItem.documents.length > 0 && (
                <div>
                  <h3 className="font-medium">Documents</h3>
                  <div className="space-y-2">
                    {selectedItem.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-600">
                            Uploaded by {doc.uploadedBy?.name || "Unknown"} on {format(new Date(doc.uploadedAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Normalize fileUrl for preview
                            let normalizedFileUrl = doc.fileUrl;
                            if (normalizedFileUrl && !normalizedFileUrl.startsWith('/api/documents/download/')) {
                              normalizedFileUrl = `/api/documents/download/${normalizedFileUrl.replace(/^\/uploads\//, '')}`;
                            }
                            setSelectedDocument({ ...doc, fileUrl: normalizedFileUrl });
                            setDocumentViewerOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedItem(null);
                    setViewDialogOpen(false);
                  }}
                >
                  Close
                </Button>
                {canEdit && (
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {canEdit && (
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setDocumentDialogOpen(true);
                    }}
                  >
                    Upload Document
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Maintenance Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <MaintenanceForm
              item={selectedItem}
              users={users}
              subCategories={subCategories}
              onClose={() => {
                setEditDialogOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <DocumentUpload 
              maintenanceId={selectedItem.id} 
              onUploadComplete={() => {
                setDocumentDialogOpen(false);
                // Refresh the page to show the new document
                window.location.reload();
              }}
              onCancel={() => setDocumentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Document</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <DocumentViewer 
              document={selectedDocument} 
              onBack={() => setDocumentViewerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={isVersionDialogOpen}
        onOpenChange={setIsVersionDialogOpen}
      />

      {renderMaintenanceTable(maintenanceItems, "Open maintenance items", openMaintenanceExpanded, () => setOpenMaintenanceExpanded(!openMaintenanceExpanded))}
      {renderMaintenanceTable(closedMaintenanceItems, "Closed maintenance items", closedMaintenanceExpanded, () => setClosedMaintenanceExpanded(!closedMaintenanceExpanded))}
      {renderMaintenanceTable(calibrationItems, "Open calibration items", openCalibrationExpanded, () => setOpenCalibrationExpanded(!openCalibrationExpanded))}
      {renderMaintenanceTable(closedCalibrationItems, "Closed calibration items", closedCalibrationExpanded, () => setClosedCalibrationExpanded(!closedCalibrationExpanded))}

      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
        </Button>
      </div>
    </div>
  );
}