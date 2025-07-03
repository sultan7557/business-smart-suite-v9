"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"

interface NewVersionPageProps {
  params: {
    id: string
  }
}

export default function NewVersionPage({ params }: NewVersionPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    version: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/custom-sections/${params.id}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          issueDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create version")
      }

      toast.success("Version created successfully")
      router.push(`/custom-sections/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating version:", error)
      toast.error("Failed to create version")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/custom-sections/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Section
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Version</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) =>
                setFormData({ ...formData, version: e.target.value })
              }
              placeholder="e.g., 1.1, 2.0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Enter version notes or changes"
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader /> : (<><Save className="mr-2 h-4 w-4" />Create Version</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 