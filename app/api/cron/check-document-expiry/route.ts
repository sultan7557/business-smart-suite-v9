import { NextResponse } from "next/server"
import { checkAndSendExpiryNotifications } from "@/app/actions/supplier-document-actions"

export async function GET() {
  try {
    // This endpoint should be called by a cron job (e.g., every hour)
    const result = await checkAndSendExpiryNotifications()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Processed ${result.notificationsSent} notifications`,
        notificationsSent: result.notificationsSent
      })
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to process notifications" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in document expiry check cron:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggering
export async function POST() {
  return GET()
}

