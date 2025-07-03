// app/training/employee-form.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, User } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { createEmployee } from "../actions/training-actions"
import { Loader } from '@/components/ui/loader'

interface EmployeeFormProps {
  skills: any[]
}

export default function EmployeeForm({ skills }: EmployeeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    occupation: "",
    department: "",
    systemUserId: "none",
    profilePicture: ""
  })
  const [newDepartment, setNewDepartment] = useState("")
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  const handleSubmit = async (saveAndContinue = false) => {
    try {
      if (!formData.firstName || !formData.surname) {
        toast({
          title: "Error",
          description: "First name and surname are required",
          variant: "destructive",
        })
        return
      }
      
      setIsSubmitting(true)
      
      // Use new department if provided
      const finalData = {
        ...formData,
        department: newDepartment || formData.department
      }
      
      const result = await createEmployee(finalData)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create employee")
      }
      
      toast({
        title: "Success",
        description: "Employee created successfully",
      })
      
      if (saveAndContinue) {
        router.push(`/training/${result.data.id}`)
      } else {
        router.push("/training")
      }
    } catch (error: any) {
      console.error("Error creating employee:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating employee",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/training" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to employee list
          </Link>
        </Button>
      </div>
      
      <h2 className="text-2xl font-bold">Employee details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">First name:</label>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Surname:</label>
          <Input
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Occupation:</label>
          <Input
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value })}
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
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">System user</label>
          <Select
            value={formData.systemUserId}
            onValueChange={(value) => setFormData({ ...formData, systemUserId: value })}
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
            />
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : 'Save'}
        </Button>
        <Button 
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : 'Save and continue'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => router.push("/training")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
      
      {isSubmitting && <Loader overlay message="Saving..." />}
      
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
  )
}