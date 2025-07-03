"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, X } from "lucide-react"
import { toast } from "sonner"
import { uploadAuditDocument } from "@/app/actions/audit-actions"
import { Loader } from '@/components/ui/loader'

interface AuditFileUploadProps {
  auditId: string
  onUploadComplete?: () => void
  existingDocuments?: any[]
}

export default function AuditFileUpload({ auditId, onUploadComplete, existingDocuments = [] }: AuditFileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Filter for PDF and Word documents only
    const validFiles = files.filter(file => {
      const type = file.type.toLowerCase()
      return type === "application/pdf" || 
             type === "application/msword" || 
             type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    })
    
    if (validFiles.length !== files.length) {
      toast.error("Only PDF and Word documents are allowed")
    }
    
    setSelectedFiles(validFiles)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("auditId", auditId)
      
      // Add each file to the form data
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })

      const result = await uploadAuditDocument(formData)
      
      if (result.success) {
        toast.success("Files uploaded successfully")
        setSelectedFiles([])
        if (onUploadComplete) {
          onUploadComplete()
        }
      } else {
        toast.error(result.error || "Failed to upload files")
      }
    } catch (error) {
      toast.error("Failed to upload files")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4 relative">
      {isUploading && (
        <Loader overlay message="Uploading files..." ariaLabel="Uploading files" />
      )}
      <div className="space-y-2">
        <Label htmlFor="files">Upload Documents</Label>
        <Input
          id="files"
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="bg-gray-100 dark:bg-gray-800 cursor-pointer"
        />
        <p className="text-sm text-muted-foreground">
          Only PDF and Word documents are allowed
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? <Loader size="sm" ariaLabel="Uploading..." /> : "Upload Files"}
          </Button>
        </div>
      )}
    </div>
  )
} 