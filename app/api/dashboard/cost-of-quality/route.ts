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

    // Build date filter - default to last 12 months if no dates provided
    let dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.dateRaised = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      // Default to last 12 months
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      dateFilter.dateRaised = {
        gte: twelveMonthsAgo,
        lte: new Date()
      }
    }

    // Get cost data grouped by category (section) from improvement register
    const costData = await prisma.improvementRegister.groupBy({
      by: ['category'],
      where: {
        ...dateFilter,
        archived: false,
        cost: {
          gt: 0
        }
      },
      _sum: {
        cost: true
      },
      _count: {
        category: true
      },
      orderBy: {
        _sum: {
          cost: 'desc'
        }
      }
    })

    // Transform data for chart - showing total combined cost per section
    const chartData = costData.map(item => ({
      name: item.category,
      totalCost: item._sum.cost || 0,
      count: item._count.category,
      averageCost: item._sum.cost ? (item._sum.cost / item._count.category) : 0
    }))

    // Add summary statistics
    const totalCost = chartData.reduce((sum, item) => sum + item.totalCost, 0)
    const totalCount = chartData.reduce((sum, item) => sum + item.count, 0)
    const averageCost = totalCount > 0 ? totalCost / totalCount : 0

    return NextResponse.json({
      data: chartData,
      summary: {
        totalCost,
        totalCount,
        averageCost
      }
    })
  } catch (error) {
    console.error("Error fetching cost of quality data:", error)
    return NextResponse.json({ error: "Failed to fetch cost of quality data" }, { status: 500 })
  }
}

