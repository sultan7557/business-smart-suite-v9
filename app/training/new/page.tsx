// app/training/new/page.tsx

import { getSkills } from "../../actions/training-actions"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeForm from "../employee-form"

export const metadata = {
  title: "New Employee | Business Smart Suite",
  description: "Create a new employee in the Business Smart Suite Portal",
}



export default async function NewEmployeePage() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  
  const canEdit = user.role === "admin" || user.role === "manager"
  
  if (!canEdit) {
    redirect("/training")
  }
  
  const skillsResult = await getSkills()
  const skills = skillsResult.success ? skillsResult.data : []
  
  return (
    <div className="container mx-auto py-6">
      <EmployeeForm skills={skills} />
    </div>
  )
}