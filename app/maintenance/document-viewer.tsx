"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Edit, Replace, Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import DocumentUpload from "./document-upload"
import DocumentPreview from "@/components/document-preview"

interface DocumentViewerProps {
  document: any;
  onBack: () => void;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewDetails: string;
  reviewDate: string;
  nextReviewDate?: string;
  createdBy: {
    name: string;
  };
}

export default function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState("document")
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(document.title)
  const [editNotes, setEditNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [addReviewDialogOpen, setAddReviewDialogOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    reviewDetails: "",
    reviewDate: new Date().toISOString().split('T')[0],
    nextReviewDate: "",
  })

  // Get the latest version and its URL
  const latestVersion = useMemo(() => {
    if (!document.versions?.length) return null;
    return document.versions.reduce((latest: any, current: any) => {
      if (!latest) return current;
      return parseInt(current.version) > parseInt(latest.version) ? current : latest;
    }, null);
  }, [document.versions]);

  // Use the latest version's URL if available, otherwise fall back to the document's URL
  const currentFileUrl = useMemo(() => {
    return latestVersion?.fileUrl || document.fileUrl;
  }, [latestVersion, document.fileUrl]);

  // Load reviews when component mounts
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/maintenance/documents/${document.id}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const handleDownload = async () => {
    try {
      window.open(currentFileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Format date consistently
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const handleEditDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/maintenance/documents/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          notes: editNotes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update document");
      }

      toast({
        title: "Document updated",
        description: "The document has been updated successfully.",
      });

      setEditDialogOpen(false);
      // Refresh the page to show updated document
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the document.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/maintenance/documents/${document.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewerName: reviewForm.reviewerName,
          reviewDetails: reviewForm.reviewDetails,
          reviewDate: reviewForm.reviewDate,
          nextReviewDate: reviewForm.nextReviewDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add review");
      }

      toast({
        title: "Review added",
        description: "The review has been added successfully.",
      });

      setAddReviewDialogOpen(false);
      setReviewForm({
        reviewerName: "",
        reviewDetails: "",
        reviewDate: new Date().toISOString().split('T')[0],
        nextReviewDate: "",
      });
      loadReviews(); // Reload reviews
    } catch (error: any) {
      console.error("Error adding review:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/maintenance/documents/${document.id}/reviews?reviewId=${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast({
        title: "Review deleted",
        description: "The review has been deleted successfully.",
      });

      loadReviews(); // Reload reviews
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the review.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title and Details Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{document.title}</h2>
          <p className="text-gray-500">Last modified: {formatDate(document.uploadedAt)}</p>
          {latestVersion && (
            <p className="text-sm text-blue-600">Version {latestVersion.version}</p>
          )}
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to planned maintenance
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Left Side - Document Preview */}
        <div className="flex-grow">
          <Tabs defaultValue="document" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="version-history">Version history</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>
            <TabsContent value="document" className="flex-grow">
              <Card className="h-full">
                <DocumentPreview
                  documentUrl={currentFileUrl}
                  documentType={document.fileType}
                  title={document.title}
                />
              </Card>
            </TabsContent>
            <TabsContent value="version-history">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Version History</h3>
                {document.versions?.map((version: any) => (
                  <div key={version.id} className="border-b py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Version {version.version}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(version.createdAt)} by {version.createdBy.name}
                        </p>
                        {version.notes && (
                          <p className="text-sm mt-1">{version.notes}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.open(version.fileUrl, '_blank')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Reviews</h3>
                  <Button 
                    size="sm" 
                    onClick={() => setAddReviewDialogOpen(true)}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Review
                  </Button>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{review.reviewerName || review.createdBy.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(review.reviewDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {review.nextReviewDate && (
                              <div className="text-sm text-gray-500">
                                Next review: {formatDate(review.nextReviewDate)}
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.reviewDetails}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No reviews available for this document.</div>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="download">
              <Card className="p-4 text-center">
                <Button className="flex items-center" asChild>
                  <a href={currentFileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Download Document
                  </a>
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {/* Right Side - Actions */}
        <div className="w-64 space-y-4">
          <Button variant="outline" className="w-full" onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit this document
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Card className="p-4">
            <h3 className="font-medium mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Type:</span> {document.fileType}</p>
              <p><span className="text-gray-500">Size:</span> {Math.round(document.size / 1024)} KB</p>
              <p><span className="text-gray-500">Uploaded by:</span> {document.uploadedBy?.name}</p>
              <p><span className="text-gray-500">Upload date:</span> {formatDate(document.uploadedAt)}</p>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDocument} className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Document Title</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                id="editNotes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add notes about this document..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={addReviewDialogOpen} onOpenChange={setAddReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <Label htmlFor="reviewerName">Reviewer Name</Label>
              <Input
                id="reviewerName"
                value={reviewForm.reviewerName}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={reviewForm.reviewDate}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
              <Input
                id="nextReviewDate"
                type="date"
                value={reviewForm.nextReviewDate}
                onChange={(e) => setReviewForm({ ...reviewForm, nextReviewDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reviewDetails">Review Details</Label>
              <Textarea
                id="reviewDetails"
                value={reviewForm.reviewDetails}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewDetails: e.target.value })}
                placeholder="Enter review details..."
                required
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddReviewDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Review"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Replace Document Dialog */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload
            maintenanceId={document.maintenanceId}
            existingDocument={document}
            onUploadComplete={() => {
              setReplaceDialogOpen(false);
              window.location.reload();
            }}
            onCancel={() => setReplaceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}