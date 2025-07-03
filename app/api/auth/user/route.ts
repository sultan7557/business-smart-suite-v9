import { type NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "An error occurred while fetching user" }, { status: 500 })
  }
}

