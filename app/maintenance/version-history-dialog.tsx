"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { getMaintenanceSectionVersions, createMaintenanceSectionVersion, deleteMaintenanceSectionVersion } from "@/app/actions/maintenance-actions";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VersionHistoryDialog({ 
  open, 
  onOpenChange 
}: VersionHistoryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadVersions();
    }
  }, [open]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const result = await getMaintenanceSectionVersions();
      if (result.success) {
        setVersions(result.data);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load versions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading versions:", error);
      toast({
        title: "Error",
        description: "Failed to load versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateVersion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const amendmentDetails = formData.get("amendmentDetails") as string;
      
      const result = await createMaintenanceSectionVersion({
        version: (versions.length + 1).toString(),
        amendmentDetails,
      });
      
      if (result.success) {
        toast({
          title: "Version created",
          description: "A new version has been created successfully.",
        });
        setShowCreateForm(false);
        loadVersions(); // Reload versions
      } else {
        throw new Error(result.error || "Failed to create version");
      }
    } catch (error: any) {
      console.error("Error creating version:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the version.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm("Are you sure you want to delete this version? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteMaintenanceSectionVersion(versionId);
      if (result.success) {
        toast({
          title: "Version deleted",
          description: "The version has been deleted successfully.",
        });
        loadVersions(); // Reload versions
      } else {
        throw new Error(result.error || "Failed to delete version");
      }
    } catch (error: any) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the version.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History - Maintenance</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create Version Button */}
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="outline"
            className="w-full"
          >
            {showCreateForm ? "Cancel Create Version" : "Create New Version"}
          </Button>

          {/* Create Version Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateVersion} className="space-y-4 p-4 border rounded-md">
              <div>
                <Label htmlFor="amendmentDetails">Brief details of amendment(s)</Label>
                <Textarea 
                  id="amendmentDetails" 
                  name="amendmentDetails" 
                  required 
                  rows={3}
                  placeholder="Describe the changes made in this version..."
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Version"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Versions Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">No</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Brief details of amendment(s)</th>
                  <th className="border p-2 text-left">Updated by</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="border p-4 text-center text-gray-500">
                      Loading versions...
                    </td>
                  </tr>
                ) : versions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border p-4 text-center text-gray-500">
                      No versions found. Create the first version to get started.
                    </td>
                  </tr>
                ) : (
                  versions.map((version, index) => (
                    <tr key={version.id} className="border-b hover:bg-gray-50">
                      <td className="border p-2 font-medium">
                        {versions.length - index}
                      </td>
                      <td className="border p-2">
                        {format(new Date(version.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="border p-2">
                        <div className="text-sm whitespace-pre-wrap">
                          {version.amendmentDetails || "No details provided"}
                        </div>
                      </td>
                      <td className="border p-2">
                        {version.createdBy?.name || "System"}
                      </td>
                      <td className="border p-2">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteVersion(version.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 