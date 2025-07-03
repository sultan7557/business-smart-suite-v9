"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Eye, Check, Printer, History, Users, FileText, Archive, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { archiveLegalRegister, unarchiveLegalRegister, deleteLegalRegister, approveLegalRegister } from "../actions/legal-register-actions"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader } from '@/components/ui/loader'

interface LegalRegisterClientProps {
  legalRegisters: any[]
  unapprovedRegisters: any[]
  archivedRegisters: any[]
  users: any[]
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
}

export default function LegalRegisterClient({
  legalRegisters,
  unapprovedRegisters,
  archivedRegisters,
  users,
  canEdit,
  canDelete,
  canApprove,
}: LegalRegisterClientProps) {
  const [sectionFilter, setSectionFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  const [reviewedFilter, setReviewedFilter] = useState("all")
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [showRoleRestrictions, setShowRoleRestrictions] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})

  // Get unique sections for filter
  const sections = Array.from(new Set(legalRegisters.map((item) => item.section)))

  // Get unique compliance ratings for filter
  const complianceRatings = Array.from(new Set(legalRegisters.map((item) => item.complianceRating)))

  // Filter legal registers based on selected filters
  const filteredLegalRegisters = legalRegisters.filter((item) => {
    if (sectionFilter !== "all" && item.section !== sectionFilter) return false
    if (complianceFilter !== "all" && item.complianceRating !== complianceFilter) return false
    if (reviewedFilter === "reviewed" && !item.reviewed) return false
    if (reviewedFilter === "not-reviewed" && item.reviewed) return false
    if (selectedRegions.length > 0 && !selectedRegions.some(region => item.regions.includes(region))) return false
    return true
  })

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this legal register item?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'archive' }))
      const result = await archiveLegalRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Legal register item archived successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to archive legal register item",
          variant: "destructive",
        })
      }
    }
  }

  const handleUnarchive = async (id: string) => {
    if (confirm("Are you sure you want to unarchive this legal register item?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'unarchive' }))
      const result = await unarchiveLegalRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Legal register item unarchived successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to unarchive legal register item",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this legal register item? This action cannot be undone.")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'delete' }))
      const result = await deleteLegalRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Legal register item deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete legal register item",
          variant: "destructive",
        })
      }
    }
  }

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this legal register item?")) {
      setLoadingAction((prev) => ({ ...prev, [id]: 'approve' }))
      const result = await approveLegalRegister(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (result.success) {
        toast({
          title: "Success",
          description: "Legal register item approved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve legal register item",
          variant: "destructive",
        })
      }
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    )
  }
  
  const resetFilters = () => {
    setSectionFilter("all")
    setComplianceFilter("all")
    setReviewedFilter("all")
    setSelectedRegions([])
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Legal Register</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          {canEdit && (
            <Button asChild>
              <Link href="/legal-register/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Item
              </Link>
            </Button>
          )}

          <Dialog open={showRoleRestrictions} onOpenChange={setShowRoleRestrictions}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Role Restrictions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Current role restrictions</DialogTitle>
              </DialogHeader>
              <div className="bg-gray-100 p-4 rounded-md">
                <p>
                  There are currently no permissions available for this system. please contact your system administrator
                  to set them up.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                Version History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Version History</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Brief details of amendment(s)</TableHead>
                      <TableHead>Updated by</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>2</TableCell>
                      <TableCell>31/03/2023</TableCell>
                      <TableCell>New Legislation</TableCell>
                      <TableCell>Kul Bhullar</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>1</TableCell>
                      <TableCell>09/03/2022</TableCell>
                      <TableCell>Initial version</TableCell>
                      <TableCell>System</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <input type="date" className="w-full p-2 border rounded" />
                          </div>
                          <div className="flex-1">
                            <textarea className="w-full p-2 border rounded" placeholder="Details"></textarea>
                          </div>
                          <div className="flex-1">
                            <input type="text" className="w-full p-2 border rounded" placeholder="Updated by" />
                          </div>
                          <Button size="sm">add</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showReviews} onOpenChange={setShowReviews}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Reviews
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Reviews</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewed By</TableHead>
                      <TableHead>Details of review</TableHead>
                      <TableHead>Review date</TableHead>
                      <TableHead>Next review date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Kul Bhullar</TableCell>
                      <TableCell>Document has been reviewed and is current.</TableCell>
                      <TableCell>31/03/2023</TableCell>
                      <TableCell>29/03/2024</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kul Bhullar</TableCell>
                      <TableCell>Annual review</TableCell>
                      <TableCell>21/08/2023</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Kul Bhullar</TableCell>
                      <TableCell>No changes required</TableCell>
                      <TableCell>27/05/2024</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <input type="text" className="w-full p-2 border rounded" placeholder="Reviewer" />
                          </div>
                          <div className="flex-1">
                            <textarea className="w-full p-2 border rounded" placeholder="Details of review"></textarea>
                          </div>
                          <div className="flex-1">
                            <input type="date" className="w-full p-2 border rounded" />
                          </div>
                          <div className="flex-1">
                            <input type="date" className="w-full p-2 border rounded" />
                          </div>
                          <Button size="sm">Add</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Section filter</label>
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Section filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Sections --</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section} value={section}>
                  {section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Compliance filter</label>
          <Select value={complianceFilter} onValueChange={setComplianceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Compliance filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Compliance Ratings --</SelectItem>
              {complianceRatings.map((rating) => (
                <SelectItem key={rating} value={rating}>
                  {rating}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Reviewed filter</label>
          <Select value={reviewedFilter} onValueChange={setReviewedFilter}>
            <SelectTrigger>
              <SelectValue placeholder="-- Reviewed filter --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- All Items --</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="not-reviewed">Not Reviewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={resetFilters} variant="outline">
          Clear Filters
        </Button>
      </div>

      <div className="flex gap-2">
        {["England", "Wales", "Scotland", "Ireland", "Northern Ireland"].map((region) => (
          <div key={region} className="flex items-center gap-1">
            <input 
              type="checkbox" 
              id={`region-${region}`} 
              className="rounded" 
              checked={selectedRegions.includes(region)}
              onChange={() => toggleRegion(region)}
            />
            <label htmlFor={`region-${region}`}>{region}</label>
          </div>
        ))}
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Items</TabsTrigger>
          <TabsTrigger value="approval">
            Items Requiring Approval {unapprovedRegisters.length > 0 && `(${unapprovedRegisters.length})`}
          </TabsTrigger>
          <TabsTrigger value="archived">Archived Items</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Section</TableHead>
                  <TableHead>Legislation</TableHead>
                  <TableHead>Regulator</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Further Action</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLegalRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No legal register items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLegalRegisters.map((item) => (
                    <TableRow key={item.id} className={item.section === "Air" ? "bg-green-50" : ""}>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>
                        <Link href={`/legal-register/${item.id}`} className="text-blue-600 hover:underline">
                          {item.legislation}
                        </Link>
                      </TableCell>
                      <TableCell>{item.regulator}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.requirements}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.applicability}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.complianceRating === "A"
                              ? "outline"
                              : item.complianceRating === "C"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {item.complianceRating}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.furtherAction}</TableCell>
                      <TableCell>{item.reviewed ? format(new Date(item.reviewed), "dd-MMM-yyyy") : "Never"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {canEdit && (
                            <Button variant="ghost" size="icon" asChild disabled={!!loadingAction[item.id]}>
                              <Link href={`/legal-register/${item.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canEdit && (
                            <Button variant="ghost" size="icon" onClick={() => handleArchive(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'archive' ? <Loader size="sm" ariaLabel="Archiving..." /> : <Archive className="h-4 w-4" />}
                            </Button>
                          )}
                          {canApprove && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(item.id)}
                              disabled={item.approved || !!loadingAction[item.id]}
                            >
                              {loadingAction[item.id] === 'approve' ? <Loader size="sm" ariaLabel="Approving..." /> : <Check className="h-4 w-4" />}
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Section</TableHead>
                  <TableHead>Legislation</TableHead>
                  <TableHead>Regulator</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Further Action</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unapprovedRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No items requiring approval
                    </TableCell>
                  </TableRow>
                ) : (
                  unapprovedRegisters.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>
                        <Link href={`/legal-register/${item.id}`} className="text-blue-600 hover:underline">
                          {item.legislation}
                        </Link>
                      </TableCell>
                      <TableCell>{item.regulator}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.requirements}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.applicability}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.complianceRating === "A"
                              ? "outline"
                              : item.complianceRating === "C"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {item.complianceRating}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.furtherAction}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {canApprove && (
                            <Button variant="outline" size="sm" onClick={() => handleApprove(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'approve' ? <Loader size="sm" ariaLabel="Approving..." /> : <><Check className="h-4 w-4 mr-1" />Approve</>}
                            </Button>
                          )}
                          {canEdit && (
                            <Button variant="outline" size="sm" asChild disabled={!!loadingAction[item.id]}>
                              <Link href={`/legal-register/${item.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />Edit
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <><Trash2 className="h-4 w-4 mr-1" />Delete</>}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Section</TableHead>
                  <TableHead>Legislation</TableHead>
                  <TableHead>Regulator</TableHead>
                  <TableHead>Requirements</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Further Action</TableHead>
                  <TableHead>Reviewed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No archived legal register items found
                    </TableCell>
                  </TableRow>
                ) : (
                  archivedRegisters.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>
                        <Link href={`/legal-register/${item.id}`} className="text-blue-600 hover:underline">
                          {item.legislation}
                        </Link>
                      </TableCell>
                      <TableCell>{item.regulator}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.requirements}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.applicability}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.complianceRating === "A"
                              ? "outline"
                              : item.complianceRating === "C"
                                ? "secondary"
                                : "default"
                          }
                        >
                          {item.complianceRating}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.furtherAction}</TableCell>
                      <TableCell>{item.reviewed ? format(new Date(item.reviewed), "dd-MMM-yyyy") : "Never"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => handleUnarchive(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'unarchive' ? <Loader size="sm" ariaLabel="Unarchiving..." /> : <><RefreshCw className="h-4 w-4 mr-1" />Unarchive</>}
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)} disabled={!!loadingAction[item.id]}>
                              {loadingAction[item.id] === 'delete' ? <Loader size="sm" ariaLabel="Deleting..." /> : <><Trash2 className="h-4 w-4 mr-1" />Delete</>}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
        </Button>
      </div>
    </div>
  )
}