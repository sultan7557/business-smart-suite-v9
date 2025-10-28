"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Upload, X, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  size: number
  uploadedAt: Date
  uploadedBy: {
    name: string
  }
}

interface AuditDocumentListProps {
  documents: Document[]
  auditId: string
  canEdit?: boolean
}

export default function AuditDocumentList({ documents, auditId, canEdit = false }: AuditDocumentListProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({})

  // Only run client-side code after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/audit-schedule/${auditId}/documents/${documentId}`)
  }

  const handleDownload = (fileUrl: string) => {
    window.open(`/api/documents/download${fileUrl}`, "_blank")
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to upload documents",
        variant: "destructive",
      })
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size must be less than 10MB`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      toast({
        title: "File Size Errors",
        description: errors.join(", "),
        variant: "destructive",
      })
    }

    if (validFiles.length === 0) return

    // Upload files
    setUploadingFiles(validFiles)
    
    for (const file of validFiles) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const formData = new FormData()
        formData.append("files", file)
        formData.append("auditId", auditId)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }))
        }, 100)

        const response = await fetch("/api/audit-schedule/upload-documents", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

        if (response.ok) {
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
        } else {
          throw new Error(`Upload failed for ${file.name}`)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
      }
    }

    // Clear upload state after a delay
    setTimeout(() => {
      setUploadingFiles([])
      setUploadProgress({})
      setUploadStatus({})
      // Refresh the page to show new documents
      window.location.reload()
    }, 2000)
  }, [canEdit, auditId])

  const removeUploadingFile = (fileName: string) => {
    setUploadingFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
  }

  // Don't render interactive elements until after hydration
  if (!mounted) {
    return (
      <div className="mt-8 border rounded-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">Audit Documents</h2>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center flex-grow">
                  <FileText className="h-6 w-6 mr-3 text-blue-500" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <div className="h-8 w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 border rounded-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 bg-gray-100 border-b">Audit Documents</h2>
      
      <div 
        className={`p-4 transition-colors ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="text-center py-8 text-blue-600 font-medium">
            <Upload className="h-12 w-12 mx-auto mb-2" />
            Drop files here to upload
          </div>
        )}

        {!isDragOver && (
          <>
            {documents.length === 0 && uploadingFiles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-4">No documents uploaded</p>
                <p className="text-sm mb-4">Drag and drop files here or use the upload button</p>
                {canEdit && (
                  <Button variant="secondary" asChild>
                    <Link href={`/audit-schedule/${auditId}/edit`}>Upload Document</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Existing documents */}
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div 
                      className="flex items-center cursor-pointer flex-grow"
                      onClick={() => handleDocumentClick(doc.id)}
                    >
                      <FileText className="h-6 w-6 mr-3 text-blue-500" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(doc.fileUrl)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Uploading files */}
                {uploadingFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-4 border rounded-lg bg-blue-50"
                  >
                    <div className="flex items-center flex-grow">
                      <FileText className="h-6 w-6 mr-3 text-blue-500" />
                      <div className="flex-grow">
                        <span className="truncate text-sm font-medium">{file.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {uploadStatus[file.name] === 'uploading' && (
                            <>
                              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">{uploadProgress[file.name] || 0}%</span>
                            </>
                          )}
                          {uploadStatus[file.name] === 'success' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {uploadStatus[file.name] === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeUploadingFile(file.name)}
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 