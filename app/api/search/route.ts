import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import redis from "@/lib/redis"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json([])
  }

  // Redis cache key
  const cacheKey = `search:${query}`
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return new NextResponse(cached, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  }

  try {
    // Search across all relevant tables
    const searchPromises = [
      // Manuals
      prisma.manual?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Policies
      prisma.policy?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Procedures
      prisma.procedure?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Forms
      prisma.form?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Certificates
      prisma.certificate?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Registers
      prisma.register?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Corrective Actions
      prisma.correctiveAction?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Business Continuity
      prisma.businessContinuity?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Job Descriptions
      prisma.jobDescription?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Work Instructions
      prisma.workInstruction?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Risk Assessments
      prisma.riskAssessment?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // HSE Guidance
      prisma.hseGuidance?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Technical File
      prisma.technicalFile?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
      // Environmental Guidance
      prisma.environmentalGuidance?.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: {
            select: {
              title: true,
            },
          },
        },
      }).catch(() => []),
    ]

    const [
      manuals,
      policies,
      procedures,
      forms,
      certificates,
      registers,
      correctiveActions,
      businessContinuity,
      jobDescriptions,
      workInstructions,
      riskAssessments,
      hseGuidance,
      technicalFile,
      environmentalGuidance,
    ] = await Promise.all(searchPromises)

    const result = JSON.stringify({
      manuals,
      policies,
      procedures,
      forms,
      certificates,
      registers,
      correctiveActions,
      businessContinuity,
      jobDescriptions,
      workInstructions,
      riskAssessments,
      hseGuidance,
      technicalFile,
      environmentalGuidance,
    })
    // Cache for 2 minutes
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
} 