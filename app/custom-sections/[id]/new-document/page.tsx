"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { Loader } from "@/components/ui/loader"

interface NewDocumentPageProps {
  params: {
    id: string
  }
}

export default function NewDocumentPage({ params }: NewDocumentPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title || file.name)
      formData.append("entityId", params.id)
      formData.append("entityType", "customSection")

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      toast.success("Document uploaded successfully")
      router.push(`/custom-sections/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
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
          <h1 className="text-2xl font-bold">Upload New Document</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
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
              {loading ? <Loader /> : (<><Upload className="mr-2 h-4 w-4" />Upload Document</>)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 