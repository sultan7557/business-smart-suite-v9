"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload, File, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader } from '@/components/ui/loader'

interface LegalRegisterDocumentUploadProps {
  legalRegisterId: string
  onUploadComplete?: (document: any) => void
}

export default function LegalRegisterDocumentUpload({ legalRegisterId, onUploadComplete }: LegalRegisterDocumentUploadProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      // Auto-populate title from filename (without extension)
      const fileName = selectedFile.name.split(".").slice(0, -1).join(".")
      setTitle(fileName)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (!title.trim()) {
      setError("Please enter a title for the document")
      return
    }

    setError("")
    setUploading(true)
    setProgress(0)

    // Create form data
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("legalRegisterId", legalRegisterId)

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

      // Upload file
      const response = await fetch("/api/legal-register/documents", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload document")
      }

      const document = await response.json()

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      // Reset form state after upload
      setFile(null)
      setTitle("")
      if (fileInputRef.current) fileInputRef.current.value = ""

      if (onUploadComplete) {
        onUploadComplete(document)
      }

      // Redirect or refresh
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      console.error("Error uploading document:", error)
      setError(error.message || "Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>Upload a new document for this legal register item</CardDescription>
      </CardHeader>
      <CardContent>
        {uploading && <Loader overlay message="Uploading document..." ariaLabel="Uploading document" />}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              disabled={uploading}
            />
          </div>

          {!file ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Drag and drop your file here, or click to browse</p>
              <p className="text-xs text-gray-500">Supports: PDF, DOCX, XLSX, PPTX, JPG, PNG (max 10MB)</p>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-8 w-8 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploading && (
                <div className="mt-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          disabled={uploading}
          onClick={() => {
            router.back()
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? <Loader size="sm" ariaLabel="Uploading..." /> : "Upload Document"}
        </Button>
      </CardFooter>
    </Card>
  )
}