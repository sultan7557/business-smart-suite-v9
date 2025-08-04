import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting initial data seed...")

  // Get admin user for createdById
  const admin = await prisma.user.findFirst({
    where: { username: "admin" },
  })

  if (!admin) {
    throw new Error("Admin user not found")
  }

  // HSE Guidance
  console.log("Creating HSE guidance data...")
  const hseCategory = await prisma.hseGuidanceCategory.create({
    data: {
      title: "General HSE Guidance",
      order: 1,
    },
  })

  await prisma.hseGuidance.create({
    data: {
      title: "General Safety Guidelines",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: hseCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Risk Assessments
  console.log("Creating risk assessment data...")
  const riskCategory = await prisma.riskAssessmentCategory.create({
    data: {
      title: "General Risk Assessments",
      order: 1,
    },
  })

  await prisma.riskAssessment.create({
    data: {
      title: "General Workplace Risk Assessment",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: riskCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // COSHH
  console.log("Creating COSHH data...")
  const coshhCategory = await prisma.cOSHHCategory.create({
    data: {
      title: "General COSHH",
      order: 1,
    },
  })

  await prisma.cOSHH.create({
    data: {
      title: "General Chemical Safety",
      version: "1.0",
      reviewDate: new Date(),
      department: "HSE",
      categoryId: coshhCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Work Instructions
  console.log("Creating work instructions data...")
  const workInstructionCategory = await prisma.workInstructionCategory.create({
    data: {
      title: "General Work Instructions",
      order: 1,
    },
  })

  await prisma.workInstruction.create({
    data: {
      title: "General Safety Procedures",
      version: "1.0",
      reviewDate: new Date(),
      department: "Operations",
      categoryId: workInstructionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Procedures
  console.log("Creating procedures data...")
  const procedureCategory = await prisma.procedureCategory.create({
    data: {
      title: "General Procedures",
      order: 1,
    },
  })

  await prisma.procedure.create({
    data: {
      title: "General Operating Procedures",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: procedureCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Management Reviews
  console.log("Creating management review data...")
  const managementReviewCategory = await prisma.managementReviewCategory.create({
    data: {
      title: "General Management Review",
      order: 1,
    },
  })

  await prisma.managementReview.create({
    data: {
      title: "Initial Management Review",
      reviewDate: new Date(),
      version: "1.0",
      location: "IMS",
      categoryId: managementReviewCategory.id,
      createdById: admin.id,
    },
  })

  // Maintenance
  console.log("Creating maintenance data...")
  await prisma.maintenance.create({
    data: {
      name: "Initial Maintenance Check",
      category: "General",
      subCategory: "Routine",
      actionRequired: "Initial system check",
      frequency: "Monthly",
      dueDate: new Date(),
      owner: admin.name,
      createdById: admin.id,
    },
  })

  // Job Descriptions
  console.log("Creating job description data...")
  const jobDescriptionCategory = await prisma.jobDescriptionCategory.create({
    data: {
      title: "General Staff",
      order: 1,
    },
  })

  await prisma.jobDescription.create({
    data: {
      title: "General Staff",
      department: "General",
      version: "1.0",
      reviewDate: new Date(),
      categoryId: jobDescriptionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Improvement Register
  console.log("Creating improvement register data...")
  await prisma.improvementRegister.create({
    data: {
      number: 1,
      category: "General",
      type: "OFI",
      description: "Initial improvement suggestion",
      dateRaised: new Date(),
      dateDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      internalOwnerId: admin.id,
    },
  })

  // Manual
  console.log("Creating manual data...")
  const manualCategory = await prisma.manualCategory.create({
    data: {
      title: "General Manual",
      order: 1,
    },
  })

  await prisma.manual.create({
    data: {
      title: "General Operations Manual",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: manualCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Statement of Applicability
  console.log("Creating statement of applicability data...")
  await prisma.statementOfApplicabilityControl.create({
    data: {
      clause: "A.5.1",
      title: "Policies for information security",
      description: "Control – Information security policy and topic specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.",
      section: "A.5 Organisational Controls",
      order: 1,
    },
  })

  // Objectives
  console.log("Creating objectives data...")
  await prisma.objective.create({
    data: {
      source: "Management Review",
      categories: ["General"],
      objective: "Initial System Setup",
      target: "Complete initial system setup and configuration",
      resourcesRequired: "System access",
      progressToDate: "In progress",
      who: admin.name,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      likelihood: 1,
      severity: 1,
      riskLevel: 1,
      createdById: admin.id,
    },
  })

  // Interested Parties
  console.log("Creating interested parties data...")
  const interestedParty = await prisma.interestedParty.create({
    data: {
      name: "General Stakeholders",
      needsExpectations: "Initial stakeholder requirements",
      initialLikelihood: 1,
      initialSeverity: 1,
      controlsRecommendations: "Initial controls",
      residualLikelihood: 1,
      residualSeverity: 1,
      riskLevel: 1,
      residualRiskLevel: 1,
      createdById: admin.id,
    },
  })

  // Create sample versions for interested parties
  console.log("Creating interested party versions...")
  await prisma.interestedPartyVersion.create({
    data: {
      interestedPartyId: interestedParty.id,
      version: "1",
      name: interestedParty.name,
      description: interestedParty.description,
      needsExpectations: interestedParty.needsExpectations,
      initialLikelihood: interestedParty.initialLikelihood,
      initialSeverity: interestedParty.initialSeverity,
      controlsRecommendations: interestedParty.controlsRecommendations,
      residualLikelihood: interestedParty.residualLikelihood,
      residualSeverity: interestedParty.residualSeverity,
      riskLevel: interestedParty.riskLevel,
      residualRiskLevel: interestedParty.residualRiskLevel,
      amendmentDetails: "Initial version",
      createdById: admin.id,
    },
  })

  await prisma.interestedPartyVersion.create({
    data: {
      interestedPartyId: interestedParty.id,
      version: "2",
      name: interestedParty.name,
      description: interestedParty.description,
      needsExpectations: interestedParty.needsExpectations,
      initialLikelihood: interestedParty.initialLikelihood,
      initialSeverity: interestedParty.initialSeverity,
      controlsRecommendations: interestedParty.controlsRecommendations,
      residualLikelihood: interestedParty.residualLikelihood,
      residualSeverity: interestedParty.residualSeverity,
      riskLevel: interestedParty.riskLevel,
      residualRiskLevel: interestedParty.residualRiskLevel,
      amendmentDetails: "Fully Reviewed",
      createdById: admin.id,
    },
  })

  // Create sample reviews for interested parties
  console.log("Creating interested party reviews...")
  await prisma.interestedPartyReview.create({
    data: {
      interestedPartyId: interestedParty.id,
      reviewerName: "Kulvinder Bhullar",
      reviewDetails: "Reviewed to ensure data protection was covered as a requirement of interested parties",
      reviewDate: new Date("2022-08-11"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.interestedPartyReview.create({
    data: {
      interestedPartyId: interestedParty.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "All parties reviewed",
      reviewDate: new Date("2023-04-24"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.interestedPartyReview.create({
    data: {
      interestedPartyId: interestedParty.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "Annual review",
      reviewDate: new Date("2023-08-21"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.interestedPartyReview.create({
    data: {
      interestedPartyId: interestedParty.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "Annual review",
      reviewDate: new Date("2024-08-14"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  // Organizational Context
  console.log("Creating organizational context data...")
  const organizationalContext = await prisma.organizationalContext.create({
    data: {
      category: "political",
      subCategory: "strength",
      issue: "Initial organizational context",
      initialLikelihood: 1,
      initialSeverity: 1,
      initialRiskLevel: 1,
      controlsRecommendations: "Initial controls",
      residualLikelihood: 1,
      residualSeverity: 1,
      residualRiskLevel: 1,
      objectives: ["Initial objective"],
      createdById: admin.id,
    },
  })

  // Create sample versions for organizational context
  console.log("Creating organizational context versions...")
  await prisma.organizationalContextVersion.create({
    data: {
      organizationalContextId: organizationalContext.id,
      version: "1",
      category: organizationalContext.category,
      subCategory: organizationalContext.subCategory,
      issue: organizationalContext.issue,
      initialLikelihood: organizationalContext.initialLikelihood,
      initialSeverity: organizationalContext.initialSeverity,
      initialRiskLevel: organizationalContext.initialRiskLevel,
      controlsRecommendations: organizationalContext.controlsRecommendations,
      residualLikelihood: organizationalContext.residualLikelihood,
      residualSeverity: organizationalContext.residualSeverity,
      residualRiskLevel: organizationalContext.residualRiskLevel,
      objectives: organizationalContext.objectives,
      amendmentDetails: "Initial version",
      createdById: admin.id,
    },
  })

  await prisma.organizationalContextVersion.create({
    data: {
      organizationalContextId: organizationalContext.id,
      version: "2",
      category: organizationalContext.category,
      subCategory: organizationalContext.subCategory,
      issue: organizationalContext.issue,
      initialLikelihood: organizationalContext.initialLikelihood,
      initialSeverity: organizationalContext.initialSeverity,
      initialRiskLevel: organizationalContext.initialRiskLevel,
      controlsRecommendations: organizationalContext.controlsRecommendations,
      residualLikelihood: organizationalContext.residualLikelihood,
      residualSeverity: organizationalContext.residualSeverity,
      residualRiskLevel: organizationalContext.residualRiskLevel,
      objectives: organizationalContext.objectives,
      amendmentDetails: "Fully Reviewed",
      createdById: admin.id,
    },
  })

  // Create sample reviews for organizational context
  console.log("Creating organizational context reviews...")
  await prisma.organizationalContextReview.create({
    data: {
      organizationalContextId: organizationalContext.id,
      reviewerName: "Kulvinder Bhullar",
      reviewDetails: "Reviewed to ensure data protection was covered as a requirement of organizational context",
      reviewDate: new Date("2022-08-11"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.organizationalContextReview.create({
    data: {
      organizationalContextId: organizationalContext.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "All organizational context reviewed",
      reviewDate: new Date("2023-04-24"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.organizationalContextReview.create({
    data: {
      organizationalContextId: organizationalContext.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "Annual review",
      reviewDate: new Date("2023-08-21"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  await prisma.organizationalContextReview.create({
    data: {
      organizationalContextId: organizationalContext.id,
      reviewerName: "Kul Bhullar",
      reviewDetails: "Annual review",
      reviewDate: new Date("2024-08-14"),
      nextReviewDate: null,
      createdById: admin.id,
    },
  })

  // Audit Schedule
  console.log("Creating audit schedule data...")
  await prisma.audit.create({
    data: {
      title: "Initial System Audit",
      plannedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "not_started",
      createdById: admin.id,
      number: 3,
    },
  })

  console.log("Initial data seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })