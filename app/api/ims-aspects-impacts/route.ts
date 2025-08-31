import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || undefined
  const activity = searchParams.get("activity") || undefined
  const search = searchParams.get("search") || undefined

  const where: any = { archived: false }
  if (category && category !== "-- Category filter --") where.category = category
  if (activity && activity !== "-- Activity/Product/Service filter --")
    where.activityProductService = { contains: activity, mode: "insensitive" }
  if (search && search.trim()) {
    const q = search.trim()
    where.OR = [
      { category: { contains: q, mode: "insensitive" } },
      { activityProductService: { contains: q, mode: "insensitive" } },
      { aspects: { hasSome: q.split(/\s+/) } },
      { impacts: { hasSome: q.split(/\s+/) } },
      { controlMeasures: { contains: q, mode: "insensitive" } },
      { commentsRecommendations: { contains: q, mode: "insensitive" } },
    ]
  }

  const items = await prisma.iMSAspectImpact.findMany({ where, orderBy: { createdAt: "desc" } })
  return NextResponse.json({ data: items })
}

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()

  function calc(l: number, s: number) {
    return (Number(l) || 0) * (Number(s) || 0)
  }

  const created = await prisma.iMSAspectImpact.create({
    data: {
      category: body.category,
      activityProductService: body.activityProductService,
      aspects: body.aspects ?? [],
      impacts: body.impacts ?? [],
      initialLikelihood: body.initialLikelihood ?? 0,
      initialSeverity: body.initialSeverity ?? 0,
      initialRiskLevel: calc(body.initialLikelihood, body.initialSeverity),
      controlMeasures: body.controlMeasures ?? null,
      residualLikelihood: body.residualLikelihood ?? 0,
      residualSeverity: body.residualSeverity ?? 0,
      residualRiskLevel: calc(body.residualLikelihood, body.residualSeverity),
      commentsRecommendations: body.commentsRecommendations ?? null,
      controlObjectives: body.controlObjectives ?? [],
      createdById: user.id,
      updatedById: user.id,
    },
  })

  return NextResponse.json({ data: created }, { status: 201 })
}

