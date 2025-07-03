// app/training/skills/page.tsx

import { getSkills } from "../../actions/training-actions"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import SkillsManagement from "./skills-management"

export const metadata = {
  title: "Manage Skills | Business Smart Suite",
  description: "Manage skills in the Business Smart Suite Portal",
}

export default async function SkillsPage() {
    const user = await getUser()
    if (!user) {
      redirect("/login")
    }
    
    const canEdit = user.role === "admin" || user.role === "manager"
    const canDelete = user.role === "admin"
  
  if (!canEdit) {
    redirect("/training")
  }
  
  const skillsResult = await getSkills()
  const skills = skillsResult.success ? skillsResult.data : []
  
  return (
    <div className="container mx-auto py-6">
      <SkillsManagement 
        skills={skills}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}