// app/training/page.tsx

import { Suspense } from "react"
import { Loader } from '@/components/ui/loader'
import { getEmployees, getSkills } from "../actions/training-actions"
import TrainingClient from "./training-client"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Training | Business Smart Suite",
  description: "Manage employee training in the Business Smart Portal",
}

export default function TrainingPageWrapper() {
  return (
    <Suspense fallback={<Loader overlay message="Loading training..." />}>
      <TrainingPage />
    </Suspense>
  )
}

async function TrainingPage() {
    const user = await getUser()
    if (!user) {
      redirect("/login")
    }
    
    const canEdit = user.role === "admin" || user.role === "manager"
    const canDelete = user.role === "admin"
  
  const employeesResult = await getEmployees(true)
  const skillsResult = await getSkills()
  
  const employees = employeesResult.success ? employeesResult.data : []
  const skills = skillsResult.success ? skillsResult.data : []
  
  return (
    <div className="container mx-auto py-6">
      <TrainingClient 
        employees={employees} 
        skills={skills}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}