import { hasPermission } from "@/lib/auth"
import { getMaintenanceItems, getSubCategories, toggleShowArchivedView } from "@/app/actions/maintenance-actions"
import MaintenanceClient from "./maintenance-client"
import { prisma } from "@/lib/prisma"

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const canEdit = await hasPermission("write")
  const canDelete = await hasPermission("delete")
  
  // Await searchParams to resolve the Promise
  const sp = await searchParams;
  const showArchived = sp.showArchived === "true"
  
  // Fetch open maintenance items
  const openMaintenanceResult = await getMaintenanceItems(showArchived, false, "Maintenance")
  const openMaintenanceItems = openMaintenanceResult.success ? openMaintenanceResult.data : []

  // Fetch closed maintenance items
  const closedMaintenanceResult = await getMaintenanceItems(showArchived, true, "Maintenance")
  const closedMaintenanceItems = closedMaintenanceResult.success ? closedMaintenanceResult.data : []

  // Fetch open calibration items
  const openCalibrationResult = await getMaintenanceItems(showArchived, false, "Calibration")
  const openCalibrationItems = openCalibrationResult.success ? openCalibrationResult.data : []

  // Fetch closed calibration items
  const closedCalibrationResult = await getMaintenanceItems(showArchived, true, "Calibration")
  const closedCalibrationItems = closedCalibrationResult.success ? closedCalibrationResult.data : []

  // Fetch subcategories
  const subCategoriesResult = await getSubCategories()
  const subCategories = subCategoriesResult.success ? subCategoriesResult.data : []

  // Fetch users for allocation
  const users = await prisma.user.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  }) ?? []

  return (
    <div className="p-4">
      <MaintenanceClient 
        maintenanceItems={openMaintenanceItems ?? []} 
        closedMaintenanceItems={closedMaintenanceItems ?? []}
        calibrationItems={openCalibrationItems ?? []}
        closedCalibrationItems={closedCalibrationItems ?? []}
        users={users}
        subCategories={subCategories ?? []}
        canEdit={canEdit} 
        canDelete={canDelete}
        showArchived={showArchived}
        toggleShowArchived={toggleShowArchivedView}
      />
    </div>
  )
}