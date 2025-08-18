import { NextRequest, NextResponse } from "next/server"
import { assignDocumentToUser } from "@/app/actions/supplier-document-actions"

export async function POST(request: NextRequest) {
  try {
    const { documentId, userId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    const result = await assignDocumentToUser(documentId, userId)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to assign document" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in document assignment API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

