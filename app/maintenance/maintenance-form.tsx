"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { createMaintenanceItem, updateMaintenanceItem, completeMaintenanceItem, getSubCategories } from "@/app/actions/maintenance-actions"
import { format } from "date-fns"
import DocumentUpload from "./document-upload"
import { Loader } from "@/components/ui/loader"

// Frequency options
const frequencyOptions = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
  "Two Yearly",
  "ThreeYearly",
];

// Category options
const categoryOptions = [
  "Maintenance",
  "Calibration",
];

interface MaintenanceFormProps {
  item?: any; // The maintenance item object if editing
  users?: any[]; // List of users for allocation
  subCategories: string[]; // List of available subcategories
  isDialog?: boolean;
  onClose?: () => void;
}

export default function MaintenanceForm({ item, users = [], subCategories = [], isDialog, onClose }: MaintenanceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState(item?.category || "Maintenance");
  const [subCategory, setSubCategory] = useState(item?.subCategory || "");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [supplier, setSupplier] = useState(item?.supplier || "");
  const [serialNumber, setSerialNumber] = useState(item?.serialNumber || "");
  const [reference, setReference] = useState(item?.reference || "");
  const [actionRequired, setActionRequired] = useState(item?.actionRequired || "");
  const [frequency, setFrequency] = useState(item?.frequency || "Monthly");
  const [dueDate, setDueDate] = useState(item?.dueDate ? format(new Date(item.dueDate), "yyyy-MM-dd") : "");
  const [owner, setOwner] = useState(item?.owner || "");
  const [allocatedTo, setAllocatedTo] = useState(item?.allocatedTo || "none");
  const [completed, setCompleted] = useState(item?.completed || false);
  const [dateCompleted, setDateCompleted] = useState(item?.dateCompleted ? format(new Date(item.dateCompleted), "yyyy-MM-dd") : "");
  const [createNext, setCreateNext] = useState(item?.createNext || false);
  const [nextDueDate, setNextDueDate] = useState(item?.nextDueDate ? format(new Date(item.nextDueDate), "yyyy-MM-dd") : "");
  const [tolerance, setTolerance] = useState(item?.tolerance || "");
  
  // Subcategories
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>(subCategories);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      setLoadingSubCategories(true);
      try {
        const result = await getSubCategories(category);
        if (result.success && result.data) {
          setAvailableSubCategories(result.data);
        }
      } catch (error) {
        console.error("Error loading subcategories:", error);
      } finally {
        setLoadingSubCategories(false);
      }
    };
    
    // Only load subcategories if we don't have them yet
    if (availableSubCategories.length === 0) {
      loadSubCategories();
    }
  }, [category, availableSubCategories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!name || !category || (!subCategory && !newSubCategory) || !actionRequired || !frequency || !dueDate || !owner) {
        throw new Error("Please fill in all required fields");
      }

      // Determine which subcategory to use
      const finalSubCategory = newSubCategory || subCategory;

      const formData = {
        name,
        category,
        subCategory: finalSubCategory,
        supplier,
        serialNumber,
        reference,
        actionRequired,
        frequency,
        dueDate: new Date(dueDate),
        owner,
        allocatedTo: allocatedTo === "none" ? null : allocatedTo,
        tolerance: category === "Calibration" ? tolerance : null,
      };

      let result;
      if (item) {
        // Update existing item
        result = await updateMaintenanceItem(item.id, formData);
      } else {
        // Create new item
        result = await createMaintenanceItem(formData);
      }

      if (result.success) {
        toast.success(item ? "Maintenance item updated" : "Maintenance item created", {
          description: item
            ? "The maintenance item has been updated successfully."
            : "A new maintenance item has been created successfully.",
        });
        
        if (!item && isDialog && onClose) {
          onClose();
          // Show toast after closing dialog for new entry
          setTimeout(() => {
            toast.success("Maintenance item created", {
              description: "A new maintenance item has been created successfully.",
            });
          }, 100);
        } else if (isDialog && onClose) {
          onClose();
        } else {
          router.push("/maintenance");
          router.refresh();
        }
      } else {
        throw new Error(result.error || "Failed to save maintenance item");
      }
    } catch (error: any) {
      console.error("Error saving maintenance item:", error);
      toast.error("Error", {
        description: error.message || "An error occurred while saving the maintenance item.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!dateCompleted) {
      toast.error("Error", {
        description: "Please enter a completion date",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await completeMaintenanceItem(
        item.id, 
        new Date(dateCompleted), 
        createNext, 
        nextDueDate ? new Date(nextDueDate) : undefined
      );
      
      if (result.success) {
        toast.success("Maintenance item completed", {
          description: "The maintenance item has been marked as completed.",
        });
        
        if (isDialog && onClose) {
          onClose();
        } else {
          router.push("/maintenance");
          router.refresh();
        }
      } else {
        throw new Error(result.error || "Failed to complete maintenance item");
      }
    } catch (error: any) {
      console.error("Error completing maintenance item:", error);
      toast.error("Error", {
        description: error.message || "An error occurred while completing the maintenance item.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subCategory">Sub-Category</Label>
            <Select 
              value={subCategory} 
              onValueChange={setSubCategory}
              disabled={loadingSubCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Select sub-category or enter new one below --" />
              </SelectTrigger>
              <SelectContent>
                {loadingSubCategories ? (
                  <SelectItem value="loading">Loading...</SelectItem>
                ) : (
                  availableSubCategories.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="newSubCategory">New sub-category</Label>
            <Input 
              id="newSubCategory" 
              value={newSubCategory} 
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="Enter new sub-category if not in the list above"
            />
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Input 
              id="supplier" 
              value={supplier} 
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input 
              id="serialNumber" 
              value={serialNumber} 
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="reference">Reference</Label>
            <Input 
              id="reference" 
              value={reference} 
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          {category === "Calibration" && (
            <div>
              <Label htmlFor="tolerance">Tolerance</Label>
              <Input 
                id="tolerance" 
                value={tolerance} 
                onChange={(e) => setTolerance(e.target.value)}
                placeholder="Enter tolerance value"
              />
            </div>
          )}

          <div>
            <Label htmlFor="actionRequired">Action required</Label>
            <Textarea 
              id="actionRequired" 
              value={actionRequired} 
              onChange={(e) => setActionRequired(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select 
              value={frequency} 
              onValueChange={setFrequency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Due date</Label>
            <Input 
              id="dueDate" 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="owner">Owner</Label>
            <Input 
              id="owner" 
              value={owner} 
              onChange={(e) => setOwner(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="allocatedTo">Allocated to</Label>
            <Select 
              value={allocatedTo} 
              onValueChange={setAllocatedTo}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Please Select --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Please Select --</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {item && (
            <Card>
              <CardHeader className="bg-red-500 text-white">
                <CardTitle>Closure options</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dateCompleted">Date Completed</Label>
                    <Input 
                      id="dateCompleted" 
                      type="date" 
                      value={dateCompleted} 
                      onChange={(e) => setDateCompleted(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="createNext"
                      checked={createNext}
                      onCheckedChange={(checked) => setCreateNext(checked as boolean)}
                    />
                    <Label htmlFor="createNext">Create the next maintenance job</Label>
                  </div>

                  {createNext && (
                    <div>
                      <Label htmlFor="nextDueDate">Date next due? (Will be calculated using due date and frequency if left blank)</Label>
                      <Input 
                        id="nextDueDate" 
                        type="date" 
                        value={nextDueDate} 
                        onChange={(e) => setNextDueDate(e.target.value)}
                      />
                    </div>
                  )}

                  <Button 
                    type="button" 
                    onClick={handleComplete}
                    disabled={isSubmitting || item?.completed}
                    className="w-full"
                  >
                    {item?.completed ? "Already Completed" : "Mark as Completed"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!item && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-600">Closure options are available once the item has been created.</p>
            </div>
          )}

          {item && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium mb-2">Documents</h3>
              {item.documents && item.documents.length > 0 ? (
                <div>
                  <ul className="mt-2 space-y-2">
                    {item.documents.map((doc: any) => (
                      <li key={doc.id} className="flex items-center">
                        <span className="text-blue-600">{doc.title}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setDocumentDialogOpen(true)}
                  >
                    Upload Another Document
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">No documents uploaded yet.</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDocumentDialogOpen(true)}
                  >
                    Upload Document
                  </Button>
                </div>
              )}
            </div>
          )}

          {!item && (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-600">Documents can only be uploaded against existing items. Once you have saved this new item then you will be able to upload documents.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isDialog && onClose) {
              onClose();
            } else {
              router.push("/maintenance");
            }
          }} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : item ? "Save" : "Save"}
        </Button>
        {item && (
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
            Save and continue
          </Button>
        )}
      </div>

      {/* Document Upload Dialog */}
      {item && (
        <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <DocumentUpload 
              maintenanceId={item.id} 
              onUploadComplete={() => {
                setDocumentDialogOpen(false);
                // Refresh the page to show the new document
                window.location.reload();
              }}
              onCancel={() => setDocumentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}