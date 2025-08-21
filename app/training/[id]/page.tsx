// app/training/[id]/page.tsx

import { getEmployee, getSkills } from "../../actions/training-actions"
import { getUser, canWrite, canDelete } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeDetail from "../employee-detail"

export const metadata = {
  title: "Employee Details | Business Smart Suite",
  description: "View and manage employee details in the Business Smart Suite Portal",
}

interface EmployeeDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  // Determine user permissions for training system
  const canEdit = await canWrite("training")
  const canDeletePermission = await canDelete("training")

  // Await params before accessing its properties
  const { id } = await params;
  
  const employeeResult = await getEmployee(id)
  const skillsResult = await getSkills()
  
  if (!employeeResult.success) {
    redirect("/training")
  }
  
  const employee = employeeResult.data
  const skills = skillsResult.success ? skillsResult.data : []
  
  return (
    <div className="container mx-auto py-6">
      <EmployeeDetail 
        employee={employee} 
        skills={skills}
        canEdit={canEdit}
        canDelete={canDeletePermission}
      />
    </div>
  )
}