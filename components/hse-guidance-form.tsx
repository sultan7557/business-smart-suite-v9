"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface HseGuidanceFormProps {
  hseGuidance: any
  canEdit: boolean
}

export default function HseGuidanceForm({ hseGuidance, canEdit }: HseGuidanceFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: hseGuidance.title,
    version: hseGuidance.version,
    reviewDate: new Date(hseGuidance.reviewDate).toISOString().split("T")[0],
    nextReviewDate: hseGuidance.nextReviewDate ? new Date(hseGuidance.nextReviewDate).toISOString().split("T")[0] : "",
    department: hseGuidance.department,
    content: hseGuidance.content || "",
    highlighted: hseGuidance.highlighted || false,
    approved: hseGuidance.approved || false,
    categoryId: hseGuidance.categoryId
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    })
  }

  const handleSave = async () => {
    if (!canEdit) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/hse-guidance/${hseGuidance.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          reviewDate: new Date(formData.reviewDate),
          nextReviewDate: formData.nextReviewDate ? new Date(formData.nextReviewDate) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update HSE guidance")
      }

      toast({
        title: "Success",
        description: "HSE guidance updated successfully",
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating HSE guidance:", error)
      toast({
        title: "Error",
        description: "Failed to update HSE guidance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Version</label>
        <Input
          type="text"
          name="version"
          value={formData.version}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review Date</label>
        <Input
          type="date"
          name="reviewDate"
          value={formData.reviewDate}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Next Review Date</label>
        <Input
          type="date"
          name="nextReviewDate"
          value={formData.nextReviewDate}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <Input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <Textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          className="w-full p-2 border rounded min-h-[100px]"
          readOnly={!isEditing}
        />
      </div>

      {isEditing && (
        <>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="highlighted" 
              checked={formData.highlighted}
              onCheckedChange={(checked) => handleCheckboxChange("highlighted", checked as boolean)}
              disabled={!isEditing}
            />
            <label 
              htmlFor="highlighted" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Highlight this HSE guidance
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="approved" 
              checked={formData.approved}
              onCheckedChange={(checked) => handleCheckboxChange("approved", checked as boolean)}
              disabled={!isEditing}
            />
            <label 
              htmlFor="approved" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as approved
            </label>
          </div>
        </>
      )}

      {canEdit &&
        (isEditing ? (
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700 mt-4 flex-1" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" className="mt-4 flex-1" onClick={() => setIsEditing(false)} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button className="bg-blue-600 hover:bg-blue-700 mt-4" onClick={() => setIsEditing(true)}>
            Edit Details
          </Button>
        ))}
    </div>
  )
}
