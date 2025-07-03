"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Calendar, User } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  getImprovementRegisterSectionVersions,
  createImprovementRegisterSectionVersion,
  deleteImprovementRegisterSectionVersion,
  getImprovementRegisterSectionReviews,
  createImprovementRegisterSectionReview,
  deleteImprovementRegisterSectionReview,
} from "@/app/actions/improvement-register-actions"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VersionHistoryDialog({ open, onOpenChange }: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("versions")
  
  // Version form state
  const [versionForm, setVersionForm] = useState({
    version: "",
    amendmentDetails: "",
  })
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    reviewDetails: "",
    reviewDate: format(new Date(), "yyyy-MM-dd"),
    nextReviewDate: "",
  })
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  
  // Delete confirmation state
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: "version" | "review"; name: string } | null>(null)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setLoading(true)
    try {
      const [versionsResult, reviewsResult] = await Promise.all([
        getImprovementRegisterSectionVersions(),
        getImprovementRegisterSectionReviews(),
      ])
      
      if (versionsResult.success) {
        setVersions(versionsResult.data)
      }
      
      if (reviewsResult.success) {
        setReviews(reviewsResult.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load version history data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateVersion = async () => {
    if (!versionForm.version.trim()) {
      toast({
        title: "Error",
        description: "Version number is required",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createImprovementRegisterSectionVersion(versionForm)
      if (result.success) {
        toast({
          title: "Success",
          description: "Version created successfully",
        })
        setVersionForm({ version: "", amendmentDetails: "" })
        setIsVersionDialogOpen(false)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create version",
        variant: "destructive",
      })
    }
  }

  const handleCreateReview = async () => {
    if (!reviewForm.reviewerName.trim() || !reviewForm.reviewDate) {
      toast({
        title: "Error",
        description: "Reviewer name and review date are required",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await createImprovementRegisterSectionReview({
        ...reviewForm,
        reviewDate: new Date(reviewForm.reviewDate),
        nextReviewDate: reviewForm.nextReviewDate ? new Date(reviewForm.nextReviewDate) : null,
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Review created successfully",
        })
        setReviewForm({
          reviewerName: "",
          reviewDetails: "",
          reviewDate: format(new Date(), "yyyy-MM-dd"),
          nextReviewDate: "",
        })
        setIsReviewDialogOpen(false)
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create review",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      let result
      if (deleteItem.type === "version") {
        result = await deleteImprovementRegisterSectionVersion(deleteItem.id)
      } else {
        result = await deleteImprovementRegisterSectionReview(deleteItem.id)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `${deleteItem.type === "version" ? "Version" : "Review"} deleted successfully`,
        })
        loadData()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to delete ${deleteItem.type}`,
        variant: "destructive",
      })
    } finally {
      setDeleteItem(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Improvement Register - Version History</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="versions">Version History</TabsTrigger>
              <TabsTrigger value="reviews">Page Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="versions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Version History</h3>
                <Button onClick={() => setIsVersionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Version
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : versions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No versions found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <Card key={version.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Version {version.version}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(version.createdAt), "dd/MM/yyyy HH:mm")}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {version.createdBy.name}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem({ 
                              id: version.id, 
                              type: "version", 
                              name: `Version ${version.version}` 
                            })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      {version.amendmentDetails && (
                        <CardContent>
                          <p className="text-sm">{version.amendmentDetails}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Page Reviews</h3>
                <Button onClick={() => setIsReviewDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No reviews found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              Review by {review.reviewerName}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(review.reviewDate), "dd/MM/yyyy")}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {review.createdBy.name}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItem({ 
                              id: review.id, 
                              type: "review", 
                              name: `Review by ${review.reviewerName}` 
                            })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardHeader>
                      {review.reviewDetails && (
                        <CardContent>
                          <p className="text-sm mb-2">{review.reviewDetails}</p>
                          {review.nextReviewDate && (
                            <p className="text-sm text-muted-foreground">
                              Next review: {format(new Date(review.nextReviewDate), "dd/MM/yyyy")}
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Version Creation Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version Number</Label>
              <Input
                id="version"
                value={versionForm.version}
                onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                placeholder="e.g. 1.0, 2.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amendmentDetails">Amendment Details</Label>
              <Textarea
                id="amendmentDetails"
                value={versionForm.amendmentDetails}
                onChange={(e) => setVersionForm({ ...versionForm, amendmentDetails: e.target.value })}
                placeholder="Describe the changes made in this version"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateVersion}>Create Version</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Creation Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewerName">Reviewer Name</Label>
              <Input
                id="reviewerName"
                value={reviewForm.reviewerName}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                placeholder="Enter reviewer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={reviewForm.reviewDate}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextReviewDate">Next Review Date (Optional)</Label>
              <Input
                id="nextReviewDate"
                type="date"
                value={reviewForm.nextReviewDate}
                onChange={(e) => setReviewForm({ ...reviewForm, nextReviewDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewDetails">Review Details</Label>
              <Textarea
                id="reviewDetails"
                value={reviewForm.reviewDetails}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewDetails: e.target.value })}
                placeholder="Enter review details"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateReview}>Create Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteItem?.type} "{deleteItem?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 