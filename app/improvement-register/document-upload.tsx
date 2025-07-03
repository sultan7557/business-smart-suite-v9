"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Upload, File, X } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader } from '@/components/ui/loader'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

interface DocumentUploadProps {
  improvementId: string
  onUploadComplete?: () => void
  onSizeError?: () => void
}

export default function DocumentUpload({ improvementId, onUploadComplete, onSizeError }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > MAX_FILE_SIZE) {
        onSizeError?.()
        setFile(null)
        return
      }
      setFile(selectedFile)
      setTitle(selectedFile.name)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)

      // Auto-populate title from filename (without extension)
      const fileName = droppedFile.name.split(".").slice(0, -1).join(".")
      setTitle(fileName)
    }
  }

  const clearFile = () => {
    setFile(null)
    setTitle("")
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a title")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("improvementId", improvementId)

      const response = await fetch("/api/improvement-documents", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload document")
      }

      toast.success("Document uploaded successfully")
      setFile(null)
      setTitle("")
      onUploadComplete?.()
      router.refresh()
    } catch (error) {
      console.error("Error uploading document:", error)
      toast.error("Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 relative">
      {isUploading && (
        <Loader overlay message="Uploading document..." ariaLabel="Uploading document" />
      )}
      <div className="space-y-2">
        <Label htmlFor="file">Document</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
        />
        <p className="text-sm text-gray-500">
          Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
        </p>
        </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
          required
            />
          </div>
        <Button
        onClick={handleUpload} 
        disabled={!file || !title.trim() || isUploading}
        className="w-full"
      >
        {isUploading ? <Loader size="sm" ariaLabel="Uploading..." /> : "Upload Document"}
        </Button>
    </div>
  )
}

// Component for adding a new version to an existing document
export function AddDocumentVersion({ documentId, documentTitle }: { documentId: string; documentTitle: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [version, setVersion] = useState("")
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
        setFile(null)
        return
      }
      setFile(e.target.files[0])
    }
  }

  const clearForm = () => {
    setFile(null)
    setVersion("")
    setNotes("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    if (!version) {
      toast.error("Please enter a version number")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentId", documentId)
      formData.append("version", version)
      formData.append("notes", notes)
      formData.append("action", "addVersion")

      // Upload file
      const response = await fetch("/api/improvement-documents", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add document version")
      }

      toast.success("Document version added successfully")

      clearForm()
      setIsOpen(false)
      window.location.reload() // Refresh to show the new version
    } catch (error: any) {
      console.error("Error adding document version:", error)
      toast.error(error.message || "Failed to add document version")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Version</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Version for "{documentTitle}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version">Version Number</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 1.1, 2.0"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500">
              Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
            </p>
            {file && (
              <p className="text-sm text-gray-500">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Version Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Describe what changed in this version"
              rows={3}
            />
          </div>

          {uploading && (
            <div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={uploading}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={!file || !version.trim() || uploading}
          >
            {uploading ? "Uploading..." : "Add Version"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}