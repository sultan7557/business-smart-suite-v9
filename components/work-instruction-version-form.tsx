"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { addWorkInstructionVersion } from "@/app/actions/work-instruction-actions"

interface WorkInstructionVersionFormProps {
  workInstructionId: string
  currentVersion: string
  onComplete: () => void
  documentId?: string
}

export default function WorkInstructionVersionForm({
  workInstructionId,
  currentVersion,
  onComplete,
  documentId,
}: WorkInstructionVersionFormProps) {
  const [version, setVersion] = useState(incrementVersion(currentVersion))
  const [reviewDate, setReviewDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  function incrementVersion(version: string): string {
    // Handle different version formats
    if (/^\d+$/.test(version)) {
      // Simple numeric version
      return (Number.parseInt(version) + 1).toString()
    } else if (/^\d+\.\d+$/.test(version)) {
      // Semantic version like 1.0
      const parts = version.split(".")
      const minor = Number.parseInt(parts[1]) + 1
      return `${parts[0]}.${minor}`
    } else {
      // If format is unknown, just append .1
      return `${version}.1`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("version", version)
      formData.append("reviewDate", reviewDate)
      formData.append("notes", notes)
      if (documentId) {
        formData.append("documentId", documentId)
      }

      const result = await addWorkInstructionVersion(workInstructionId, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "New work instruction version added successfully",
        })
        onComplete()
      }
    } catch (error) {
      console.error("Error adding work instruction version:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Work Instruction Version</CardTitle>
        <CardDescription>Create a new version of this work instruction</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. 2.0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what changed in this work instruction version"
              rows={3}
            />
          </div>

          {documentId && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">This work instruction version will be linked to the document you just uploaded.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onComplete} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Work Instruction Version"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
