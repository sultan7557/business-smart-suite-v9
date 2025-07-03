import { type NextRequest, NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    await logout()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}

