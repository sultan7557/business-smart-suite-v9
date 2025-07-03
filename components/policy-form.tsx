"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface PolicyFormProps {
  policy: any
  canEdit: boolean
}

export default function PolicyForm({ policy, canEdit }: PolicyFormProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: policy.title,
    version: policy.version,
    issueDate: new Date(policy.issueDate).toISOString().split("T")[0],
    location: policy.location,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // const handleSave = async () => {
  //   if (!canEdit) return

  //   setIsLoading(true)
  //   try {
  //     const response = await fetch(`/api/policies/${policy.id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         ...formData,
  //         issueDate: new Date(formData.issueDate),
  //       }),
  //     })

  //     if (!response.ok) {
  //       throw new Error("Failed to update policy")
  //     }

  //     toast({
  //       title: "Success",
  //       description: "Policy updated successfully",
  //     })

  //     setIsEditing(false)
  //     router.refresh()
  //   } catch (error) {
  //     console.error("Error updating policy:", error)
  //     toast({
  //       title: "Error",
  //       description: "Failed to update policy",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleSave = async () => {
    if (!canEdit) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/policies/${policy.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          issueDate: new Date(formData.issueDate),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update policy")
      }

      toast({
        title: "Success",
        description: "Policy updated successfully",
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating policy:", error)
      toast({
        title: "Error",
        description: "Failed to update policy",
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
        <label className="block text-sm font-medium mb-1">Issue date</label>
        <Input
          type="date"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
          readOnly={!isEditing}
        />
      </div>

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

