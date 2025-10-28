import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.iMSAspectImpact.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ data: item })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await request.json()

  function calc(l: number, s: number) { return (Number(l) || 0) * (Number(s) || 0) }

  const updated = await prisma.iMSAspectImpact.update({
    where: { id },
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
      updatedById: user.id,
    },
  })

  // Create new version if version and reviewDate are provided
  if (body.version && body.reviewDate) {
    await prisma.iMSAspectImpactVersion.create({
      data: {
        aspectImpactId: id,
        version: body.version,
        reviewDate: new Date(body.reviewDate),
        notes: "Version update",
        createdById: user.id,
      },
    })
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.iMSAspectImpact.update({ where: { id }, data: { archived: true, updatedById: user.id } })
  return NextResponse.json({ success: true })
}

