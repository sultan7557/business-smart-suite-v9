"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { addBusinessContinuityVersion } from "@/app/actions/business-continuity-actions"

interface BusinessContinuityVersionFormProps {
  businessContinuityId: string
  currentVersion: string
  onComplete: () => void
  documentId?: string
}

export default function BusinessContinuityVersionForm({
  businessContinuityId,
  currentVersion,
  onComplete,
  documentId,
}: BusinessContinuityVersionFormProps) {
  const [version, setVersion] = useState(incrementVersion(currentVersion))
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0])
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
      formData.append("issueDate", issueDate)
      formData.append("notes", notes)
      if (documentId) {
        formData.append("documentId", documentId)
      }

      const result = await addBusinessContinuityVersion(businessContinuityId, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "New business continuity version added successfully",
        })
        onComplete()
      }
    } catch (error) {
      console.error("Error adding business continuity version:", error)
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
        <CardTitle>Add New Business Continuity Version</CardTitle>
        <CardDescription>Create a new version of this business continuity</CardDescription>
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
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
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
              placeholder="Describe what changed in this business continuity version"
              rows={3}
            />
          </div>

          {documentId && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">This business continuity version will be linked to the document you just uploaded.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onComplete} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Business Continuity Version"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
