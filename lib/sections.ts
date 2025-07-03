import { prisma } from "./prisma"

export async function getAllSections() {
  const sections = [
    {
      id: "manual",
      title: "Manual",
      categories: await prisma.manualCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "policy",
      title: "Policies",
      categories: await prisma.policyCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "procedure",
      title: "Procedures",
      categories: await prisma.procedureCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "form",
      title: "Forms",
      categories: await prisma.formCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "certificate",
      title: "Certificates",
      categories: await prisma.certificateCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "register",
      title: "Registers",
      categories: await prisma.registerCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "correctiveAction",
      title: "Corrective Actions",
      categories: await prisma.correctiveActionCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "businessContinuity",
      title: "Business Continuity",
      categories: await prisma.businessContinuityCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "managementReview",
      title: "Management Reviews",
      categories: await prisma.managementReviewCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "jobDescription",
      title: "Job Descriptions",
      categories: await prisma.jobDescriptionCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "workInstruction",
      title: "Work Instructions",
      categories: await prisma.workInstructionCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "riskAssessment",
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
      id: "hseGuidance",
      title: "HSE Guidance",
      categories: await prisma.hseGuidanceCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "technicalFile",
      title: "Technical File",
      categories: await prisma.technicalFileCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "environmentalGuidance",
      title: "Environmental Guidance",
      categories: await prisma.environmentalGuidanceCategory.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
    {
      id: "customSection",
      title: "Custom Sections",
      categories: await prisma.customSection.findMany({
        where: { archived: false },
        select: { id: true, title: true },
        orderBy: { order: "asc" },
      }),
    },
  ]

  return sections
} 