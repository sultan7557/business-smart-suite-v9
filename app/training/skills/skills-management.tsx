"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { GraduationCap, Plus, ArrowLeft } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { createSkill, updateSkill, deleteSkill } from "../../actions/training-actions"

interface SkillsManagementProps {
  skills: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function SkillsManagement({
  skills,
  canEdit,
  canDelete
}: SkillsManagementProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false)
  const [showEditSkillDialog, setShowEditSkillDialog] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequencyDays: "0",
    departments: [] as string[],
    mandatory: "No"
  })
  const [newDepartment, setNewDepartment] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleDepartmentChange = (department: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        departments: [...formData.departments, department]
      })
    } else {
      setFormData({
        ...formData,
        departments: formData.departments.filter(d => d !== department)
      })
    }
  }
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      frequencyDays: "0",
      departments: [],
      mandatory: "No"
    })
    setSelectedSkill(null)
    setNewDepartment("")
  }
  
  const handleAddSkill = async () => {
    try {
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Skill name is required",
          variant: "destructive",
        })
        return
      }
      
      setIsSubmitting(true)
      
      const departments = [...formData.departments]
      if (newDepartment.trim() !== "") {
        const trimmedNewDept = newDepartment.trim()
        if (!departments.includes(trimmedNewDept)) {
          departments.push(trimmedNewDept)
        }
      }
      const skillData = { ...formData, departments }
      const result = await createSkill(skillData)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create skill")
      }
      
      toast({
        title: "Success",
        description: "Skill created successfully",
      })
      
      setNewDepartment("")
      resetForm()
      setShowAddSkillDialog(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error creating skill:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditSkill = (skill: any) => {
    setSelectedSkill(skill)
    setFormData({
      name: skill.name,
      description: skill.description,
      frequencyDays: skill.frequencyDays.toString(),
      departments: skill.departments || [],
      mandatory: skill.mandatory ? "Yes" : "No"
    })
    setNewDepartment("")
    setShowEditSkillDialog(true)
  }
  
  const handleUpdateSkill = async () => {
    try {
      if (!selectedSkill) return
      
      if (!formData.name) {
        toast({
          title: "Error",
          description: "Skill name is required",
          variant: "destructive",
        })
        return
      }
      
      setIsSubmitting(true)
      
      const departments = [...formData.departments]
      if (newDepartment.trim() !== "") {
        const trimmedNewDept = newDepartment.trim()
        if (!departments.includes(trimmedNewDept)) {
          departments.push(trimmedNewDept)
        }
      }
      const skillData = { ...formData, departments }
      const result = await updateSkill(selectedSkill.id, skillData)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to update skill")
      }
      
      toast({
        title: "Success",
        description: "Skill updated successfully",
      })
      
      setNewDepartment("")
      resetForm()
      setShowEditSkillDialog(false)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteSkill = async (id: string) => {
    try {
      if (confirm("Are you sure you want to delete this skill? This action cannot be undone.")) {
        setIsSubmitting(true)
        
        const result = await deleteSkill(id)
        
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
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting skill",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <GraduationCap className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Manage Skills</h1>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => {
            resetForm()
            setShowAddSkillDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add new skill
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-md">
        <p>A skill is an individual skill which can be assigned to any user. The skill can be be set to be required so if a user is assigned the skill and it requires to be re-validated over a certain frequency then the system will notify admins when due.</p>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {skills.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No skills found
                </td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                      <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{skill.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {skill.departments?.join(", ") || "All departments"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => handleEditSkill(skill)}
                    >
                      Edit
                    </Button>
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="flex items-center"
          onClick={() => router.push("/training")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to employees
        </Button>
      </div>
      
      {/* Add Skill Dialog */}
      <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit/Create skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Please complete the fields below. The name and description are used to identify the skill. The frequency determins the validity period for the skill if required and is entered in days so a certificate valid for a year would be 365.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name:</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description:</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Frequency in days:</label>
              <Input
                name="frequencyDays"
                type="number"
                min="0"
                value={formData.frequencyDays}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="finance" 
                    checked={formData.departments.includes("Finance")}
                    onCheckedChange={(checked) => handleDepartmentChange("Finance", checked as boolean)}
                  />
                  <label htmlFor="finance">Finance</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="kitting" 
                    checked={formData.departments.includes("Kitting")}
                    onCheckedChange={(checked) => handleDepartmentChange("Kitting", checked as boolean)}
                  />
                  <label htmlFor="kitting">Kitting</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="management" 
                    checked={formData.departments.includes("Management")}
                    onCheckedChange={(checked) => handleDepartmentChange("Management", checked as boolean)}
                  />
                  <label htmlFor="management">Management</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="operations" 
                    checked={formData.departments.includes("Operations")}
                    onCheckedChange={(checked) => handleDepartmentChange("Operations", checked as boolean)}
                  />
                  <label htmlFor="operations">Operations</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="warehouse" 
                    checked={formData.departments.includes("Warehouse")}
                    onCheckedChange={(checked) => handleDepartmentChange("Warehouse", checked as boolean)}
                  />
                  <label htmlFor="warehouse">Warehouse</label>
                </div>
              </div>
              
              <Input
                className="mt-2"
                placeholder="new department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mandatory:</label>
              <Select
                value={formData.mandatory}
                onValueChange={(value) => setFormData({ ...formData, mandatory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSkillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Skill Dialog */}
      <Dialog open={showEditSkillDialog} onOpenChange={setShowEditSkillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit/Create skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Please complete the fields below. The name and description are used to identify the skill. The frequency determins the validity period for the skill if required and is entered in days so a certificate valid for a year would be 365.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Name:</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description:</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Frequency in days:</label>
              <Input
                name="frequencyDays"
                type="number"
                min="0"
                value={formData.frequencyDays}
                onChange={handleInputChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="finance-edit" 
                    checked={formData.departments.includes("Finance")}
                    onCheckedChange={(checked) => handleDepartmentChange("Finance", checked as boolean)}
                  />
                  <label htmlFor="finance-edit">Finance</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="kitting-edit" 
                    checked={formData.departments.includes("Kitting")}
                    onCheckedChange={(checked) => handleDepartmentChange("Kitting", checked as boolean)}
                  />
                  <label htmlFor="kitting-edit">Kitting</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="management-edit" 
                    checked={formData.departments.includes("Management")}
                    onCheckedChange={(checked) => handleDepartmentChange("Management", checked as boolean)}
                  />
                  <label htmlFor="management-edit">Management</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="operations-edit" 
                    checked={formData.departments.includes("Operations")}
                    onCheckedChange={(checked) => handleDepartmentChange("Operations", checked as boolean)}
                  />
                  <label htmlFor="operations-edit">Operations</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="warehouse-edit" 
                    checked={formData.departments.includes("Warehouse")}
                    onCheckedChange={(checked) => handleDepartmentChange("Warehouse", checked as boolean)}
                  />
                  <label htmlFor="warehouse-edit">Warehouse</label>
                </div>
              </div>
              
              <Input
                className="mt-2"
                placeholder="new department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mandatory:</label>
              <Select
                value={formData.mandatory}
                onValueChange={(value) => setFormData({ ...formData, mandatory: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSkillDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSkill} disabled={isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}