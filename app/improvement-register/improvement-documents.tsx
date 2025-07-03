"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2, FileText, Plus } from "lucide-react"
import { DocumentUpload, AddDocumentVersion } from "./document-upload"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ImprovementDocument {
  id: string
  title: string
  fileType: string
  uploadedBy: {
    name: string
  }
  createdAt: string
  versions: {
    version: string
  }[]
}

interface ImprovementDocumentsProps {
  improvementId: string
  documents: ImprovementDocument[]
  permissions: {
    canEdit: boolean
    canDelete: boolean
  }
}

export default function ImprovementDocuments({ improvementId, documents, permissions }: ImprovementDocumentsProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [showSizeAlert, setShowSizeAlert] = useState(false)
  const router = useRouter()

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/improvement-documents/${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      toast.success("Document deleted successfully")
      router.refresh()
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
        {permissions.canEdit && (
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Plus className="w-4 h-4 mr-2" />
            {showUpload ? "Cancel" : "Upload Document"}
          </Button>
        )}
      </div>

      {showUpload && (
        <div className="border rounded-lg p-4">
          <DocumentUpload 
            improvementId={improvementId} 
            onUploadComplete={() => setShowUpload(false)}
            onSizeError={() => setShowSizeAlert(true)}
          />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="min-w-[200px]">Title</TableHead>
                <TableHead className="min-w-[100px]">Type</TableHead>
                <TableHead className="min-w-[150px]">Uploaded By</TableHead>
                <TableHead className="min-w-[150px]">Date</TableHead>
                <TableHead className="min-w-[150px]">Versions</TableHead>
                <TableHead className="min-w-[200px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="truncate max-w-[200px]">{doc.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{doc.fileType}</TableCell>
                  <TableCell>{doc.uploadedBy.name}</TableCell>
                  <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>Latest: v{doc.versions[0]?.version || "1"}</span>
                      <span className="text-gray-500">({doc.versions.length} version{doc.versions.length !== 1 ? "s" : ""})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/api/improvement-documents/${doc.id}/download`, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {permissions.canEdit && (
                        <AddDocumentVersion documentId={doc.id} documentTitle={doc.title} />
                      )}
                      {permissions.canDelete && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showSizeAlert} onOpenChange={setShowSizeAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>File Size Limit Exceeded</AlertDialogTitle>
            <AlertDialogDescription>
              The file you are trying to upload exceeds the maximum size limit of 10MB. 
              Please try uploading a smaller file or compress the file before uploading.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowSizeAlert(false)}>
              Try Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 