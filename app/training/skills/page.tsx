// app/training/skills/page.tsx

import { getSkills } from "../../actions/training-actions"
import { getUser, canWrite, canDelete } from "@/lib/auth"
import { redirect } from "next/navigation"
import SkillsManagement from "./skills-management"

export const metadata = {
  title: "Manage Skills | Business Smart Suite",
  description: "Manage skills in the Business Smart Suite Portal",
}

async function SkillsPage() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  // Determine user permissions for training system
  const canEdit = await canWrite("training")
  const canDeletePermission = await canDelete("training")

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
        canDelete={canDeletePermission}
      />
    </div>
  )
}

export default SkillsPage