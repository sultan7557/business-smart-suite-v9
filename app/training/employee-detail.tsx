// app/training/employee-detail.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Archive, Trash2, User, FileUp, GraduationCap } from 'lucide-react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  updateEmployee, 
  archiveEmployee, 
  deleteEmployee,
  addEmployeeSkill,
  deleteEmployeeSkill,
  uploadEmployeeDocument,
  deleteEmployeeDocument
} from "../actions/training-actions"
import { Loader } from '@/components/ui/loader'

interface EmployeeDetailProps {
  employee: any
  skills: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function EmployeeDetail({
  employee,
  skills,
  canEdit,
  canDelete
}: EmployeeDetailProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("mandatory")
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    surname: employee.surname,
    occupation: employee.occupation,
    department: employee.department,
    systemUserId: employee.systemUserId || "none",
    profilePicture: employee.profilePicture || ""
  })
  const [newDepartment, setNewDepartment] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("")
  const [dateCompleted, setDateCompleted] = useState("")
  const [evidence, setEvidence] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState("General Document")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  
  // Get mandatory and optional skills
  const mandatorySkills = skills.filter(skill => skill.mandatory)
  const optionalSkills = skills.filter(skill => !skill.mandatory)
  
  // Get employee skills
  const employeeSkills = employee.employeeSkills || []
  
  // Get employee documents
  const documents = employee.documents || []
  
  // Check if employee has mandatory skills
  const hasMandatorySkills = employeeSkills.some((es: any) => 
    mandatorySkills.some((ms: any) => ms.id === es.skillId)
  )
  
  // Check if employee has incomplete mandatory training
  const hasIncompleteMandatoryTraining = mandatorySkills.some((skill: any) => 
    !employeeSkills.some((es: any) => es.skillId === skill.id)
  )
  
  // Add local loading states for skill/document actions
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setLoadingAction((prev) => ({ ...prev, save: 'save' }))
      const result = await updateEmployee(employee.id, formData)
      setLoadingAction((prev) => ({ ...prev, save: null }))
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update employee")
      }
      
      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
      
      router.refresh()
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, save: null }))
      console.error("Error updating employee:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleArchive = async () => {
    try {
      if (confirm("Are you sure you want to archive this employee?")) {
        setIsSubmitting(true)
        setLoadingAction((prev) => ({ ...prev, archive: 'archive' }))
        const result = await archiveEmployee(employee.id)
        setLoadingAction((prev) => ({ ...prev, archive: null }))
        
        if (!result.success) {
          throw new Error(result.error || "Failed to archive employee")
        }
        
        toast({
          title: "Success",
          description: "Employee archived successfully",
        })
        
        router.push("/training")
      }
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, archive: null }))
      console.error("Error archiving employee:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while archiving employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDelete = async () => {
    try {
      if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
        setIsSubmitting(true)
        setLoadingAction((prev) => ({ ...prev, delete: 'delete' }))
        const result = await deleteEmployee(employee.id)
        setLoadingAction((prev) => ({ ...prev, delete: null }))
        
        if (!result.success) {
          throw new Error(result.error || "Failed to delete employee")
        }
        
        toast({
          title: "Success",
          description: "Employee deleted successfully",
        })
        
        router.push("/training")
      }
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, delete: null }))
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleAddSkill = async () => {
    try {
      if (!selectedSkill) {
        toast({
          title: "Error",
          description: "Please select a skill",
          variant: "destructive",
        })
        return
      }
      
      if (!dateCompleted) {
        toast({
          title: "Error",
          description: "Please select a completion date",
          variant: "destructive",
        })
        return
      }
      
      setIsSubmitting(true)
      setLoadingAction((prev) => ({ ...prev, addSkill: 'addSkill' }))
      
      // Upload evidence if provided
      let evidenceUrl = undefined
      if (evidence) {
        // In a real app, you would upload the file to a storage service
        // For this demo, we'll create a mock URL
        evidenceUrl = `/api/documents/download/${Date.now()}-${evidence.name}`
      }
      
      const result = await addEmployeeSkill(
        employee.id, 
        selectedSkill, 
        dateCompleted, 
        evidenceUrl
      )
      setLoadingAction((prev) => ({ ...prev, addSkill: null }))
      
      if (!result.success) {
        throw new Error(result.error || "Failed to add skill")
      }
      
      toast({
        title: "Success",
        description: "Skill added successfully",
      })
      
      // Reset form
      setSelectedSkill("")
      setDateCompleted("")
      setEvidence(null)
      
      router.refresh()
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, addSkill: null }))
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while adding skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteSkill = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this skill?")) {
        setLoadingAction((prev) => ({ ...prev, [id]: 'deleteSkill' }))
        const result = await deleteEmployeeSkill(id)
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        
        if (!result.success) {
          throw new Error(result.error || "Failed to delete skill")
        }
        
        toast({
          title: "Success",
          description: "Skill deleted successfully",
        })
        
        router.refresh()
      }
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting skill",
        variant: "destructive",
      })
    }
  }
  
  const handleUploadDocument = async () => {
    try {
      if (!documentFile) {
        toast({
          title: "Error",
          description: "Please select a file to upload",
          variant: "destructive",
        })
        return
      }
      setIsSubmitting(true)
      setLoadingAction((prev) => ({ ...prev, uploadDocument: 'uploadDocument' }))

      const formData = new FormData()
      formData.append('file', documentFile)
      formData.append('title', documentType)
      const result = await uploadEmployeeDocument(employee.id, formData)
      setLoadingAction((prev) => ({ ...prev, uploadDocument: null }))
      if (!result.success) {
        throw new Error(result.error || "Failed to upload document")
      }
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      // Reset form
      setDocumentType("General Document")
      setDocumentFile(null)
      router.refresh()
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, uploadDocument: null }))
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while uploading document",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteDocument = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this document?")) {
        setLoadingAction((prev) => ({ ...prev, [id]: 'deleteDocument' }))
        const result = await deleteEmployeeDocument(id)
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        
        if (!result.success) {
          throw new Error(result.error || "Failed to delete document")
        }
        
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
        
        router.refresh()
      }
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting document",
        variant: "destructive",
      })
    }
  }
  
  return (
    <div className="space-y-6 relative">
      {isSubmitting && <Loader overlay message="Processing..." />}
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/training" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to employee list
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Employee details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">First name:</label>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Surname:</label>
              <Input
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Occupation:</label>
              <Input
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select department or enter a new one below --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                  <SelectItem value="Kitting">Kitting</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="new department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">System user</label>
              <Select
                value={formData.systemUserId}
                onValueChange={(value) => setFormData({ ...formData, systemUserId: value })}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Select the system user to link to --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Select the system user to link to --</SelectItem>
                  {/* Add system users here */}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Profile picture</label>
              <div className="flex items-center space-x-4">
                <div className="h-24 w-24 border rounded-md overflow-hidden">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // In a real app, you would upload the file to a storage service
                      // For this demo, we'll create a mock URL
                      const file = e.target.files[0]
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        if (event.target && event.target.result) {
                          setFormData({
                            ...formData,
                            profilePicture: event.target.result as string
                          })
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loadingAction.save === 'save' ? <Loader size="sm" ariaLabel="Saving..." /> : 'Save'}
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {loadingAction.save === 'save' ? <Loader size="sm" ariaLabel="Saving..." /> : 'Save and continue'}
              </Button>
              <Button 
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {canDelete && (
                <>
                  <Button 
                    variant="outline"
                    onClick={handleArchive}
                    disabled={isSubmitting}
                    className="text-yellow-600"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {loadingAction.archive === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : 'Archive'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loadingAction.delete === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                  </Button>
                </>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={() => router.push("/registers")}
            >
              Back to registers
            </Button>
          </div>
        </div>
        
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="mandatory">Mandatory training</TabsTrigger>
              <TabsTrigger value="optional">Optional training</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mandatory" className="mt-4">
              {hasIncompleteMandatoryTraining && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700">This employee has in-complete mandatory training</p>
                </div>
              )}
              
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mandatorySkills.map((skill: any) => {
                    const employeeSkill = employeeSkills.find((es: any) => es.skillId === skill.id)
                    return (
                      <tr key={skill.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                              <div className="text-sm text-gray-500">{skill.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {skill.frequencyDays > 0 ? `${skill.frequencyDays} days` : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {employeeSkill ? (
                            <>
                              <span className="text-green-600 mr-2">
                                {new Date(employeeSkill.dateCompleted).toLocaleDateString()}
                              </span>
                              {canEdit && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteSkill((employeeSkill as any).id)}
                                  disabled={!!loadingAction[(employeeSkill as any).id]}
                                >
                                  {loadingAction[(employeeSkill as any).id] === 'deleteSkill' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                                </Button>
                              )}
                            </>
                          ) : (
                            canEdit && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSkill(skill.id)
                                  setActiveTab("optional") // Switch to optional tab to add skill
                                }}
                              >
                                Add
                              </Button>
                            )
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  
                  {mandatorySkills.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        This employee has no active mandatory skills.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TabsContent>
            
            <TabsContent value="optional" className="mt-4">
              <div className="bg-gray-100 p-4 mb-4">
                <h3 className="font-medium mb-2">Add new skill</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select skill</label>
                    <Select
                      value={selectedSkill}
                      onValueChange={setSelectedSkill}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Select skill --" />
                      </SelectTrigger>
                      <SelectContent>
                        {skills.map(skill => (
                          <SelectItem key={skill.id} value={skill.id}>
                            {skill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Date completed</label>
                    <Input
                      type="date"
                      value={dateCompleted}
                      onChange={(e) => setDateCompleted(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Evidence</label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setEvidence(e.target.files[0])
                        }
                      }}
                    />
                  </div>
                </div>
                
                <Button 
                  className="mt-4"
                  onClick={handleAddSkill}
                  disabled={isSubmitting}
                >
                  {loadingAction.addSkill === 'addSkill' ? <Loader size="sm" ariaLabel="Adding..." /> : 'Add skill'}
                </Button>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  {employeeSkills.length > 0 
                    ? "This employee currently has the following training records:"
                    : "This employee currently has no active training records."}
                </p>
                
                {employeeSkills.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Completed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employeeSkills.map((es: any) => {
                        const skill = skills.find((s: any) => s.id === es.skillId)
                        return (
                          <tr key={es.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{skill?.name || "Unknown Skill"}</div>
                                  <div className="text-sm text-gray-500">{skill?.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(es.dateCompleted).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {es.evidence ? (
                                <a 
                                  href={es.evidence} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View Evidence
                                </a>
                              ) : (
                                "No evidence"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {canEdit && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteSkill(es.id)}
                                  disabled={!!loadingAction[es.id]}
                                >
                                  {loadingAction[es.id] === 'deleteSkill' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="mt-4">
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Upload documents</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type of document to upload</label>
                    <Select
                      value={documentType}
                      onValueChange={setDocumentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="General Document" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Document">General Document</SelectItem>
                        <SelectItem value="Training Certificate">Training Certificate</SelectItem>
                        <SelectItem value="ID Document">ID Document</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Drag documents onto the grey box below to upload</p>
                    <div className="flex justify-center">
                      <Input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setDocumentFile(e.target.files[0])
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleUploadDocument}
                      disabled={!documentFile || isSubmitting}
                    >
                      {loadingAction.uploadDocument === 'uploadDocument' ? <Loader size="sm" ariaLabel="Uploading..." /> : 'Upload'}
                    </Button>
                  </div>
                </div>
                
                {documents.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Uploaded Documents</h3>
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc: any) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FileUp className="h-5 w-5 mr-2 text-gray-500" />
                                <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doc.uploadedBy?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a 
                                href={`/api/training/documents/${doc.id}/download?download=1`} 
                                download
                                className="text-blue-600 hover:underline mr-4"
                              >
                                Download
                              </a>
                              <a 
                                href={`/training/${employee.id}/documents/${doc.id}`} 
                                className="text-blue-600 hover:underline mr-4"
                              >
                                Preview
                              </a>
                              {canDelete && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  disabled={!!loadingAction[doc.id]}
                                >
                                  {loadingAction[doc.id] === 'deleteDocument' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}