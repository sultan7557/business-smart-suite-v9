// app/training/training-client.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Printer, Plus, Users, GraduationCap, X, User } from 'lucide-react'
import { generateTrainingMatrix, unarchiveEmployee } from "../actions/training-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader } from '@/components/ui/loader'

interface TrainingClientProps {
  employees: any[]
  skills: any[]
  canEdit: boolean
  canDelete: boolean
}

export default function TrainingClient({
  employees,
  skills,
  canEdit,
  canDelete
}: TrainingClientProps) {
  const router = useRouter()
  const [filterText, setFilterText] = useState("")
  const [showArchived, setShowArchived] = useState(false)
  const [showRoleRestrictions, setShowRoleRestrictions] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [loadingAction, setLoadingAction] = useState<{ [id: string]: string | null }>({})
  
  // Filter employees based on filter text
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.surname}`.toLowerCase()
    const matchesFilter = 
      fullName.includes(filterText.toLowerCase()) ||
      employee.occupation.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.department.toLowerCase().includes(filterText.toLowerCase())
    
    return matchesFilter && (showArchived || !employee.archived)
  })
  
  const handlePrintTrainingMatrix = async () => {
    try {
      setIsExporting(true)
      setLoadingAction((prev) => ({ ...prev, export: 'export' }))
      const result = await generateTrainingMatrix()
      setLoadingAction((prev) => ({ ...prev, export: null }))
      
      if (!result.success) {
        throw new Error(result.error || "Failed to generate training matrix")
      }
      
      // Convert array buffer to blob
      const blob = new Blob([result.data.buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.data?.filename || 'Training_Matrix.xlsx'
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Training matrix exported successfully",
      })
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, export: null }))
      console.error("Error exporting training matrix:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while exporting training matrix",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleUnarchive = async (id: string) => {
    try {
      setLoadingAction((prev) => ({ ...prev, [id]: 'unarchive' }))
      const result = await unarchiveEmployee(id)
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      if (!result.success) {
        throw new Error(result.error || "Failed to reinstate employee")
      }
      toast({
        title: "Success",
        description: "Employee reinstated successfully",
      })
      router.refresh() // Refresh the page to update the employees list
    } catch (error: any) {
      setLoadingAction((prev) => ({ ...prev, [id]: null }))
      console.error("Error reinstating employee:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred while reinstating employee",
        variant: "destructive",
      })
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Employees</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePrintTrainingMatrix}
            disabled={isExporting}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Print training matrix"}
          </Button>
          <Button 
            variant={showRoleRestrictions ? "default" : "outline"} 
            onClick={() => setShowRoleRestrictions(!showRoleRestrictions)}
          >
            <Users className="h-4 w-4 mr-2" />
            Role restrictions
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/training/skills")}
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Manage skills
          </Button>
          {canEdit && (
            <Button onClick={() => router.push("/training/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New employee
            </Button>
          )}
          <Button 
            variant={showArchived ? "default" : "outline"} 
            onClick={() => setShowArchived(!showArchived)}
          >
            <X className="h-4 w-4 mr-2" />
            {showArchived ? "Hide archived" : "Show archived"}
          </Button>
        </div>
      </div>
      
      {showRoleRestrictions && (
        <div className="border rounded-md p-4 bg-gray-100">
          <p>There are currently no permissions available for this system; please contact your system administrator to set them up.</p>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Filter employees list..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <Button>
          Filter employees
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Courses</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {typeof employees === 'undefined' ? (
              <tr><td colSpan={5}><div className="py-8 flex justify-center"><Loader size="lg" message="Loading employees..." /></div></td></tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
                // Get completed courses (skills)
                const completedSkills = (employee.employeeSkills || []).map((es: { skill: { name: string }, dateCompleted: string }) => ({
                  name: es.skill?.name,
                  dateCompleted: es.dateCompleted,
                })).filter((s) => !!s.name)
                const maxVisible = 3
                const visibleSkills = completedSkills.slice(0, maxVisible)
                const hiddenSkills = completedSkills.slice(maxVisible)
                return (
                <tr key={employee.id} className={employee.archived ? "bg-gray-100" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {employee.profilePicture ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={employee.profilePicture || "/placeholder.svg"}
                            alt={`${employee.firstName} ${employee.surname}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.firstName} {employee.surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.occupation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1 items-center">
                        {visibleSkills.map((skill: { name: string; dateCompleted: string }, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium" title={skill.dateCompleted ? `Completed: ${new Date(skill.dateCompleted).toLocaleDateString()}` : undefined}>
                            {skill.name}
                          </span>
                        ))}
                        {hiddenSkills.length > 0 && (
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium" title={hiddenSkills.map((s: { name: string; dateCompleted: string }) => `${s.name}${s.dateCompleted ? ` (Completed: ${new Date(s.dateCompleted).toLocaleDateString()})` : ''}`).join(', ')}>
                            +{hiddenSkills.length} more
                          </span>
                        )}
                        {completedSkills.length === 0 && <span className="text-gray-400">None</span>}
                      </div>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => router.push(`/training/${employee.id}`)}
                      disabled={!!loadingAction[employee.id]}
                    >
                      {loadingAction[employee.id] === 'manage' ? <Loader size="sm" ariaLabel="Managing..." /> : 'Manage'}
                    </Button>
                    {employee.archived && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUnarchive(employee.id)}
                        disabled={!!loadingAction[employee.id]}
                      >
                        {loadingAction[employee.id] === 'unarchive' ? <Loader size="sm" ariaLabel="Reinstating..." /> : 'Re-instate'}
                      </Button>
                    )}
                  </td>
                </tr>
                )
              })
            )}
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