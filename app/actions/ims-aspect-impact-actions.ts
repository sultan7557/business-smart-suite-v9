"use server"

import prisma from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type IMSAspectImpactPayload = {
  id?: string
  category: string
  activityProductService: string
  aspects: string[]
  impacts: string[]
  initialLikelihood: number
  initialSeverity: number
  controlMeasures?: string
  residualLikelihood: number
  residualSeverity: number
  commentsRecommendations?: string
  controlObjectives: string[]
}

function calculateRiskLevel(likelihood: number, severity: number): number {
  return (Number(likelihood) || 0) * (Number(severity) || 0)
}

export async function listIMSAspectImpacts(params: {
  category?: string
  activity?: string
  search?: string
}) {
  const { category, activity, search } = params

  const where: any = { archived: false }
  if (category && category !== "-- Category filter --") where.category = category
  if (activity && activity !== "-- Activity/Product/Service filter --")
    where.activityProductService = { contains: activity, mode: "insensitive" }
  if (search && search.trim()) {
    const query = search.trim()
    where.OR = [
      { category: { contains: query, mode: "insensitive" } },
      { activityProductService: { contains: query, mode: "insensitive" } },
      { aspects: { hasSome: query.split(/\s+/) } },
      { impacts: { hasSome: query.split(/\s+/) } },
      { controlMeasures: { contains: query, mode: "insensitive" } },
      { commentsRecommendations: { contains: query, mode: "insensitive" } },
    ]
  }

  const items = await prisma.iMSAspectImpact.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return items
}

export async function getIMSAspectImpact(id: string) {
  return prisma.iMSAspectImpact.findUnique({ where: { id } })
}

export async function createIMSAspectImpact(data: IMSAspectImpactPayload) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const initialRiskLevel = calculateRiskLevel(data.initialLikelihood, data.initialSeverity)
  const residualRiskLevel = calculateRiskLevel(data.residualLikelihood, data.residualSeverity)

  const created = await prisma.iMSAspectImpact.create({
    data: {
      category: data.category,
      activityProductService: data.activityProductService,
      aspects: data.aspects,
      impacts: data.impacts,
      initialLikelihood: data.initialLikelihood,
      initialSeverity: data.initialSeverity,
      initialRiskLevel,
      controlMeasures: data.controlMeasures,
      residualLikelihood: data.residualLikelihood,
      residualSeverity: data.residualSeverity,
      residualRiskLevel,
      commentsRecommendations: data.commentsRecommendations,
      controlObjectives: data.controlObjectives,
      createdById: user.id,
      updatedById: user.id,
    },
  })

  revalidatePath("/ims-aspects-impacts")
  return created
}

export async function updateIMSAspectImpact(id: string, data: IMSAspectImpactPayload) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")

  const initialRiskLevel = calculateRiskLevel(data.initialLikelihood, data.initialSeverity)
  const residualRiskLevel = calculateRiskLevel(data.residualLikelihood, data.residualSeverity)

  const updated = await prisma.iMSAspectImpact.update({
    where: { id },
    data: {
      category: data.category,
      activityProductService: data.activityProductService,
      aspects: data.aspects,
      impacts: data.impacts,
      initialLikelihood: data.initialLikelihood,
      initialSeverity: data.initialSeverity,
      initialRiskLevel,
      controlMeasures: data.controlMeasures,
      residualLikelihood: data.residualLikelihood,
      residualSeverity: data.residualSeverity,
      residualRiskLevel,
      commentsRecommendations: data.commentsRecommendations,
      controlObjectives: data.controlObjectives,
      updatedById: user.id,
    },
  })

  revalidatePath("/ims-aspects-impacts")
  return updated
}

export async function deleteIMSAspectImpact(id: string) {
  const user = await getUser()
  if (!user) throw new Error("Unauthorized")
  await prisma.iMSAspectImpact.update({ where: { id }, data: { archived: true, updatedById: user.id } })
  revalidatePath("/ims-aspects-impacts")
}


