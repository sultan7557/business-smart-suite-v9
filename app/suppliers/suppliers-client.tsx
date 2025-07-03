// app/suppliers/suppliers-client.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Printer, Plus, Archive, Users, Calendar, Pencil, Trash, FileText, Truck, Settings, MoreHorizontal } from 'lucide-react'
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { archiveSupplier, unarchiveSupplier, addSupplierVersion, deleteSupplierVersion, deleteSupplier } from "../actions/supplier-actions"
import { Loader } from '@/components/ui/loader'

interface SuppliersClientProps {
  suppliers: any[]
  versions: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function SuppliersClient({
  suppliers,
  versions,
  canEdit,
  canDelete
}: SuppliersClientProps) {
  const router = useRouter()
  const [filterText, setFilterText] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [showRoleRestrictions, setShowRoleRestrictions] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [newVersion, setNewVersion] = useState({
    date: "",
    details: "",
    updatedBy: ""
  })
  
  // Add local loading states for archive, unarchive, delete, and version actions
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  const [isVersionSubmitting, setIsVersionSubmitting] = useState(false)
  
  // Filter suppliers based on filter text and archived status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesFilter = 
      supplier.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      supplier.provisionOf?.toLowerCase().includes(filterText.toLowerCase()) ||
      (supplier.certifications && supplier.certifications.toLowerCase().includes(filterText.toLowerCase())) ||
      (supplier.contactName && supplier.contactName.toLowerCase().includes(filterText.toLowerCase())) ||
      (supplier.contactNumber && supplier.contactNumber.toLowerCase().includes(filterText.toLowerCase()))
    
    return matchesFilter && (showArchived ? true : !supplier.archived)
  })
  
  const handlePrintSuppliersList = () => {
    // Open print dialog
    window.print()
  }
  
  const getRiskLevelColor = (level: number) => {
    if (level <= 3) return "bg-green-500"
    if (level <= 6) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  const getResidualRiskColor = (level: number) => {
    if (level <= 2) return "bg-green-500"
    if (level <= 4) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  const calculateRiskLevel = (likelihood: number, severity: number) => {
    return likelihood * severity
  }
  
  const handleArchiveSupplier = async (id: string, isArchived: boolean) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: isArchived ? 'unarchive' : 'archive' }))
      const result = isArchived 
        ? await unarchiveSupplier(id)
        : await archiveSupplier(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      
      if (result.success) {
        toast(`Supplier ${isArchived ? 'unarchived' : 'archived'} successfully`)
        router.refresh()
      } else {
        throw new Error(result.error || `Failed to ${isArchived ? 'unarchive' : 'archive'} supplier`)
      }
    } catch (error: any) {
      toast(error.message || "An error occurred")
    }
  }
  
  const handleAddVersion = async () => {
    try {
      setIsVersionSubmitting(true)
      if (!newVersion.date || !newVersion.details || !newVersion.updatedBy) {
        toast("Please fill in all fields")
        return
      }
      
      const result = await addSupplierVersion(newVersion)
      
      if (result.success) {
        toast("Version added successfully")
        setNewVersion({
          date: "",
          details: "",
          updatedBy: ""
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to add version")
      }
      setIsVersionSubmitting(false)
    } catch (error: any) {
      toast(error.message || "An error occurred")
      setIsVersionSubmitting(false)
    }
  }
  
  const handleDeleteVersion = async (id: string) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'deleteVersion' }))
      if (confirm("Are you sure you want to delete this version?")) {
        const result = await deleteSupplierVersion(id)
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
        
        if (result.success) {
          toast("Version deleted successfully")
          router.refresh()
        } else {
          throw new Error(result.error || "Failed to delete version")
        }
      } else {
        setLoadingAction((prev) => ({ ...prev, [id]: null }))
      }
    } catch (error: any) {
      toast(error.message || "An error occurred")
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
    }
  }

  const handleDeleteSupplier = async (id: string) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteSupplier(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      
      if (result.success) {
        toast("Supplier deleted successfully")
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to delete supplier")
      }
    } catch (error: any) {
      toast(error.message || "An error occurred")
    }
  }

  return (
    <div className="space-y-4 pt-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Truck className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Suppliers</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePrintSuppliersList}>
            <Printer className="h-4 w-4 mr-2" />
            Print suppliers list
          </Button>
          {canEdit && (
            <Button onClick={() => router.push("/suppliers/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Supplier
            </Button>
          )}
          <Button 
            variant={showArchived ? "default" : "outline"} 
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? "Hide archived" : "Show archived"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowRoleRestrictions(!showRoleRestrictions)}>
                <Users className="h-4 w-4 mr-2" />
                {showRoleRestrictions ? "Hide" : "Show"} Role Restrictions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowVersionHistory(!showVersionHistory)}>
                <Calendar className="h-4 w-4 mr-2" />
                {showVersionHistory ? "Hide" : "Show"} Version History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {showRoleRestrictions && (
        <div className="border rounded-md p-4 bg-gray-100">
          <p>There are currently no permissions available for this system; please contact your system administrator to set them up.</p>
        </div>
      )}
      
      {showVersionHistory && (
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brief details of amendment(s)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated by</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {versions.map((version) => (
                <tr key={version.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{version.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(version.date), "dd/MM/yyyy")}</td>
                  <td className="px-6 py-4">{version.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{version.updatedBy}</td>
                  <td className="px-6 py-4 text-right">
                    {canDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteVersion(version.id)}
                        disabled={!!loadingAction[version.id]}
                      >
                        {loadingAction[version.id] === 'deleteVersion' ? <Loader size="sm" ariaLabel="Deleting..." /> : 'Delete'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 border-t">
            <h3 className="text-lg font-medium mb-4">Add New Version</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <Input
                  type="date"
                  value={newVersion.date}
                  onChange={(e) => setNewVersion({ ...newVersion, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Details</label>
                <Input
                  type="text"
                  value={newVersion.details}
                  onChange={(e) => setNewVersion({ ...newVersion, details: e.target.value })}
                  className="mt-1"
                  placeholder="Brief details of amendment(s)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Updated by</label>
                <Input
                  type="text"
                  value={newVersion.updatedBy}
                  onChange={(e) => setNewVersion({ ...newVersion, updatedBy: e.target.value })}
                  className="mt-1"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleAddVersion} disabled={isVersionSubmitting}>
                {isVersionSubmitting ? <Loader size="sm" ariaLabel="Adding..." /> : 'Add Version'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Filter suppliers list..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <Button>
          Filter suppliers
        </Button>
      </div>
      
      <div className="border rounded-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provision of</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Controls and Recommendations</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Residual Risk</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {typeof suppliers === 'undefined' ? (
              <tr><td colSpan={9}><div className="py-8 flex justify-center"><Loader size="lg" message="Loading suppliers..." /></div></td></tr>
            ) : filteredSuppliers.map((supplier) => {
              const riskLevel = calculateRiskLevel(supplier.riskLikelihood, supplier.riskSeverity)
              const residualRiskLevel = calculateRiskLevel(supplier.residualLikelihood, supplier.residualSeverity)
              
              return (
                <tr key={supplier.id} className={supplier.archived ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4">
                    <div className="font-medium">{supplier.name}</div>
                    <div className="text-sm text-gray-500 whitespace-pre-line">{supplier.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line">{supplier.provisionOf}</td>
                  <td className="px-6 py-4 whitespace-pre-line">{supplier.certifications}</td>
                  <td className="px-6 py-4">
                    <div>{supplier.contactName}</div>
                    <div>{supplier.contactNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {supplier.dateAdded ? format(new Date(supplier.dateAdded), "dd/MMM/yyyy") : ""}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`${getRiskLevelColor(riskLevel)} text-white text-center font-bold rounded-md p-2`}>
                      {riskLevel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line">{supplier.controlsRecommendations}</td>
                  <td className="px-6 py-4">
                    <div className={`${getResidualRiskColor(residualRiskLevel)} text-white text-center font-bold rounded-md p-2`}>
                      {residualRiskLevel}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/suppliers/${supplier.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => handleArchiveSupplier(supplier.id, supplier.archived)} disabled={!!loadingAction[supplier.id]}>
                            {loadingAction[supplier.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : loadingAction[supplier.id] === 'unarchive' ? <Loader size="sm" ariaLabel="Unarchiving..." /> : <Archive className="mr-2 h-4 w-4" />}
                            <span>{supplier.archived ? "Unarchive" : "Archive"}</span>
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this supplier?")) {
                                  handleDeleteSupplier(supplier.id)
                              }
                            }}
                            disabled={!!loadingAction[supplier.id]}
                          >
                            {loadingAction[supplier.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash className="mr-2 h-4 w-4" />}
                            <span>Delete</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
        </Button>
      </div>
    </div>
  )
}