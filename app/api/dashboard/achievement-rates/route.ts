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

    // Get improvement register data grouped by category with due date analysis
    const improvementData = await prisma.improvementRegister.groupBy({
      by: ['category'],
      where: {
        ...dateFilter,
        archived: false,
        dateDue: {
          not: null
        }
      },
      _count: {
        category: true
      },
      _avg: {
        cost: true
      }
    })

    // Get detailed data for each category to analyze due dates
    const detailedData = await Promise.all(
      improvementData.map(async (category) => {
        const improvements = await prisma.improvementRegister.findMany({
          where: {
            ...dateFilter,
            archived: false,
            category: category.category,
            dateDue: {
              not: null
            }
          },
          select: {
            dateDue: true,
            dateCompleted: true,
            dateActionTaken: true
          }
        })

        const now = new Date()
        let onTime = 0
        let late = 0

        improvements.forEach(improvement => {
          if (improvement.dateDue) {
            const dueDate = new Date(improvement.dateDue)
            const completionDate = improvement.dateCompleted || improvement.dateActionTaken || now
            
            if (completionDate <= dueDate) {
              onTime++
            } else {
              late++
            }
          }
        })

        return {
          name: category.category,
          onTime,
          late,
          total: category._count.category,
          averageCost: category._avg.cost || 0
        }
      })
    )

    // Transform data for chart (showing on-time vs late for each area)
    const chartData = detailedData.map(item => ({
      name: item.name,
      onTime: item.onTime,
      late: item.late,
      total: item.total,
      averageCost: item.averageCost
    }))

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Error fetching achievement rate data:", error)
    return NextResponse.json({ error: "Failed to fetch achievement rate data" }, { status: 500 })
  }
}

