"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  File,
  UploadCloud
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  size: number
  uploadedAt: string
  uploadedBy: {
    name: string
  }
  notes?: string
}

interface DocumentManagerProps {
  riskId: string
  onDocumentsChange?: () => void
}

export default function DocumentManager({ riskId, onDocumentsChange }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  // Multiple file upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'pending' | 'uploading' | 'success' | 'error' }>({})
  const [bulkTitle, setBulkTitle] = useState("")
  const [bulkDescription, setBulkDescription] = useState("")
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [riskId])

  async function loadDocuments() {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents?entityId=${riskId}&entityType=imsAspectImpact`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data || [])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 10MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("title", title || selectedFile.name)
      formData.append("entityId", riskId)
      formData.append("entityType", "imsAspectImpact")
      if (description) formData.append("notes", description)

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        })
        setShowUpload(false)
        setSelectedFile(null)
        setTitle("")
        setDescription("")
        loadDocuments()
        onDocumentsChange?.()
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(documentId: string) {
    const doc = documents.find(d => d.id === documentId);
    const docName = doc?.title || 'this document';
    
    if (!confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `"${docName}" deleted successfully`,
        })
        loadDocuments()
        onDocumentsChange?.()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  // Multiple file upload functions
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
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

    setSelectedFiles(prev => [...prev, ...validFiles])
    
    // Initialize status for new files
    const newStatus: { [key: string]: 'pending' | 'uploading' | 'success' | 'error' } = {}
    validFiles.forEach(file => {
      newStatus[file.name] = 'pending'
    })
    setUploadStatus(prev => ({ ...prev, ...newStatus }))
  }

  function removeFile(fileName: string) {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName))
    setUploadStatus(prev => {
      const newStatus = { ...prev }
      delete newStatus[fileName]
      return newStatus
    })
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[fileName]
      return newProgress
    })
  }

  async function handleBulkUpload() {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    let successCount = 0
    let errorCount = 0

    // Upload files sequentially to avoid overwhelming the server
    for (const file of selectedFiles) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }))
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", bulkTitle || file.name)
        formData.append("entityId", riskId)
        formData.append("entityType", "imsAspectImpact")
        if (bulkDescription) formData.append("notes", bulkDescription)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }))
        }, 100)

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))

        if (response.ok) {
          setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }))
          successCount++
        } else {
          throw new Error(`Upload failed for ${file.name}`)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }))
        errorCount++
      }
    }

    // Show final results
    if (successCount > 0) {
      toast({
        title: "Bulk Upload Complete",
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      })
    }

    if (errorCount > 0 && successCount === 0) {
      toast({
        title: "Upload Failed",
        description: "All files failed to upload. Please try again.",
        variant: "destructive",
      })
    }

    // Reset state and reload documents
    setSelectedFiles([])
    setUploadStatus({})
    setUploadProgress({})
    setBulkTitle("")
    setBulkDescription("")
    setShowBulkUpload(false)
    loadDocuments()
    onDocumentsChange?.()
    setUploading(false)
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  function getFileIcon(fileType: string) {
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />
    if (fileType.includes("image")) return <FileText className="w-5 h-5 text-blue-500" />
    if (fileType.includes("word") || fileType.includes("document")) return <FileText className="w-5 h-5 text-blue-600" />
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FileText className="w-5 h-5 text-green-600" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  function canPreview(fileType: string): boolean {
    return fileType.includes("pdf") || fileType.includes("image")
  }

  function getNormalizedFileUrl(fileUrl: string): string {
    // Normalize fileUrl for preview/download - use the API endpoint
    if (fileUrl && !fileUrl.startsWith('/api/documents/download/')) {
      return `/api/documents/download/${fileUrl.replace(/^\/uploads\//, '')}`;
    }
    return fileUrl;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documents</h3>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Single
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                  />
                </div>
                <div>
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Max size: 10MB. Supported: PDF, Word, Excel, Images
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Document description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUpload(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
            <DialogTrigger asChild>
              <Button>
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Multiple
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Multiple Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-title">Title Prefix (Optional)</Label>
                  <Input
                    id="bulk-title"
                    value={bulkTitle}
                    onChange={(e) => setBulkTitle(e.target.value)}
                    placeholder="Common title prefix for all files"
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-description">Description (Optional)</Label>
                  <Textarea
                    id="bulk-description"
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    placeholder="Common description for all files"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-files">Select Files</Label>
                  <Input
                    id="bulk-files"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Max size per file: 10MB. Supported: PDF, Word, Excel, Images
                  </p>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{file.name}</div>
                              <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {uploadStatus[file.name] === 'pending' && (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                              {uploadStatus[file.name] === 'uploading' && (
                                <div className="flex items-center gap-2">
                                  <Progress value={uploadProgress[file.name] || 0} className="w-16 h-2" />
                                  <span className="text-xs">{uploadProgress[file.name] || 0}%</span>
                                </div>
                              )}
                              {uploadStatus[file.name] === 'success' && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {uploadStatus[file.name] === 'error' && (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.name)}
                                disabled={uploadStatus[file.name] === 'uploading'}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowBulkUpload(false)
                    setSelectedFiles([])
                    setUploadStatus({})
                    setUploadProgress({})
                    setBulkTitle("")
                    setBulkDescription("")
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={uploading || selectedFiles.length === 0}
                  >
                    {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Files`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents uploaded yet
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.fileType)}
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          {doc.notes && (
                            <div className="text-sm text-muted-foreground">{doc.notes}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {doc.uploadedBy.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {canPreview(doc.fileType) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewDoc(doc)
                              setShowPreview(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            try {
                              // Normalize fileUrl for download - use the API endpoint
                              let downloadUrl = doc.fileUrl;
                              if (downloadUrl && !downloadUrl.startsWith('/api/documents/download/')) {
                                downloadUrl = `/api/documents/download/${downloadUrl.replace(/^\/uploads\//, '')}`;
                              }
                              
                              // Create a temporary link element for download
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = doc.title || 'document';
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              toast({
                                title: "Download Started",
                                description: `Downloading ${doc.title || 'document'}`,
                              });
                            } catch (error) {
                              console.error('Download error:', error);
                              toast({
                                title: "Download Failed",
                                description: "Unable to download the document. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Document Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{previewDoc.fileType}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(previewDoc.size)}
                </span>
              </div>
              {previewDoc.fileType.includes("pdf") ? (
                <iframe
                  src={getNormalizedFileUrl(previewDoc.fileUrl)}
                  className="w-full h-96 border rounded"
                  title={previewDoc.title}
                />
              ) : previewDoc.fileType.includes("image") ? (
                <img
                  src={getNormalizedFileUrl(previewDoc.fileUrl)}
                  alt={previewDoc.title}
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              ) : (
                <div className="max-w-full max-h-96 object-contain mx-auto">
                  <div className="text-center py-8 text-muted-foreground">
                    Preview not available for this file type
                  </div>
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => window.open(getNormalizedFileUrl(previewDoc.fileUrl), "_blank")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Instead
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(getNormalizedFileUrl(previewDoc.fileUrl), "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
