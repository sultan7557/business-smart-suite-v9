// app/suppliers/document-upload.tsx

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import { uploadSupplierDocument } from "../actions/supplier-actions"
import { useRouter } from "next/navigation"
import { Loader } from '@/components/ui/loader'

interface DocumentUploadProps {
  supplierId: string
  onUploadComplete?: () => void
}

export default function DocumentUpload({ supplierId, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true)
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('notes', notes);
      formData.append('expiryDate', expiryDate);

      const result = await uploadSupplierDocument(supplierId, formData);
        
      if (result.success) {
        toast.success('Document uploaded successfully');
        setSelectedFile(null);
        setNotes("");
        setExpiryDate("");
        router.refresh();
        if (onUploadComplete) onUploadComplete();
      } else {
        throw new Error(result.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4 relative">
      {isUploading && <Loader overlay message="Uploading document..." ariaLabel="Uploading document" />}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">
          Drag and drop a file here, or click to select a file
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
        </p>
      </div>
      
      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedFile(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Expiry Date (optional)</label>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            placeholder="Select expiry date"
          />
        </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes (optional)</label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this document..."
        />
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? <Loader size="sm" ariaLabel="Uploading..." /> : "Upload Document"}
      </Button>
    </div>
  )
}