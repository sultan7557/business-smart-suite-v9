import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all sections with their categories
    const sections = [
      {
        id: "manuals",
        title: "Manuals",
        categories: await prisma.manualCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "policies",
        title: "Policies",
        categories: await prisma.policyCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "procedures",
        title: "Procedures",
        categories: await prisma.procedureCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "forms",
        title: "Forms",
        categories: await prisma.formCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "certificates",
        title: "Certificates",
        categories: await prisma.certificateCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "registers",
        title: "Registers",
        categories: await prisma.registerCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "corrective-actions",
        title: "Corrective Actions",
        categories: await prisma.correctiveActionCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "business-continuity",
        title: "Business Continuity",
        categories: await prisma.businessContinuityCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "management-reviews",
        title: "Management Reviews",
        categories: await prisma.managementReviewCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "job-descriptions",
        title: "Job Descriptions",
        categories: await prisma.jobDescriptionCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "work-instructions",
        title: "Work Instructions",
        categories: await prisma.workInstructionCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "risk-assessments",
        title: "Risk Assessments",
        categories: await prisma.riskAssessmentCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "coshh",
        title: "COSHH",
        categories: await prisma.cOSHHCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "hse-guidance",
        title: "HSE Guidance",
        categories: await prisma.hseGuidanceCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "technical-file",
        title: "Technical File",
        categories: await prisma.technicalFileCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "environmental-guidance",
        title: "Environmental Guidance",
        categories: await prisma.environmentalGuidanceCategory.findMany({
          where: { archived: false },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
      {
        id: "custom-sections",
        title: "Custom Sections",
        categories: await prisma.customSection.findMany({
          where: { isActive: true },
          select: { id: true, title: true },
          orderBy: { order: "asc" },
        }),
      },
    ]

    return NextResponse.json(sections)
  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json(
      { error: "Failed to fetch sections" },
      { status: 500 }
    )
  }
} 