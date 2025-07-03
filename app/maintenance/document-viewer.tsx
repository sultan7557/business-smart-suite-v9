"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Edit, Replace } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import DocumentUpload from "./document-upload"

interface DocumentViewerProps {
  document: any;
  onBack: () => void;
}

export default function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState("document")
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)

  // Get the latest version and its URL
  const latestVersion = useMemo(() => {
    if (!document.versions?.length) return null;
    return document.versions.reduce((latest: any, current: any) => {
      if (!latest) return current;
      return parseInt(current.version) > parseInt(latest.version) ? current : latest;
    }, null);
  }, [document.versions]);

  // Use the latest version's URL if available, otherwise fall back to the document's URL
  const currentFileUrl = useMemo(() => {
    return latestVersion?.fileUrl || document.fileUrl;
  }, [latestVersion, document.fileUrl]);

  const handleDownload = async () => {
    try {
      window.open(currentFileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  // Format date consistently
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    try {
      iframe.contentWindow?.focus();
    } catch (error) {
      console.error('Error focusing iframe:', error);
    }
  };

      return (
    <div className="flex flex-col h-full">
      {/* Title and Details Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{document.title}</h2>
          <p className="text-gray-500">Last modified: {formatDate(document.uploadedAt)}</p>
          {latestVersion && (
            <p className="text-sm text-blue-600">Version {latestVersion.version}</p>
          )}
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to planned maintenance
            </Button>
      </div>
      
      {/* Main Content */}
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Left Side - Document Preview */}
        <div className="flex-grow">
          <Tabs defaultValue="document" className="h-full flex flex-col">
        <TabsList>
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="version-history">Version history</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
        </TabsList>
        
            <TabsContent value="document" className="flex-grow">
              <Card className="h-full">
                <iframe
                  src={currentFileUrl}
                  className="w-full h-full border-0"
                  title={document.title}
                  onLoad={handleIframeLoad}
                />
          </Card>
        </TabsContent>
        
        <TabsContent value="version-history">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Version History</h3>
                  {document.versions?.map((version: any) => (
                  <div key={version.id} className="border-b py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Version {version.version}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(version.createdAt)} by {version.createdBy.name}
                        </p>
                        {version.notes && (
                          <p className="text-sm mt-1">{version.notes}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => window.open(version.fileUrl, '_blank')}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Reviews</h3>
                <p className="text-gray-500">No reviews yet.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Permissions</h3>
                <p className="text-gray-500">Document permissions will be shown here.</p>
          </Card>
        </TabsContent>
        
        <TabsContent value="audits">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Audit History</h3>
                <p className="text-gray-500">Document audit history will be shown here.</p>
          </Card>
        </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - Actions */}
        <div className="w-64 space-y-4">
          <Button variant="outline" className="w-full" onClick={() => {}}>
            <Edit className="h-4 w-4 mr-2" />
            Edit this document
          </Button>
          
          <Button variant="outline" className="w-full" onClick={() => setReplaceDialogOpen(true)}>
            <Replace className="h-4 w-4 mr-2" />
            Replace this document
          </Button>

          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
              </Button>

          <Card className="p-4">
            <h3 className="font-medium mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Type:</span> {document.fileType}</p>
              <p><span className="text-gray-500">Size:</span> {Math.round(document.size / 1024)} KB</p>
              <p><span className="text-gray-500">Uploaded by:</span> {document.uploadedBy?.name}</p>
              <p><span className="text-gray-500">Upload date:</span> {formatDate(document.uploadedAt)}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Replace Document Dialog */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload
            maintenanceId={document.maintenanceId}
            existingDocument={document}
            onUploadComplete={() => {
              setReplaceDialogOpen(false);
              window.location.reload();
            }}
            onCancel={() => setReplaceDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}