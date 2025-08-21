// app/training/new/page.tsx

import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { getSkills } from "../../actions/training-actions"
import { getUser, canWrite } from "@/lib/auth"
import { redirect } from "next/navigation"
import EmployeeForm from "../employee-form"

export const metadata = {
  title: "New Employee | Business Smart Suite",
  description: "Create a new employee in the Business Smart Suite Portal",
}



export default function NewEmployeePageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading new employee..." />}>
      <NewEmployeePage />
    </Suspense>
  )
}

async function NewEmployeePage() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  // Determine user permissions for training system
  const canEdit = await canWrite("training")

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