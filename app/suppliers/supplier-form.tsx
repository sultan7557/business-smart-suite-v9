"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { createSupplier, updateSupplier } from "../actions/supplier-actions"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import DocumentUpload from "./document-upload"
import { Loader } from '@/components/ui/loader'
import { assignDocumentToUser, getUsersForAssignment } from "../actions/supplier-document-actions"

interface SupplierFormProps {
  supplier?: {
    id: string
    name: string
    provisionOf: string
    certifications: string | null
    contactName: string | null
    address: string | null
    contactNumber: string | null
    website: string | null
    dateAdded: Date
    reviewFrequency: string | null
    lastReviewDate: Date | null
    lastReviewedBy: string | null
    riskLikelihood: number
    riskSeverity: number
    controlsRecommendations: string | null
    residualLikelihood: number
    residualSeverity: number
  }
  documents?: Array<{
    id: string
    title: string
    uploadedAt: string
    expiryDate: string | null
    assignedUserId?: string | null
    assignedUser?: {
      id: string
      name: string
      email: string
    } | null
  }>
  isEdit?: boolean
}

interface FormData {
  name: string
  provisionOf: string
  certifications: string
  contactName: string
  address: string
  contactNumber: string
  website: string
  dateAdded: string
  reviewFrequency: string
  lastReviewDate: string
  lastReviewedBy: string
  riskLikelihood: string
  riskSeverity: string
  controlsRecommendations: string
  residualLikelihood: string
  residualSeverity: string
}

