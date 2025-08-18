// app/training/training-client.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Printer, Plus, Users, GraduationCap, X, User, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { generateTrainingMatrix, unarchiveEmployee } from "../actions/training-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader } from '@/components/ui/loader'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  const [scrollPosition, setScrollPosition] = useState(0)
  
  // Filter employees based on filter text
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.surname}`.toLowerCase()
    const matchesFilter = 
      fullName.includes(filterText.toLowerCase()) ||
      employee.occupation.toLowerCase().includes(filterText.toLowerCase()) ||
      employee.department.toLowerCase().includes(filterText.toLowerCase())
    
    return matchesFilter && (showArchived || !employee.archived)
  })

  // Get unique skills/courses for column headers
  const uniqueSkills = skills || []
  
  // Helper function to get completion date for a specific skill
  const getCompletionDate = (employee: any, skillId: string) => {
    const employeeSkill = employee.employeeSkills?.find((es: any) => es.skillId === skillId)
    return employeeSkill?.dateCompleted ? new Date(employeeSkill.dateCompleted) : null
  }

  // Helper function to format completion date
  const formatCompletionDate = (date: Date | null) => {
    if (!date) return "Not completed"
    return date.toLocaleDateString()
  }

  // Helper function to get completion status for styling
  const getCompletionStatus = (date: Date | null) => {
    if (!date) return "not-completed"
    const daysSinceCompletion = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceCompletion <= 30) return "recent"
    if (daysSinceCompletion <= 90) return "moderate"
    return "old"
  }

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('training-table-container')
    if (container) {
      const scrollAmount = 300 // Scroll by 300px
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
      setScrollPosition(newPosition)
    }
  }

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
      const blob = new Blob([result.data!.buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.data!.filename || 'Training_Matrix.xlsx'
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
    <TooltipProvider>
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

      {/* Horizontal Scroll Controls */}
      {uniqueSkills.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              {uniqueSkills.length} Course{uniqueSkills.length !== 1 ? 's' : ''} Available
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScroll('left')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScroll('right')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Training Statistics */}
      {uniqueSkills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueSkills.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{filteredEmployees.filter(e => !e.archived).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Mandatory Courses</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueSkills.filter(s => s.mandatory).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Printer className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(() => {
                    const totalPossible = filteredEmployees.filter(e => !e.archived).length * uniqueSkills.length;
                    const totalCompleted = filteredEmployees.filter(e => !e.archived).reduce((acc, emp) => {
                      return acc + (emp.employeeSkills?.length || 0);
                    }, 0);
                    return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
                  })()}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="border rounded-md overflow-hidden">
        <div 
          id="training-table-container"
          className="overflow-x-auto training-table-container"
          style={{ 
            maxHeight: '70vh'
          }}
        >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              {/* Fixed columns */}
              <th className="sticky-left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] border-r border-gray-200">
                Employee
              </th>
              <th className="sticky-left-200 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] border-r border-gray-200">
                Occupation
              </th>
              <th className="sticky-left-350 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] border-r border-gray-200">
                Department
              </th>
              
              {/* Dynamic course columns */}
              {uniqueSkills.map((skill, index) => (
                <th 
                  key={skill.id} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] bg-gray-50 border-r border-gray-200"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{skill.name}</span>
                    {skill.mandatory && (
                      <span className="text-xs text-red-600 font-medium">Mandatory</span>
                    )}
                    {skill.frequencyDays > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        {skill.frequencyDays} days
                      </span>
                    )}
                  </div>
                </th>
              ))}
              
              {/* Actions column */}
              <th className="sticky-right-0 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] border-l border-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {typeof employees === 'undefined' ? (
              <tr>
                <td colSpan={5 + uniqueSkills.length} className="px-6 py-4">
                  <div className="py-8 flex justify-center">
                    <Loader size="lg" message="Loading employees..." />
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={5 + uniqueSkills.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className={employee.archived ? "bg-gray-100" : "hover:bg-gray-50"}>
                  {/* Fixed columns */}
                  <td className="sticky-left-0 bg-white px-6 py-4 whitespace-nowrap min-w-[200px] border-r border-gray-200">
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
                  <td className="sticky-left-200 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[150px] border-r border-gray-200">
                    {employee.occupation}
                  </td>
                  <td className="sticky-left-350 bg-white px-6 py-4 whitespace-nowrap text-sm text-gray-500 min-w-[150px] border-r border-gray-200">
                    {employee.department}
                  </td>
                  
                                      {/* Dynamic course columns */}
                    {uniqueSkills.map((skill) => {
                      const completionDate = getCompletionDate(employee, skill.id)
                      const status = getCompletionStatus(completionDate)
                      
                      return (
                        <td key={skill.id} className="px-6 py-4 whitespace-nowrap text-sm min-w-[180px] border-r border-gray-200">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium completion-status-${status} cursor-help`}>
                                  {formatCompletionDate(completionDate)}
                                  {completionDate && (
                                    <Info className="h-3 w-3 ml-1" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <p className="font-medium">{skill.name}</p>
                                  {completionDate ? (
                                    <p>Completed: {completionDate.toLocaleDateString()}</p>
                                  ) : (
                                    <p>Not completed</p>
                                  )}
                                  {skill.mandatory && (
                                    <p className="text-red-600 text-xs mt-1">Mandatory course</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      )
                    })}
                  
                  {/* Actions column */}
                  <td className="sticky-right-0 bg-white px-6 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px] border-l border-gray-200">
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
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      
      {/* Back to Registers Button */}
      <div className="flex justify-end mt-8">
        <Button asChild variant="outline">
          <Link href="/registers">Back to Registers</Link>
        </Button>
      </div>
      </div>
    </TooltipProvider>
  )
}