"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { 
  updateControl, 
  addVersion, 
  deleteVersion, 
  addReview, 
  deleteReview 
} from "../actions/statement-of-applicability-actions"
import { Briefcase, Calendar, Users, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { Loader } from '@/components/ui/loader'

interface Control {
  id: string
  clause: string
  title: string
  description: string
  applicable: boolean
  implemented: boolean
  dateLastAssessed: string | null
  relatedControls: string
  justification: string
  section: string
}

interface StatementOfApplicabilityClientProps {
  controls: Control[]
  versions: any[]
  reviews: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function StatementOfApplicabilityClient({
  controls,
  versions,
  reviews,
  canEdit,
  canDelete
}: StatementOfApplicabilityClientProps) {
  const [activeTab, setActiveTab] = useState<'controls' | 'restrictions' | 'versions' | 'reviews'>('controls')
  const [newVersion, setNewVersion] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    details: "",
    updatedBy: ""
  })
  const [newReview, setNewReview] = useState({
    reviewedBy: "",
    details: "",
    reviewDate: format(new Date(), "yyyy-MM-dd"),
    nextReviewDate: ""
  })
  const [expandedSection, setExpandedSection] = useState<string | null>("A.5 Organisational Controls")
  
  // Store form data in a ref to avoid re-renders on every change
  const controlChanges = useRef<Record<string, Record<string, any>>>({})

  // Group controls by section
  const controlsBySection = controls.reduce((acc, control) => {
    if (!acc[control.section]) {
      acc[control.section] = []
    }
    acc[control.section].push(control)
    return acc
  }, {} as Record<string, Control[]>)

  const handleFieldChange = (controlId: string, field: string, value: any) => {
    if (!controlChanges.current[controlId]) {
      controlChanges.current[controlId] = {}
    }
    controlChanges.current[controlId][field] = value
  }

  // Add local loading states for control, version, and review actions
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdateControl = async (id: string) => {
    if (!canEdit || !controlChanges.current[id]) return
    setLoadingAction((prev) => ({ ...prev, [id]: 'update' }))
    setIsSubmitting(true)
    try {
      const result = await updateControl(id, controlChanges.current[id])
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      setIsSubmitting(false)
      if (result.success) {
        toast({
          title: "Success",
          description: "Control updated successfully",
        })
        // Clear the changes for this control after successful update
        controlChanges.current[id] = {}
      } else {
        throw new Error(result.error || "Failed to update control")
      }
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      setIsSubmitting(false)
      console.error("Error updating control:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the control",
        variant: "destructive",
      })
    }
  }

  const handleAddVersion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    setIsSubmitting(true)
    try {
      const result = await addVersion({
        date: new Date(newVersion.date),
        details: newVersion.details,
        updatedBy: newVersion.updatedBy
      })
      setIsSubmitting(false)
      if (result.success) {
        toast({
          title: "Success",
          description: "Version added successfully",
        })
        setNewVersion({
          date: format(new Date(), "yyyy-MM-dd"),
          details: "",
          updatedBy: ""
        })
      } else {
        throw new Error(result.error || "Failed to add version")
      }
    } catch (error: any) {
      setIsSubmitting(false)
      console.error("Error adding version:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the version",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVersion = async (id: string) => {
    if (!canDelete) return

    if (confirm("Are you sure you want to delete this version?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      try {
        const result = await deleteVersion(id)
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        if (result.success) {
          toast({
            title: "Success",
            description: "Version deleted successfully",
          })
        } else {
          throw new Error(result.error || "Failed to delete version")
        }
      } catch (error: any) {
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        console.error("Error deleting version:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred while deleting the version",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEdit) return
    setIsSubmitting(true)
    try {
      const result = await addReview({
        reviewedBy: newReview.reviewedBy,
        details: newReview.details,
        reviewDate: new Date(newReview.reviewDate),
        nextReviewDate: newReview.nextReviewDate ? new Date(newReview.nextReviewDate) : null
      })
      setIsSubmitting(false)
      if (result.success) {
        toast({
          title: "Success",
          description: "Review added successfully",
        })
        setNewReview({
          reviewedBy: "",
          details: "",
          reviewDate: format(new Date(), "yyyy-MM-dd"),
          nextReviewDate: ""
        })
      } else {
        throw new Error(result.error || "Failed to add review")
      }
    } catch (error: any) {
      setIsSubmitting(false)
      console.error("Error adding review:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding the review",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!canDelete) return

    if (confirm("Are you sure you want to delete this review?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      try {
        const result = await deleteReview(id)
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        if (result.success) {
          toast({
            title: "Success",
            description: "Review deleted successfully",
          })
        } else {
          throw new Error(result.error || "Failed to delete review")
        }
      } catch (error: any) {
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        console.error("Error deleting review:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred while deleting the review",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-4 relative">
      {isSubmitting && <Loader overlay message="Processing..." />}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Briefcase className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Statement of applicability (2022)</h1>
        </div>
        <Button variant="outline">View 2013</Button>
      </div>

      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'restrictions' ? "default" : "outline"} 
          onClick={() => setActiveTab('restrictions')}
        >
          Current role restrictions
        </Button>
        <Button 
          variant={activeTab === 'versions' ? "default" : "outline"} 
          onClick={() => setActiveTab('versions')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Version history
        </Button>
        <Button 
          variant={activeTab === 'reviews' ? "default" : "outline"} 
          onClick={() => setActiveTab('reviews')}
        >
          <Users className="h-4 w-4 mr-2" />
          Page reviews
        </Button>
      </div>

      {activeTab === 'restrictions' && (
        <div className="border rounded-md p-4 bg-gray-100">
          <p>There are currently no permissions available for this system; please contact your system administrator to set them up.</p>
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('controls')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Statement of Applicability
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'versions' && (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brief details of amendment(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated by</th>
                {canDelete && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typeof versions === 'undefined' ? (
                <tr><td colSpan={canDelete ? 5 : 4}><div className="py-8 flex justify-center"><Loader size="lg" message="Loading versions..." /></div></td></tr>
              ) : versions.map((version) => (
                <tr key={version.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{version.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(version.date), "dd/MM/yyyy")}</td>
                  <td className="px-6 py-4">{version.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{version.updatedBy}</td>
                  {canDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteVersion(version.id)}
                        disabled={!!loadingAction[version.id]}
                      >
                        {loadingAction[version.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {canEdit && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input 
                      type="date" 
                      value={newVersion.date} 
                      onChange={(e) => setNewVersion({...newVersion, date: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Textarea 
                      value={newVersion.details} 
                      onChange={(e) => setNewVersion({...newVersion, details: e.target.value})}
                      placeholder="Details"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input 
                      value={newVersion.updatedBy} 
                      onChange={(e) => setNewVersion({...newVersion, updatedBy: e.target.value})}
                      placeholder="Updated by"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      onClick={handleAddVersion}
                      disabled={!newVersion.details || !newVersion.updatedBy || isSubmitting}
                    >
                      {isSubmitting ? <Loader size="sm" ariaLabel="Adding..." /> : 'Add'}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('controls')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Statement of Applicability
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details of review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next review date</th>
                {canDelete && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typeof reviews === 'undefined' ? (
                <tr><td colSpan={canDelete ? 5 : 4}><div className="py-8 flex justify-center"><Loader size="lg" message="Loading reviews..." /></div></td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{review.reviewedBy}</td>
                  <td className="px-6 py-4">{review.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(review.reviewDate), "dd/MM/yyyy")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.nextReviewDate ? format(new Date(review.nextReviewDate), "dd/MM/yyyy") : ""}
                  </td>
                  {canDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={!!loadingAction[review.id]}
                      >
                        {loadingAction[review.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
              {canEdit && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input 
                      value={newReview.reviewedBy} 
                      onChange={(e) => setNewReview({...newReview, reviewedBy: e.target.value})}
                      placeholder="Reviewer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Textarea 
                      value={newReview.details} 
                      onChange={(e) => setNewReview({...newReview, details: e.target.value})}
                      placeholder="Details of review"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input 
                      type="date" 
                      value={newReview.reviewDate} 
                      onChange={(e) => setNewReview({...newReview, reviewDate: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Input 
                      type="date" 
                      value={newReview.nextReviewDate} 
                      onChange={(e) => setNewReview({...newReview, nextReviewDate: e.target.value})}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      onClick={handleAddReview}
                      disabled={!newReview.reviewedBy || !newReview.details || isSubmitting}
                    >
                      {isSubmitting ? <Loader size="sm" ariaLabel="Adding..." /> : 'Add'}
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('controls')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Statement of Applicability
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'controls' && (
        <div>
          {typeof controls === 'undefined' ? (
            <div className="py-8 flex justify-center"><Loader size="lg" message="Loading controls..." /></div>
          ) : Object.entries(controlsBySection).map(([section, sectionControls]) => (
            <div key={section} className="mb-4">
              <div 
                className="bg-[#2d1e3e] text-white p-3 flex justify-between items-center rounded-sm cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === section ? null : section)}
              >
                <span>{section}</span>
              </div>
              
              {expandedSection === section && (
                <div className="border border-gray-200">
                  <div className="grid grid-cols-7 bg-gray-100 p-2 border-b">
                    <div className="col-span-1">Clause</div>
                    <div className="col-span-1">Title Control</div>
                    <div className="col-span-1">Applicable</div>
                    <div className="col-span-2">Justification and Related Control(s)</div>
                    <div className="col-span-1">Implemented</div>
                    <div className="col-span-1">Date last assessed</div>
                  </div>

                  {sectionControls.map((control) => (
                    <div key={control.id} className="grid grid-cols-7 p-2 border-b items-start">
                      <div className="col-span-1">{control.clause}</div>
                      <div className="col-span-1">
                        <p className="font-medium">{control.title}</p>
                        <p className="text-sm mt-1">{control.description}</p>
                      </div>
                      <div className="col-span-1">
                        {canEdit ? (
                          <Select 
                            defaultValue={control.applicable ? "Yes" : "No"} 
                            onValueChange={(value) => handleFieldChange(control.id, "applicable", value === "Yes")}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{control.applicable ? "Yes" : "No"}</span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div>
                          <p className="text-sm text-gray-500">Related controls</p>
                          {canEdit ? (
                            <Textarea 
                              defaultValue={control.relatedControls || ""} 
                              onChange={(e) => handleFieldChange(control.id, "relatedControls", e.target.value)}
                              className="min-h-[100px]"
                            />
                          ) : (
                            <p className="p-2 border rounded-md min-h-[100px]">{control.relatedControls || ""}</p>
                          )}
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Justification</p>
                          {canEdit ? (
                            <Textarea 
                              defaultValue={control.justification || ""} 
                              onChange={(e) => handleFieldChange(control.id, "justification", e.target.value)}
                              className="min-h-[100px]"
                            />
                          ) : (
                            <p className="p-2 border rounded-md min-h-[100px]">{control.justification || ""}</p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1">
                        {canEdit ? (
                          <Select 
                            defaultValue={control.implemented ? "Yes" : "No"} 
                            onValueChange={(value) => handleFieldChange(control.id, "implemented", value === "Yes")}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{control.implemented ? "Yes" : "No"}</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        {canEdit ? (
                          <div className="flex items-center">
                            <Input 
                              type="date" 
                              defaultValue={control.dateLastAssessed ? format(new Date(control.dateLastAssessed), "yyyy-MM-dd") : ""} 
                              onChange={(e) => handleFieldChange(control.id, "dateLastAssessed", e.target.value ? new Date(e.target.value) : null)}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <span>
                            {control.dateLastAssessed ? format(new Date(control.dateLastAssessed), "dd/MM/yyyy") : ""}
                          </span>
                        )}
                        {canEdit && (
                          <Button 
                            className="mt-2 w-full"
                            onClick={() => handleUpdateControl(control.id)}
                            disabled={!!loadingAction[control.id] || isSubmitting}
                          >
                            {loadingAction[control.id] === 'update' || isSubmitting ? <Loader size="sm" ariaLabel="Updating..." /> : 'Update'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back to Registers button */}
      <div className="flex justify-center mt-8">
        <Link href="/registers">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registers
          </Button>
        </Link>
      </div>
    </div>
  )
}