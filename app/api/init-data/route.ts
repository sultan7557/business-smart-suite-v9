import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Map logical type to actual Prisma model name
const categoryModelMap: Record<string, string> = {
  policy: "policyCategory",
  manual: "manualCategory",
  procedure: "procedureCategory",
  form: "formCategory",
  certificate: "certificateCategory",
  corrective_action: "correctiveActionCategory",
  business_continuity: "businessContinuityCategory",
  management_review: "managementReviewCategory",
  job_description: "jobDescriptionCategory",
  work_instruction: "workInstructionCategory",
  coshh: "cOSHHCategory",
  risk_assessment: "riskAssessmentCategory",
  hse_guidance: "hseGuidanceCategory",
  technical_file: "technicalFileCategory",
  environmental_guidance: "environmentalGuidanceCategory",
  register: "registerCategory",
  custom_section: "customSectionCategory",
};

const defaultCategories = [
  { title: "General", type: "policy", order: 0 },
  { title: "General", type: "manual", order: 0 },
  { title: "General", type: "procedure", order: 0 },
  { title: "General", type: "form", order: 0 },
  { title: "General", type: "certificate", order: 0 },
  { title: "General", type: "corrective_action", order: 0 },
  { title: "General", type: "business_continuity", order: 0 },
  { title: "General", type: "management_review", order: 0 },
  { title: "General", type: "job_description", order: 0 },
  { title: "General", type: "work_instruction", order: 0 },
  { title: "General", type: "coshh", order: 0 },
  { title: "General", type: "risk_assessment", order: 0 },
  { title: "General", type: "hse_guidance", order: 0 },
  { title: "General", type: "technical_file", order: 0 },
  { title: "General", type: "environmental_guidance", order: 0 },
  { title: "General", type: "register", order: 0 },
  { title: "General", type: "custom_section", order: 0 },
];

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser()

    if (!currentUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Create default categories only for models that exist
    const createdCategories = [];
    for (const category of defaultCategories) {
      const modelName = categoryModelMap[category.type];
      if (!modelName || !(modelName in prisma)) continue;
      // @ts-ignore
      const existingCategory = await prisma[modelName].findFirst({
        where: { title: category.title }
      });
      if (existingCategory) {
        createdCategories.push(existingCategory);
        continue;
      }
      // @ts-ignore
      const newCategory = await prisma[modelName].create({
        data: {
          title: category.title,
          order: category.order,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      createdCategories.push(newCategory);
    }

    return NextResponse.json({ 
      message: "Default categories created successfully", 
      categories: createdCategories 
    })
  } catch (error) {
    console.error("Initialize data error:", error)
    return NextResponse.json({ error: "An error occurred while initializing data" }, { status: 500 })
  }
} 