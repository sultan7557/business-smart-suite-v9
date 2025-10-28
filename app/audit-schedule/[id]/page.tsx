"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuditViewPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AuditViewPage({ params }: AuditViewPageProps) {
  const router = useRouter()
  const [audit, setAudit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [auditId, setAuditId] = useState<string | null>(null)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    reviewDetails: "",
    reviewDate: new Date().toISOString().split("T")[0],
    nextReviewDate: ""
  })
  const [addingReview, setAddingReview] = useState(false)

  useEffect(() => {
    const initializeParams = async () => {
      try {
        const resolvedParams = await params
        setAuditId(resolvedParams.id)
      } catch (error) {
        console.error("Error resolving params:", error)
        router.push("/audit-schedule")
      }
    }

    initializeParams()
  }, [params, router])

  useEffect(() => {
    if (!auditId) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/audit-schedule/${auditId}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/audit-schedule")
            return
          }
          throw new Error("Failed to fetch audit")
        }

        const data = await response.json()
        setAudit(data.audit)
      } catch (error) {
        console.error("Error fetching audit data:", error)
        router.push("/audit-schedule")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [auditId, router])

  const handleAddReview = async () => {
    if (!newReview.reviewerName || !newReview.reviewDetails) {
      alert("Please fill in reviewer name and review details")
      return
    }

    setAddingReview(true)
    try {
      const response = await fetch(`/api/audit-schedule/${auditId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      })

      if (response.ok) {
        const { data } = await response.json()
        // Add the new review to the existing reviews
        setAudit((prev: any) => ({
          ...prev,
          reviews: [data, ...prev.reviews]
        }))
        
        // Reset form
        setNewReview({
          reviewerName: "",
          reviewDetails: "",
          reviewDate: new Date().toISOString().split("T")[0],
          nextReviewDate: ""
        })
        setShowAddReview(false)
        alert("Review added successfully!")
      } else {
        throw new Error("Failed to add review")
      }
    } catch (error) {
      console.error("Error adding review:", error)
      alert("Failed to add review. Please try again.")
    } finally {
      setAddingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    const review = audit.reviews.find((r: any) => r.id === reviewId)
    const reviewerName = review?.reviewerName || 'this review'

    if (!confirm(`Are you sure you want to delete the review by "${reviewerName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/audit-schedule/${auditId}/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Remove the review from the list
        setAudit((prev: any) => ({
          ...prev,
          reviews: prev.reviews.filter((r: any) => r.id !== reviewId)
        }))
        alert("Review deleted successfully!")
      } else {
        throw new Error("Failed to delete review")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      alert("Failed to delete review. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading audit details...</div>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Audit not found</h1>
          <button 
            onClick={() => router.push("/audit-schedule")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Audit Schedule
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="bg-blue-100 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => router.push("/audit-schedule")}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to audit schedule
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Audit #{audit.number}</h1>
            <h2 className="text-xl text-gray-700">{audit.title}</h2>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded ${
            audit.status === 'completed' ? 'bg-green-100 text-green-800' :
            audit.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {audit.status === 'not_started' ? 'Not Started' :
             audit.status === 'in_progress' ? 'In Progress' :
             audit.status === 'completed' ? 'Completed' : audit.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Audit Details</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Planned Start:</strong> {new Date(audit.plannedStartDate).toLocaleDateString()}</div>
              <div><strong>Actual Start:</strong> {audit.actualStartDate ? new Date(audit.actualStartDate).toLocaleDateString() : "-"}</div>
              <div><strong>Follow Up:</strong> {audit.followUpDate ? new Date(audit.followUpDate).toLocaleDateString() : "-"}</div>
              <div><strong>Completed:</strong> {audit.dateCompleted ? new Date(audit.dateCompleted).toLocaleDateString() : "-"}</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Auditor Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Auditor:</strong> {audit.auditor?.name || audit.externalAuditor || "-"}</div>
              <div><strong>Email:</strong> {audit.auditor?.email || "-"}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3">Documents to Audit ({audit.auditDocuments.length})</h3>
          {audit.auditDocuments.length === 0 ? (
            <p className="text-gray-500">No documents selected for this audit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {audit.auditDocuments.map((doc: any) => (
                <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {doc.docType.charAt(0).toUpperCase() + doc.docType.slice(1)}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm">{doc.docName}</h4>
                  <p className="text-xs text-gray-500 mt-1">ID: {doc.docId}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Audit Reviews ({audit.reviews.length})</h3>
            <button 
              onClick={() => setShowAddReview(!showAddReview)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAddReview ? 'Cancel' : '+ Add Review'}
            </button>
          </div>

          {/* Add Review Form */}
          {showAddReview && (
            <div className="border rounded-lg p-4 mb-4 bg-gray-50">
              <h4 className="font-medium mb-3">Add New Review</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Reviewer Name *</label>
                  <input
                    type="text"
                    value={newReview.reviewerName}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewerName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reviewer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Review Details *</label>
                  <textarea
                    value={newReview.reviewDetails}
                    onChange={(e) => setNewReview(prev => ({ ...prev, reviewDetails: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter review details"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Review Date</label>
                    <input
                      type="date"
                      value={newReview.reviewDate}
                      onChange={(e) => setNewReview(prev => ({ ...prev, reviewDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Next Review Date</label>
                    <input
                      type="date"
                      value={newReview.nextReviewDate}
                      onChange={(e) => setNewReview(prev => ({ ...prev, nextReviewDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAddReview}
                    disabled={addingReview}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {addingReview ? 'Adding...' : 'Add Review'}
                  </button>
                  <button 
                    onClick={() => setShowAddReview(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {audit.reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Add a review to track audit progress.</p>
          ) : (
            <div className="space-y-3">
              {audit.reviews.map((review: any) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{review.reviewerName || 'Unknown Reviewer'}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(review.reviewDate).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.reviewDetails || 'No details provided'}</p>
                  {review.nextReviewDate && (
                    <div className="text-sm text-gray-500">
                      Next Review: {new Date(review.nextReviewDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Created by {review.createdBy.name} on {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Created:</span> {new Date(audit.createdAt).toLocaleDateString()} by {audit.createdBy.name}
            </div>
            {audit.updatedBy && (
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(audit.updatedAt).toLocaleDateString()} by {audit.updatedBy.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}