export default function SupplierForm({ supplier, documents = [], isEdit = false }: SupplierFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    provisionOf: "",
    certifications: "",
    contactName: "",
    address: "",
    contactNumber: "",
    website: "",
    dateAdded: format(new Date(), "yyyy-MM-dd"),
    reviewFrequency: "",
    lastReviewDate: "",
    lastReviewedBy: "",
    riskLikelihood: "1",
    riskSeverity: "1",
    controlsRecommendations: "",
    residualLikelihood: "1",
    residualSeverity: "1",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [docList, setDocList] = useState(documents)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  useEffect(() => {
    // Fetch users for document assignment
    const fetchUsers = async () => {
      console.log('SupplierForm: fetchUsers started')
      setLoadingUsers(true)
      try {
        console.log('SupplierForm: Calling getUsersForAssignment...')
        const result = await getUsersForAssignment()
        console.log('SupplierForm: getUsersForAssignment result:', result)
        
        if (result && result.success && 'data' in result) {
          console.log('SupplierForm: Setting users:', result.data)
          setUsers(result.data || [])
        } else {
          console.error('SupplierForm: Failed to fetch users:', result && 'error' in result ? result.error : 'No result')
        }
      } catch (error) {
        console.error('SupplierForm: Error fetching users:', error)
      } finally {
        setLoadingUsers(false)
      }
    }
    
    if (isEdit) {
      console.log('SupplierForm: isEdit is true, calling fetchUsers')
      fetchUsers()
    }
  }, [isEdit])

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        provisionOf: supplier.provisionOf || "",
        certifications: supplier.certifications || "",
        contactName: supplier.contactName || "",
        address: supplier.address || "",
        contactNumber: supplier.contactNumber || "",
        website: supplier.website || "",
        dateAdded: supplier.dateAdded ? format(new Date(supplier.dateAdded), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        reviewFrequency: supplier.reviewFrequency || "",
        lastReviewDate: supplier.lastReviewDate ? format(new Date(supplier.lastReviewDate), "yyyy-MM-dd") : "",
        lastReviewedBy: supplier.lastReviewedBy || "",
        riskLikelihood: supplier.riskLikelihood?.toString() || "1",
        riskSeverity: supplier.riskSeverity?.toString() || "1",
        controlsRecommendations: supplier.controlsRecommendations || "",
        residualLikelihood: supplier.residualLikelihood?.toString() || "1",
        residualSeverity: supplier.residualSeverity?.toString() || "1",
      })
      // Fetch documents dynamically on mount
      fetchDocuments()
    }
  }, [supplier])

  const fetchDocuments = async () => {
    if (!supplier?.id) return
    console.log('fetchDocuments: Starting fetch for supplier:', supplier.id)
    setLoadingDocs(true)
    try {
      // Add cache-busting to ensure fresh data
      const res = await fetch(`/api/suppliers/documents?supplierId=${supplier.id}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (res.ok) {
        const data = await res.json()
        console.log('fetchDocuments: Fetched documents:', data)
        console.log('fetchDocuments: Current docList before update:', docList)
        setDocList(data || [])
        console.log('fetchDocuments: Updated docList to:', data || [])
      } else {
        console.error('fetchDocuments: Response not ok:', res.status, res.statusText)
      }
    } catch (e) {
      console.error('Error fetching documents:', e)
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleDocumentAssignment = async (documentId: string, userId: string | null) => {
    try {
      console.log('handleDocumentAssignment: Starting assignment for document:', documentId, 'to user:', userId)
      
      // Optimistically update the UI first
      const assignedUser = userId ? users.find(u => u.id === userId) : null
      console.log('handleDocumentAssignment: Assigned user found:', assignedUser)
      
      setDocList(prev => {
        const updated = prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, assignedUserId: userId, assignedUser: assignedUser }
            : doc
        )
        console.log('handleDocumentAssignment: Updated docList:', updated)
        return updated
      })

      const result = await assignDocumentToUser(documentId, userId)
      console.log('handleDocumentAssignment: Server response:', result)
      
      if (result.success) {
        toast({
          title: "Document assigned successfully",
          description: userId ? "Document has been assigned to the selected user" : "Document assignment has been removed",
        })
      } else {
        // Revert the optimistic update on failure
        console.log('handleDocumentAssignment: Assignment failed, reverting optimistic update')
        setDocList(prev => prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, assignedUserId: doc.assignedUserId, assignedUser: doc.assignedUser }
            : doc
        ))
        throw new Error(result.error || "Failed to assign document")
      }
    } catch (error) {
      console.error("Error assigning document:", error)
      toast({
        title: "Error",
        description: "Failed to assign document. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const result = isEdit 
        ? await updateSupplier(supplier!.id, formData)
        : await createSupplier(formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Supplier ${isEdit ? "updated" : "created"} successfully`,
        })
        router.push("/suppliers")
      } else {
        throw new Error(result.error || `Failed to ${isEdit ? "update" : "create"} supplier`)
      }
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} supplier:`, error)
      toast({
        title: "Error",
        description: error.message || `An error occurred while ${isEdit ? "updating" : "creating"} the supplier`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Supplier" : "New Supplier"}
        </h1>
        <Link href="/suppliers">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to suppliers
          </Button>
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {isSubmitting && <Loader overlay message={isEdit ? 'Saving changes...' : 'Saving...'} />}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Provision of</label>
            <Textarea
              value={formData.provisionOf}
              onChange={(e) => handleChange("provisionOf", e.target.value)}
              required
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Certifications</label>
            <Textarea
              value={formData.certifications}
              onChange={(e) => handleChange("certifications", e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contact name</label>
            <Input
              value={formData.contactName}
              onChange={(e) => handleChange("contactName", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Contact number</label>
            <Input
              value={formData.contactNumber}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date added</label>
            <Input
              type="date"
              value={formData.dateAdded}
              onChange={(e) => handleChange("dateAdded", e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Supplier reviews</label>
            <div className="border p-4 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Review frequency</label>
                <Select
                  value={formData.reviewFrequency}
                  onValueChange={(value) => handleChange("reviewFrequency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 year">1 year</SelectItem>
                    <SelectItem value="2 years">2 years</SelectItem>
                    <SelectItem value="3 years">3 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last review date</label>
                <Input
                  type="date"
                  value={formData.lastReviewDate}
                  onChange={(e) => handleChange("lastReviewDate", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Last reviewed by</label>
                <Input
                  value={formData.lastReviewedBy}
                  onChange={(e) => handleChange("lastReviewedBy", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Risk Analysis before controls and recommendations</label>
            <div className="border p-4 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Likelihood</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.riskLikelihood === value.toString() ? "default" : "outline"}
                      onClick={() => handleChange("riskLikelihood", value.toString())}
                      className="flex-1"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Severity</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.riskSeverity === value.toString() ? "default" : "outline"}
                      onClick={() => handleChange("riskSeverity", value.toString())}
                      className="flex-1"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Controls & Recommendations</label>
            <Textarea
              value={formData.controlsRecommendations}
              onChange={(e) => handleChange("controlsRecommendations", e.target.value)}
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Risk Analysis after controls and recommendations</label>
            <div className="border p-4 rounded-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Residual Likelihood</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.residualLikelihood === value.toString() ? "default" : "outline"}
                      onClick={() => handleChange("residualLikelihood", value.toString())}
                      className="flex-1"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Residual Severity</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={formData.residualSeverity === value.toString() ? "default" : "outline"}
                      onClick={() => handleChange("residualSeverity", value.toString())}
                      className="flex-1"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Documents</label>
            <div className="border p-4 rounded-md space-y-4">
              {isEdit && supplier && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Drag documents onto the grey box below to upload</p>
                    <p>Or select the files you wish to upload</p>
                  </div>
                  <DocumentUpload 
                    supplierId={supplier.id} 
                    onUploadComplete={(newDocument) => {
                      // Optimistically add the new document to the list
                      if (newDocument) {
                        console.log('DocumentUpload: New document received:', newDocument)
                        // Ensure the new document has all required fields
                        const formattedDocument = {
                          ...newDocument,
                          // Add any missing fields that the UI expects
                          assignedUserId: newDocument.assignedUserId || null,
                          assignedUser: newDocument.assignedUser || null
                        }
                        setDocList(prev => [formattedDocument, ...prev])
                        
                        // As a backup, also fetch fresh data after a short delay
                        // This ensures data consistency even if optimistic update fails
                        setTimeout(() => {
                          fetchDocuments()
                        }, 1000)
                      } else {
                        // Fallback to fetching fresh data
                        console.log('DocumentUpload: No document data, fetching fresh data')
                        fetchDocuments()
                      }
                    }} 
                  />
                </div>
              )}
              {loadingDocs ? (
                <p className="text-gray-500">Loading documents...</p>
              ) : docList.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-4 p-3 bg-gray-100 rounded-md font-medium text-sm">
                    <div>Document</div>
                    <div>Uploaded</div>
                    <div>Expiry Date</div>
                    <div>Assigned To</div>
                    <div>Actions</div>
                  </div>
                  {docList.map((doc) => {
                    const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
                    const today = new Date();
                    const isExpired = expiryDate && expiryDate < today;
                    const isExpiringSoon = expiryDate && expiryDate > today && expiryDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
                    
                    return (
                      <div key={doc.id} className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors items-center">
                        <span className="text-blue-600 hover:underline">
                          {doc.title}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          {expiryDate ? (
                            <span className="flex items-center gap-2">
                              {expiryDate.toLocaleDateString()}
                              {isExpired && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>}
                              {isExpiringSoon && <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Expiring Soon</span>}
                            </span>
                          ) : (
                            'No expiry'
                          )}
                        </span>
                        <div className="flex items-center space-x-2">
                          {loadingUsers ? (
                            <span className="text-sm text-gray-500">Loading users...</span>
                          ) : users.length === 0 ? (
                            <span className="text-sm text-red-500">No users available</span>
                          ) : (
                            <DocumentAssignmentSelect 
                              documentId={doc.id}
                              currentAssignment={doc.assignedUserId}
                              onAssignmentChange={handleDocumentAssignment}
                              users={users}
                            />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/suppliers/${supplier?.id}/documents/${doc.id}`}>Preview</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a 
                              href={`/api/suppliers/documents/${doc.id}/download`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/suppliers")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : isEdit ? "Update Supplier" : "Create Supplier"}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Document Assignment Select Component
function DocumentAssignmentSelect({ 
  documentId, 
  currentAssignment, 
  onAssignmentChange,
  users
}: { 
  documentId: string
  currentAssignment?: string | null
  onAssignmentChange: (documentId: string, userId: string | null) => void
  users: Array<{ id: string; name: string; email: string | null; username: string }>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(currentAssignment || null)

  // Update local state when currentAssignment changes (e.g., from parent component updates)
  useEffect(() => {
    console.log('DocumentAssignmentSelect: currentAssignment changed to:', currentAssignment)
    setSelectedUserId(currentAssignment || null)
  }, [currentAssignment])



  const handleAssignmentChange = (userId: string | null) => {
    setSelectedUserId(userId)
    onAssignmentChange(documentId, userId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectedUserId ? (
          <span className="text-gray-900">
            {users.find((u: { id: string; name: string; email: string | null; username: string }) => u.id === selectedUserId)?.name || 'Unknown User'}
          </span>
        ) : (
          <span className="text-gray-500">Unassigned</span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            <button
              type="button"
              onClick={() => handleAssignmentChange(null)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Unassigned
            </button>
            {users.map((user: { id: string; name: string; email: string | null; username: string }) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleAssignmentChange(user.id)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {user.name} ({user.email || user.username})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}