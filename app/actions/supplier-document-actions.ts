"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth"
import { sendDocumentExpiryNotification } from "@/lib/email"

export async function assignDocumentToUser(documentId: string, userId: string | null) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const document = await prisma.supplierDocument.update({
      where: { id: documentId },
      data: { 
        assignedUserId: userId,
        lastNotificationSent: null // Reset notification tracking
      },
      include: {
        supplier: true,
        assignedUser: true
      }
    })

    // If document is assigned to a user and has expiry date, send initial notification
    if (userId && document.expiryDate) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (assignedUser && assignedUser.email) {
        const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry > 0) {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const documentUrl = `${baseUrl}/suppliers/${document.supplierId}`
          
          await sendDocumentExpiryNotification(
            assignedUser.email,
            assignedUser.name,
            document.title,
            document.supplier.name,
            document.expiryDate,
            documentUrl,
            daysUntilExpiry
          )
        }
      }
    }

    // Don't revalidate the page immediately to avoid UI flicker
    // The local state update will handle the UI, and the next page load will show the correct data
    
    return { success: true, data: document }
  } catch (error) {
    console.error("Error assigning document:", error)
    return { success: false, error: "Failed to assign document" }
  }
}

export async function getUsersForAssignment() {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const users = await prisma.user.findMany({
      where: { 
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function checkAndSendExpiryNotifications() {
  try {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const fourteenDaysFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const oneDayFromNow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    // Get documents that need notifications
    const documentsNeedingNotifications = await prisma.supplierDocument.findMany({
      where: {
        assignedUserId: { not: null },
        expiryDate: { not: null },
        expiryDate: { lte: thirtyDaysFromNow }
      },
      include: {
        supplier: true,
        assignedUser: {
          include: {
            documentNotificationSettings: true
          }
        }
      }
    })

    let notificationsSent = 0

    for (const document of documentsNeedingNotifications) {
      if (!document.assignedUser || !document.expiryDate) continue

      const daysUntilExpiry = Math.ceil((document.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Skip if already expired
      if (daysUntilExpiry <= 0) continue

      // Check if notification should be sent based on days until expiry
      let shouldSendNotification = false
      let notificationDays = 0

      if (daysUntilExpiry <= 30 && daysUntilExpiry > 14) {
        notificationDays = 30
        shouldSendNotification = document.assignedUser.documentNotificationSettings?.notification30Days ?? true
      } else if (daysUntilExpiry <= 14 && daysUntilExpiry > 7) {
        notificationDays = 14
        shouldSendNotification = document.assignedUser.documentNotificationSettings?.notification14Days ?? true
      } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 1) {
        notificationDays = 7
        shouldSendNotification = document.assignedUser.documentNotificationSettings?.notification7Days ?? true
      } else if (daysUntilExpiry === 1) {
        notificationDays = 1
        shouldSendNotification = document.assignedUser.documentNotificationSettings?.notification1Day ?? true
      }

      // Check if notification was already sent for this period
      const lastNotification = document.lastNotificationSent
      const shouldSend = shouldSendNotification && 
        document.assignedUser.documentNotificationSettings?.emailEnabled !== false &&
        (!lastNotification || 
         (daysUntilExpiry === 30 && lastNotification < new Date(today.getTime() - 24 * 60 * 60 * 1000)) ||
         (daysUntilExpiry === 14 && lastNotification < new Date(today.getTime() - 24 * 60 * 60 * 1000)) ||
         (daysUntilExpiry === 7 && lastNotification < new Date(today.getTime() - 24 * 60 * 60 * 1000)) ||
         (daysUntilExpiry === 1 && lastNotification < new Date(today.getTime() - 12 * 60 * 60 * 1000)))

      if (shouldSend && document.assignedUser.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const documentUrl = `${baseUrl}/suppliers/${document.supplierId}`
        
        await sendDocumentExpiryNotification(
          document.assignedUser.email,
          document.assignedUser.name,
          document.title,
          document.supplier.name,
          document.expiryDate,
          documentUrl,
          daysUntilExpiry
        )

        // Update last notification sent
        await prisma.supplierDocument.update({
          where: { id: document.id },
          data: { lastNotificationSent: today }
        })

        notificationsSent++
      }
    }

    return { success: true, notificationsSent }
  } catch (error) {
    console.error("Error checking and sending expiry notifications:", error)
    return { success: false, error: "Failed to process notifications" }
  }
}

export async function updateNotificationSettings(userId: string, settings: {
  notification30Days: boolean
  notification14Days: boolean
  notification7Days: boolean
  notification1Day: boolean
  emailEnabled: boolean
}) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Users can only update their own settings
    if (user.id !== userId && user.role !== 'admin') {
      throw new Error("Unauthorized to update other user's settings")
    }

    const notificationSettings = await prisma.documentNotificationSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings
      }
    })

    return { success: true, data: notificationSettings }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return { success: false, error: "Failed to update notification settings" }
  }
}

export async function getNotificationSettings(userId: string) {
  try {
    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    // Users can only view their own settings
    if (user.id !== userId && user.role !== 'admin') {
      throw new Error("Unauthorized to view other user's settings")
    }

    const settings = await prisma.documentNotificationSettings.findUnique({
      where: { userId }
    })

    // Return default settings if none exist
    if (!settings) {
      return {
        success: true,
        data: {
          notification30Days: true,
          notification14Days: true,
          notification7Days: true,
          notification1Day: true,
          emailEnabled: true
        }
      }
    }

    return { success: true, data: settings }
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return { success: false, error: "Failed to fetch notification settings" }
  }
}
