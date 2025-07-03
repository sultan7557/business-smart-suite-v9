import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json([])
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

    // Combine and format results
    const results = [
      ...manuals.map(item => ({
        id: item.id,
        title: item.title,
        type: "Manual",
        href: `/manual/${item.id}`,
        section: item.category.title,
      })),
      ...policies.map(item => ({
        id: item.id,
        title: item.title,
        type: "Policy",
        href: `/policies/${item.id}`,
        section: item.category.title,
      })),
      ...procedures.map(item => ({
        id: item.id,
        title: item.title,
        type: "Procedure",
        href: `/procedures/${item.id}`,
        section: item.category.title,
      })),
      ...forms.map(item => ({
        id: item.id,
        title: item.title,
        type: "Form",
        href: `/forms/${item.id}`,
        section: item.category.title,
      })),
      ...certificates.map(item => ({
        id: item.id,
        title: item.title,
        type: "Certificate",
        href: `/certificate/${item.id}`,
        section: item.category.title,
      })),
      ...registers.map(item => ({
        id: item.id,
        title: item.title,
        type: "Register",
        href: `/registers/${item.id}`,
        section: item.category.title,
      })),
      ...correctiveActions.map(item => ({
        id: item.id,
        title: item.title,
        type: "Corrective Action",
        href: `/corrective-actions/${item.id}`,
        section: item.category.title,
      })),
      ...businessContinuity.map(item => ({
        id: item.id,
        title: item.title,
        type: "Business Continuity",
        href: `/business-continuity/${item.id}`,
        section: item.category.title,
      })),
      ...jobDescriptions.map(item => ({
        id: item.id,
        title: item.title,
        type: "Job Description",
        href: `/job-descriptions/${item.id}`,
        section: item.category.title,
      })),
      ...workInstructions.map(item => ({
        id: item.id,
        title: item.title,
        type: "Work Instruction",
        href: `/work-instructions/${item.id}`,
        section: item.category.title,
      })),
      ...riskAssessments.map(item => ({
        id: item.id,
        title: item.title,
        type: "Risk Assessment",
        href: `/risk-assessments/${item.id}`,
        section: item.category.title,
      })),
      ...hseGuidance.map(item => ({
        id: item.id,
        title: item.title,
        type: "HSE Guidance",
        href: `/hse-guidance/${item.id}`,
        section: item.category.title,
      })),
      ...technicalFile.map(item => ({
        id: item.id,
        title: item.title,
        type: "Technical File",
        href: `/technical-file/${item.id}`,
        section: item.category.title,
      })),
      ...environmentalGuidance.map(item => ({
        id: item.id,
        title: item.title,
        type: "Environmental Guidance",
        href: `/environmental-guidance/${item.id}`,
        section: item.category.title,
      })),
    ]

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
} 