import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma-server"
import { withAuth } from "@/lib/auth"
import { optimizedDB } from "@/lib/db-optimized"
import { headers } from "next/headers"

// Optimized GET handler with caching and performance monitoring
export const GET = withAuth(async (request: NextRequest) => {
  const startTime = Date.now()
  
  try {
    const searchParams = request.nextUrl.searchParams
    const archived = searchParams.get("archived") === "true"
    const categoryId = searchParams.get("categoryId")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    // Create cache key
    const cacheKey = `procedures:${archived}:${categoryId || 'all'}:${page}:${limit}`
    
    // Use optimized database with caching
    const procedures = await optimizedDB.cachedQuery(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit
        
        // Optimized query with selective includes
        const [data, total] = await Promise.all([
          prisma.procedure.findMany({
            where: {
              archived,
              ...(categoryId ? { categoryId } : {}),
            },
            select: {
              id: true,
              title: true,
              version: true,
              issueDate: true,
              location: true,
              archived: true,
              order: true,
              highlighted: true,
              approved: true,
              createdAt: true,
              updatedAt: true,
              category: {
                select: {
                  id: true,
                  title: true,
                  order: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              updatedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            skip,
            take: limit,
            orderBy: [
              { category: { order: "asc" } },
              { order: "asc" },
              { title: "asc" },
            ],
          }),
          prisma.procedure.count({
            where: {
              archived,
              ...(categoryId ? { categoryId } : {}),
            },
          }),
        ])
        
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
      },
      300 // 5 minutes cache
    )
    
    const responseTime = Date.now() - startTime
    
    // Add performance headers
    const headersList = await headers()
    const response = NextResponse.json(procedures, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        "X-Response-Time": `${responseTime}ms`,
        "X-Cache-Status": "HIT",
      },
    })
    
    // Log performance metrics in production
    if (process.env.NODE_ENV === 'production' && responseTime > 500) {
      console.warn(`Slow API response: /api/procedures took ${responseTime}ms`)
    }
    
    return response
    
  } catch (error) {
    console.error("Error fetching procedures:", error)
    return NextResponse.json(
      { error: "Failed to fetch procedures" }, 
      { status: 500 }
    )
  }
})

// Optimized POST handler
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.title || !body.categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Create procedure with optimized query
    const procedure = await prisma.procedure.create({
      data: {
        title: body.title,
        version: body.version || "1.0",
        issueDate: new Date(body.issueDate || Date.now()),
        location: body.location || "Default",
        content: body.content,
        categoryId: body.categoryId,
        createdById: body.createdById,
        order: body.order || 0,
      },
      select: {
        id: true,
        title: true,
        version: true,
        issueDate: true,
        location: true,
        category: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    // Invalidate related caches
    await optimizedDB.invalidateCache("procedures")
    
    return NextResponse.json(procedure, { status: 201 })
    
  } catch (error) {
    console.error("Error creating procedure:", error)
    return NextResponse.json(
      { error: "Failed to create procedure" },
      { status: 500 }
    )
  }
}) 