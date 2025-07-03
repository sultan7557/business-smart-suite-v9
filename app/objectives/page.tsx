import { getObjectives } from "@/app/actions/objective-actions"
import { hasPermission } from "@/lib/auth"
import ObjectivesClient from "./objectives-client"
import { toggleShowArchivedView } from "@/app/actions/objective-actions"

export default async function ObjectivesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const canEdit = await hasPermission("write") 
  const canDelete = await hasPermission("delete")
  
  // Await searchParams to resolve the Promise
  const sp = await searchParams;
  const showArchived = sp.showArchived === "true";
  
  // Fetch open objectives
  const openResult = await getObjectives(showArchived, false)
  const completedResult = await getObjectives(showArchived, true)
  
  return (
    <ObjectivesClient
      openObjectives={openResult.success ? openResult.data : []}
      completedObjectives={completedResult.success ? completedResult.data : []}
      canEdit={canEdit}
      canDelete={canDelete}
      showArchived={showArchived}
      toggleShowArchived={toggleShowArchivedView}
    />
  )
}