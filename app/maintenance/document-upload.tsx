"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Upload, File, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { uploadMaintenanceDocument } from "@/app/actions/maintenance-actions"
import { Textarea } from "@/components/ui/textarea"

interface DocumentUploadProps {
  maintenanceId: string;
  onUploadComplete: (document: any) => void;
  onCancel: () => void;
  existingDocument?: any;
}

export default function DocumentUpload({ maintenanceId, onUploadComplete, onCancel, existingDocument }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Auto-populate title from filename (without extension)
      const fileName = selectedFile.name.split(".").slice(0, -1).join(".");
      setTitle(fileName);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);

      // Auto-populate title from filename (without extension)
      const fileName = droppedFile.name.split(".").slice(0, -1).join(".");
      setTitle(fileName);
    }
  };

  const clearFile = () => {
    setFile(null);
    setTitle("");
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the document");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("notes", notes);
      if (existingDocument) {
        formData.append("documentId", existingDocument.id);
      }

      const response = await fetch(`/api/maintenance/${maintenanceId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      onUploadComplete(result);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-medium mb-4">Documents</h3>
        
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            />
            <div className="space-y-2">
              <File className="h-8 w-8 mx-auto text-gray-400" />
              <div className="text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Click to upload
                </button>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG up to 10MB
              </p>
            </div>
          </div>

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-red-600 hover:text-red-500"
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Version Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this version..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-20"
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Uploading... {progress}%
                  </p>
                </div>
              )}
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}