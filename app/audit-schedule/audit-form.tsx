"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { createAudit, updateAudit } from "../actions/audit-actions"
import { useToast } from "@/components/ui/use-toast"
import AuditFileUpload from "@/app/components/audit-file-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from '@/components/ui/loader'

interface AuditFormProps {
  users: any[]
  audit?: any
  procedures?: any[]
  manuals?: any[]
  registers?: any[]
}

export default function AuditForm({ users, audit, procedures = [], manuals = [], registers = [] }: AuditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState(audit?.status || "not_started")
  const [hasGeneratedNextAudit, setHasGeneratedNextAudit] = useState(audit?.hasGeneratedNextAudit || false)
  
  // Get selected document IDs from audit
  const selectedDocuments = audit?.auditDocuments || []
  const selectedProcedures = selectedDocuments
    .filter((doc: any) => doc.docType === "procedure")
    .map((doc: any) => doc.docId)
  const selectedManuals = selectedDocuments
    .filter((doc: any) => doc.docType === "manual")
    .map((doc: any) => doc.docId)
  const selectedRegisters = selectedDocuments
    .filter((doc: any) => doc.docType === "register")
    .map((doc: any) => doc.docId)

  // Auto-set status to in_progress if actual start date is today or earlier and not completed
  useEffect(() => {
    const actualStartInput = document.getElementById("actualStartDate") as HTMLInputElement
    if (actualStartInput) {
      const handleActualStartChange = () => {
        if (actualStartInput.value && status !== "completed") {
          const today = new Date()
          const actual = new Date(actualStartInput.value)
          today.setHours(0,0,0,0)
          actual.setHours(0,0,0,0)
          if (actual <= today) {
            setStatus("in_progress")
          }
        }
      }
      actualStartInput.addEventListener("change", handleActualStartChange)
      return () => {
        actualStartInput.removeEventListener("change", handleActualStartChange)
      }
    }
  }, [status])

  // Update status when dateCompleted changes
  useEffect(() => {
    const dateCompletedInput = document.getElementById("dateCompleted") as HTMLInputElement
    if (dateCompletedInput) {
      const handleDateCompletedChange = () => {
        if (dateCompletedInput.value) {
          setStatus("completed")
        }
      }
      dateCompletedInput.addEventListener("change", handleDateCompletedChange)
      return () => {
        dateCompletedInput.removeEventListener("change", handleDateCompletedChange)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    // Add status to form data
    formData.append("status", status)
    
    try {
      let result
      
      if (audit) {
        result = await updateAudit(audit.id, formData)
      } else {
        result = await createAudit(formData)
      }
      
      if (result.success) {
        toast({
          title: "Success",
          description: audit ? "Audit updated successfully" : "Audit created successfully",
        })
        router.push("/audit-schedule")
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save audit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving audit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for input fields
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // Use a consistent format that works on both server and client
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date for input:", error);
      return "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md shadow-sm relative">
      {isSubmitting && <Loader overlay message={audit ? 'Saving changes...' : 'Saving audit...'} />}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={audit?.title || ""} 
          placeholder="Name of items to be audited"
          required 
          className="mt-1"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Document(s) to audit</h3>
        
        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Procedures</h4>
          <div className="space-y-2">
            {procedures.length === 0 ? (
              <div className="text-gray-500">No procedures available.</div>
            ) : (
              procedures.map((procedure) => (
              <div key={procedure.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`procedure-${procedure.id}`} 
                  name="procedures" 
                  value={procedure.id}
                  defaultChecked={selectedProcedures.includes(procedure.id)}
                />
                  <Label htmlFor={`procedure-${procedure.id}`}>{procedure.title}{procedure.category ? ` (${procedure.category.title})` : ''}</Label>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Manuals</h4>
          <div className="space-y-2">
            {manuals.length === 0 ? (
              <div className="text-gray-500">No manuals available.</div>
            ) : (
              manuals.map((manual) => (
              <div key={manual.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`manual-${manual.id}`} 
                  name="manuals" 
                  value={manual.id}
                  defaultChecked={selectedManuals.includes(manual.id)}
                />
                  <Label htmlFor={`manual-${manual.id}`}>{manual.title}{manual.category ? ` (${manual.category.title})` : ''}</Label>
              </div>
              ))
            )}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Registers</h4>
          <div className="space-y-2">
            {registers.length === 0 ? (
              <div className="text-gray-500">No registers available.</div>
            ) : (
              registers.map((register) => (
              <div key={register.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`register-${register.id}`} 
                  name="registers" 
                  value={register.id}
                  defaultChecked={selectedRegisters.includes(register.id)}
                />
                  <Label htmlFor={`register-${register.id}`}>{register.title}{register.category ? ` (${register.category.title})` : ''}</Label>
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Auditor</h3>
        
        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">Internal auditor</h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`auditor-${user.id}`} 
                  name="auditorId" 
                  value={user.id}
                  defaultChecked={audit?.auditorId === user.id}
                />
                <Label htmlFor={`auditor-${user.id}`}>{user.name} ({user.email})</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border p-4 mb-4">
          <h4 className="font-medium mb-2">External/other auditor</h4>
          <Input 
            id="externalAuditor" 
            name="externalAuditor" 
            defaultValue={audit?.externalAuditor || ""} 
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="plannedStartDate">Planned start date</Label>
          <Input 
            id="plannedStartDate" 
            name="plannedStartDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.plannedStartDate) || formatDateForInput(new Date().toISOString())} 
            required 
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="actualStartDate">Actual start date</Label>
          <Input 
            id="actualStartDate" 
            name="actualStartDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.actualStartDate)} 
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="followUpDate">Follow up date</Label>
          <Input 
            id="followUpDate" 
            name="followUpDate" 
            type="date" 
            defaultValue={formatDateForInput(audit?.followUpDate)} 
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Closure options</h3>
        <div>
          <Label htmlFor="dateCompleted">Date Completed</Label>
          <Input 
            id="dateCompleted" 
            name="dateCompleted" 
            type="date" 
            defaultValue={formatDateForInput(audit?.dateCompleted)} 
            className="mt-1"
          />
        </div>
        
        <div className="mt-4">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={status} 
            onValueChange={setStatus}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="createNextAudit" 
          name="createNextAudit" 
          defaultChecked={audit?.createNextAudit || false}
          disabled={hasGeneratedNextAudit && status === "completed"}
        />
        <Label htmlFor="createNextAudit">Create the next audit job</Label>
        {hasGeneratedNextAudit && status === "completed" && (
          <span className="text-sm text-yellow-600 ml-2">A next audit has already been generated for this audit.</span>
        )}
      </div>

      <div>
        <Label htmlFor="nextAuditDate">Next audit start date</Label>
        <Input 
          id="nextAuditDate" 
          name="nextAuditDate" 
          type="date" 
          defaultValue={formatDateForInput(audit?.nextAuditDate)} 
          className="mt-1"
        />
      </div>

      <div>
        <h3 className="font-medium mb-2">Documents</h3>
        {audit ? (
          <AuditFileUpload auditId={audit.id} existingDocuments={audit.auditDocuments} />
        ) : (
          <div className="border p-4 text-gray-500">
            Documents can only be uploaded against existing items. Once you have saved this new item then you will be able to upload documents.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/audit-schedule")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader size="sm" ariaLabel="Saving..." /> : audit ? "Save Changes" : "Save"}
        </Button>
      </div>
    </form>
  )
}