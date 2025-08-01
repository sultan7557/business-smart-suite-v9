import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.dateRaised = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get root cause analysis data from improvement register
    const rootCauseData = await prisma.improvementRegister.groupBy({
      by: ['rootCauseType'],
      where: {
        ...dateFilter,
        archived: false,
        rootCauseType: {
          not: null
        }
      },
      _count: {
        rootCauseType: true
      },
      orderBy: {
        _count: {
          rootCauseType: 'desc'
        }
      }
    })

    // Transform data for chart
    const chartData = rootCauseData.map(item => ({
      name: item.rootCauseType || 'Unknown',
      value: item._count.rootCauseType
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching root cause data:", error)
    return NextResponse.json({ error: "Failed to fetch root cause data" }, { status: 500 })
  }
}

