import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10)
  const userPassword = await bcrypt.hash("user123", 10)
  const managerPassword = await bcrypt.hash("manager123", 10)

  console.log("Creating users...")

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    },
  })

  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      password: userPassword,
      name: "Regular User",
      email: "user@example.com",
      role: "user",
    },
  })

  const manager = await prisma.user.upsert({
    where: { username: "manager" },
    update: {},
    create: {
      username: "manager",
      password: managerPassword,
      name: "Manager User",
      email: "manager@example.com",
      role: "manager",
    },
  })

  // Create roles
  console.log("Creating roles...")
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "write" },
      update: {},
      create: {
        name: "write",
        description: "Write permission"
      }
    }),
    prisma.role.upsert({
      where: { name: "delete" },
      update: {},
      create: {
        name: "delete",
        description: "Delete permission"
      }
    })
  ]);

  // Create permissions for admin user
  console.log("Creating permissions...")
  await Promise.all([
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: admin.id,
          systemId: "policies",
          roleId: roles[0].id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: roles[0].id,
        systemId: "policies",
        expiry: null
      }
    }),
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: admin.id,
          systemId: "policies",
          roleId: roles[1].id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: roles[1].id,
        systemId: "policies",
        expiry: null
      }
    }),
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: admin.id,
          systemId: "manuals",
          roleId: roles[0].id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: roles[0].id,
        systemId: "manuals",
        expiry: null
      }
    }),
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: admin.id,
          systemId: "manuals",
          roleId: roles[1].id
        }
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: roles[1].id,
        systemId: "manuals",
        expiry: null
      }
    })
  ]);

  // Create permissions for manager
  await Promise.all([
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: manager.id,
          systemId: "policies",
          roleId: roles[0].id
        }
      },
      update: {},
      create: {
        userId: manager.id,
        roleId: roles[0].id,
        systemId: "policies",
        expiry: null
      }
    }),
    prisma.permission.upsert({
      where: {
        userId_systemId_roleId: {
          userId: manager.id,
          systemId: "manuals",
          roleId: roles[0].id
        }
      },
      update: {},
      create: {
        userId: manager.id,
        roleId: roles[0].id,
        systemId: "manuals",
        expiry: null
      }
    })
  ]);

  // Create policy categories
  console.log("Creating policy categories...")

  const infoSecurityCategory = await prisma.policyCategory.create({
    data: {
      title: "Information Security Control Policies (Annex A Controls)",
      order: 1,
    },
  })

  const integratedManagementCategory = await prisma.policyCategory.create({
    data: {
      title: "Integrated Management System",
      order: 2,
    },
  })

  const infoSecurityManagementCategory = await prisma.policyCategory.create({
    data: {
      title: "Information Security Management System Policy",
      order: 3,
    },
  })

  const carbonFootprintCategory = await prisma.policyCategory.create({
    data: {
      title: "Carbon Footprint Statement and Carbon Reduction Plan",
      order: 4,
    },
  })

  const infoCommCategory = await prisma.policyCategory.create({
    data: {
      title: "Information Communication Technology Security Policy",
      order: 5,
    },
  })

  const signingSheets = await prisma.policyCategory.create({
    data: {
      title: "Signing Sheets",
      order: 6,
    },
  })

  const humanResources = await prisma.policyCategory.create({
    data: {
      title: "Human Resources",
      order: 7,
    },
  })

  // Create policies
  console.log("Creating policies...")

  const mobilePolicy = await prisma.policy.create({
    data: {
      title: "01 Mobile Phone & Devices Policy",
      version: "4",
      issueDate: new Date("2023-05-11"),
      location: "IMS",
      categoryId: infoSecurityCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  const acceptableUsePolicy = await prisma.policy.create({
    data: {
      title: "02 Acceptable Use Policy",
      version: "2",
      issueDate: new Date("2023-05-11"),
      location: "IMS",
      categoryId: infoSecurityCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  const accessControlPolicy = await prisma.policy.create({
    data: {
      title: "03 Access Control Policy",
      version: "3",
      issueDate: new Date("2023-05-11"),
      location: "IMS",
      categoryId: infoSecurityCategory.id,
      createdById: admin.id,
      order: 3,
    },
  })

  const assetManagementPolicy = await prisma.policy.create({
    data: {
      title: "04 Asset Management Policy",
      version: "4",
      issueDate: new Date("2023-05-11"),
      location: "IMS",
      categoryId: infoSecurityCategory.id,
      createdById: admin.id,
      order: 4,
    },
  })

  // Create policy versions
  console.log("Creating policy versions...")

  await prisma.policyVersion.createMany({
    data: [
      {
        policyId: mobilePolicy.id,
        version: "1",
        issueDate: new Date("2022-08-18"),
        notes: "Initial version",
        createdById: manager.id,
      },
      {
        policyId: mobilePolicy.id,
        version: "2",
        issueDate: new Date("2022-08-22"),
        notes: "Updated with new requirements",
        createdById: manager.id,
      },
      {
        policyId: mobilePolicy.id,
        version: "3",
        issueDate: new Date("2023-04-24"),
        notes: "Annual review",
        createdById: user.id,
      },
      {
        policyId: mobilePolicy.id,
        version: "4",
        issueDate: new Date("2023-05-11"),
        notes: "Updated with new mobile device guidelines",
        createdById: admin.id,
      },
    ],
  })

// Create manual categories
  console.log("Creating manual categories...")

  const qualityManualCategory = await prisma.manualCategory.create({
    data: {
      title: "Quality Manual",
      order: 1,
    },
  })

  const operationsManualCategory = await prisma.manualCategory.create({
    data: {
      title: "Operations Manual",
      order: 2,
    },
  })

  const safetyManualCategory = await prisma.manualCategory.create({
    data: {
      title: "Safety Manual",
      order: 3,
    },
  })

  // Create manuals
  console.log("Creating manuals...")

  const qualityControlManual = await prisma.manual.create({
    data: {
      title: "Quality Control Procedures",
      version: "2",
      issueDate: new Date("2023-06-15"),
      location: "IMS",
      categoryId: qualityManualCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  const qualityAssuranceManual = await prisma.manual.create({
    data: {
      title: "Quality Assurance Standards",
      version: "3",
      issueDate: new Date("2023-07-22"),
      location: "IMS",
      categoryId: qualityManualCategory.id,
      createdById: admin.id,
      order: 2,
    },
  })

  const operationalProceduresManual = await prisma.manual.create({
    data: {
      title: "Standard Operating Procedures",
      version: "1",
      issueDate: new Date("2023-04-10"),
      location: "IMS",
      categoryId: operationsManualCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Create manual versions
  console.log("Creating manual versions...")

  await prisma.manualVersion.createMany({
    data: [
      {
        manualId: qualityControlManual.id,
        version: "1",
        issueDate: new Date("2022-10-05"),
        notes: "Initial version",
        createdById: manager.id,
      },
      {
        manualId: qualityControlManual.id,
        version: "2",
        issueDate: new Date("2023-06-15"),
        notes: "Updated with new quality control procedures",
        createdById: admin.id,
      },
      {
        manualId: qualityAssuranceManual.id,
        version: "1",
        issueDate: new Date("2022-11-12"),
        notes: "Initial version",
        createdById: manager.id,
      },
      {
        manualId: qualityAssuranceManual.id,
        version: "2",
        issueDate: new Date("2023-02-28"),
        notes: "Updated with ISO compliance requirements",
        createdById: user.id,
      },
      {
        manualId: qualityAssuranceManual.id,
        version: "3",
        issueDate: new Date("2023-07-22"),
        notes: "Annual review and updates",
        createdById: admin.id,
      },
    ],
  })

  // Create dashboard data
  console.log("Creating dashboard data...")

  // Root causes
  const rootCauses = [
    { name: "Hardware", value: 2 },
    { name: "Management Error", value: 1 },
    { name: "Software", value: 2 },
    { name: "Information Security", value: 0 },
    { name: "Lack of Control Procedure", value: 0 },
    { name: "Location", value: 0 },
    { name: "Machinery", value: 0 },
    { name: "Materials", value: 0 },
  ]

  for (const cause of rootCauses) {
    await prisma.rootCause.create({
      data: cause,
    })
  }

  // Achievement rates
  const achievementRates = [
    { name: "Account", timely: 2, overdue: 0 },
    { name: "Complaint", timely: 1, overdue: 0 },
    { name: "Environment", timely: 0, overdue: 0 },
    { name: "External Audit", timely: 0, overdue: 0 },
    { name: "General Safety", timely: 0, overdue: 0 },
    { name: "Health and Safety", timely: 0, overdue: 0 },
    { name: "Improvement", timely: 2, overdue: 0 },
    { name: "Information Security", timely: 0, overdue: 0 },
    { name: "Installation", timely: 0, overdue: 0 },
    { name: "Internal Audit", timely: 0, overdue: 0 },
    { name: "Management Review", timely: 0, overdue: 0 },
    { name: "Near Miss", timely: 0, overdue: 0 },
    { name: "Process", timely: 0, overdue: 0 },
    { name: "Software", timely: 0, overdue: 0 },
    { name: "Supplier Defect", timely: 0, overdue: 0 },
  ]

  for (const rate of achievementRates) {
    await prisma.achievementRate.create({
      data: rate,
    })
  }

  // Cost of quality
  const costOfQuality = [
    { name: "Account", value: 0 },
    { name: "Complaint", value: 78 },
    { name: "Environment", value: 0 },
    { name: "External Audit", value: 0 },
    { name: "General Safety", value: 0 },
    { name: "Health and Safety", value: 0 },
    { name: "Improvement", value: 0 },
    { name: "Information Security", value: 0 },
    { name: "Installation", value: 0 },
    { name: "Internal Audit", value: 0 },
    { name: "Management Review", value: 0 },
    { name: "Near Miss", value: 0 },
    { name: "Process", value: 0 },
    { name: "Software", value: 0 },
    { name: "Supplier Defect", value: 0 },
  ]

  for (const cost of costOfQuality) {
    await prisma.costOfQuality.create({
      data: cost,
    })
  }

  // Try to create audit data
  try {
    console.log("Creating sample audit data...");
    
    await prisma.audit.create({
      data: {
        title: "Annual Policy Review",
        plannedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "not_started",
        createdById: admin.id,
        number: 2,
        auditDocuments: {
          create: [
            {
              docType: "procedure",
              docId: "Procedure No 1 Planning & Review",
              docName: "Procedure No 1 Planning & Review",
            },
            {
              docType: "manual",
              docId: "Integrated Manual",
              docName: "Integrated Manual",
            }
          ]
        }
      },
    });

    await prisma.audit.create({
      data: {
        title: "Information Security Compliance",
        plannedStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        actualStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        status: "in_progress",
        auditorId: manager.id,
        createdById: admin.id,
        number: 1,
        auditDocuments: {
          create: [
            {
              docType: "procedure",
              docId: "Procedure No 2 Information Control",
              docName: "Procedure No 2 Information Control",
            }
          ]
        }
      },
    });
    
    console.log("Sample audit data created successfully");
  } catch (error) {
    console.error("Error creating audit data:", error);
    console.log("Continuing with seed...");
    // Continue even if audit creation fails
  }
  // Create interested parties
  console.log("Creating sample interested parties...");

  try {
    const interestedParties = [
      {
        name: "Owner",
        needsExpectations: "Control the profitability and growth, resources\nTransparency",
        initialLikelihood: 3,
        initialSeverity: 3,
        controlsRecommendations: "Supports re-investment\nQuarterly review of management accounts\nTwo weekly review of sales projection\nAnnual review of year end accounts",
        residualLikelihood: 1,
        residualSeverity: 3,
        riskLevel: 9, // 3 * 3
        residualRiskLevel: 3, // 1 * 3
        createdById: admin.id,
        order: 1,
      },
      {
        name: "Employees",
        needsExpectations: "Good working environment\nRecognition and reward\nJob security\nProtection of personal identifiable information",
        initialLikelihood: 3,
        initialSeverity: 3,
        controlsRecommendations: "Cleanliness, morale, commitment and training opportunities\nRisk assessments and Safe Systems of Work in place\nAnnual performance review",
        residualLikelihood: 1,
        residualSeverity: 3,
        riskLevel: 9, // 3 * 3
        residualRiskLevel: 3, // 1 * 3
        createdById: admin.id,
        order: 2,
      },
      {
        name: "Clients",
        needsExpectations: "Competitive pricing, quality of product, delivery and service\nConfidentiality in business dealings",
        initialLikelihood: 3,
        initialSeverity: 3,
        controlsRecommendations: "Integrated Management System to control all aspects",
        residualLikelihood: 1,
        residualSeverity: 3,
        riskLevel: 9, // 3 * 3
        residualRiskLevel: 3, // 1 * 3
        createdById: admin.id,
        order: 3,
      },
      {
        name: "Suppliers and Partners",
        needsExpectations: "Mutual benefit and continuity\nExpect to be paid on time\nCompany to clearly define product/services in PO\nIncrease to turnover",
        initialLikelihood: 3,
        initialSeverity: 3,
        controlsRecommendations: "Develop relationships\nAnnual supplier review\nApproved Supplier Register\nDevelop more work opportunities with partners",
        residualLikelihood: 1,
        residualSeverity: 3,
        riskLevel: 9, // 3 * 3
        residualRiskLevel: 3, // 1 * 3
        createdById: admin.id,
        order: 4,
      },
      {
        name: "Certification Bodies",
        needsExpectations: "Evaluation of the Integrated Management System",
        initialLikelihood: 4,
        initialSeverity: 3,
        controlsRecommendations: "United Kingdom Accreditation Service (UKAS) accredited certification body\nAnnual surveillance audit and re-certification\nEngagement with external consultancy",
        residualLikelihood: 1,
        residualSeverity: 4,
        riskLevel: 12, // 4 * 3
        residualRiskLevel: 4, // 1 * 4
        createdById: admin.id,
        order: 5,
      },
      {
        name: "Legal and Regulatory Authorities",
        needsExpectations: "Statutory compliance",
        initialLikelihood: 5,
        initialSeverity: 3,
        controlsRecommendations: "Adoption of ISO 9001, 13485 and 27001\nUKAS accredited certification body\nAnnual surveillance audit and re-certification\nEngagement with external consultancy\nICO Registration",
        residualLikelihood: 1,
        residualSeverity: 5,
        riskLevel: 15, // 5 * 3
        residualRiskLevel: 5, // 1 * 5
        createdById: admin.id,
        order: 6,
      },
    ];

    for (const party of interestedParties) {
      await prisma.interestedParty.create({
        data: party,
      });
    }
    
    console.log("Sample interested parties created successfully");
  } catch (error) {
    console.error("Error creating interested parties:", error);
    console.log("Continuing with seed...");
    // Continue even if interested parties creation fails
  }
  // Add sample organizational context entries
console.log("Creating organizational context entries...")

  const orgContextEntries = [
    {
      category: "political",
      subCategory: "opportunity",
      issue: "Government customers requiring ISO27001 ISMS to ensure compliance with GDPR and data protection",
      initialLikelihood: 4,
      initialSeverity: 5,
      initialRiskLevel: 20,
      controlsRecommendations: "ISMS developed\nCloud hosted services with appropriate ISMS in place",
      residualLikelihood: 2,
      residualSeverity: 2,
      residualRiskLevel: 4,
      objectives: ["Implement an integrated management system to ISO 9001, ISO 13485 and ISO 27001"],
      createdById: admin.id,
    },
    {
      category: "political",
      subCategory: "threat",
      issue: "BREXIT",
      initialLikelihood: 3,
      initialSeverity: 5,
      initialRiskLevel: 15,
      controlsRecommendations: "Beyond overall control but ensure reviewed and any necessary actions implemented\nStrong accounting practices\nNo outstanding debt",
      residualLikelihood: 2,
      residualSeverity: 3,
      residualRiskLevel: 6,
      objectives: ["Implement an integrated management system to ISO 9001, ISO 13485 and ISO 27001"],
      createdById: admin.id,
    },
    {
      category: "economic",
      subCategory: "threat",
      issue: "UK Economical outlook",
      initialLikelihood: 3,
      initialSeverity: 3,
      initialRiskLevel: 9,
      controlsRecommendations: "Beyond overall control but ensure reviewed and any necessary actions implemented\nPayment plans in place\nStrong accounting practices",
      residualLikelihood: 2,
      residualSeverity: 3,
      residualRiskLevel: 6,
      objectives: ["Improve analysis of customer satisfaction"],
      createdById: admin.id,
    },
    {
      category: "social",
      subCategory: "threat",
      issue: "Workers absences / burnout and stress",
      initialLikelihood: 4,
      initialSeverity: 4,
      initialRiskLevel: 16,
      controlsRecommendations: "Relevant procedures documented in Employee Handbook\nMental health welfare support\nHR to monitor\nMobile support team to ensure clients needs are addressed\nSpecific Job Descriptions\nNon-confrontational working environment\nSafe / Suitable working environment\nEmployee appraisal process being instigated",
      residualLikelihood: 2,
      residualSeverity: 2,
      residualRiskLevel: 4,
      objectives: ["Improve monitoring of health and safety performance", "Increase general awareness of product quality and data security"],
      createdById: admin.id,
    },
    {
      category: "technology",
      subCategory: "threat",
      issue: "Malicious attacks via virus or spam; incorrect use of social media; Loss/Redundant use of Personal data; unauthorized use of software/hardware",
      initialLikelihood: 4,
      initialSeverity: 5,
      initialRiskLevel: 20,
      controlsRecommendations: "Antivirus, malware and firewall protection software in place\nRegular backup of systems\nEncrypted two-factor authentication / authorized users only\nLocked workstations",
      residualLikelihood: 1,
      residualSeverity: 5,
      residualRiskLevel: 5,
      objectives: ["Implement an integrated management system to ISO 9001, ISO 13485 and ISO 27001", "Increase general awareness of product quality and data security", "Maintain ISMS & Data Protection"],
      createdById: admin.id,
    },
  ];

  for (const entry of orgContextEntries) {
    await prisma.organizationalContext.create({
      data: entry,
    });
  }

  // Add sample objectives
  console.log("Creating objectives...");

  const objectives = [
    {
      source: "Management Review",
      categories: ["Information Security"],
      objective: "Maintain ISO 27001 certification with NQA",
      target: "To achieve ISO 27001 through OFI and advice from NQA and Business Smart Suite.",
      resourcesRequired: "Consultancy, CB",
      progressToDate: "Surveillance audit completed with recommendations. These are being reviewed and the QMS updated as recommended.",
      who: "Business Smart Suite",
      dueDate: new Date("2024-10-31"),
      likelihood: 2,
      severity: 5,
      riskLevel: 10,
      completed: false,
      createdById: admin.id,
    },
    {
      source: "Management Review",
      categories: ["Information Security"],
      objective: "Improve Use Of social Media Platforms",
      target: "To enhance business through the use of social media.",
      resourcesRequired: "Social media platforms required such as LinkedIn",
      progressToDate: "Profile has been created.",
      who: "MD",
      dueDate: new Date("2024-09-30"),
      likelihood: 1,
      severity: 2,
      riskLevel: 2,
      completed: false,
      createdById: admin.id,
    },
    {
      source: "Management Review",
      categories: ["Business", "Information Security"],
      objective: "Transition to ISO27001 2022",
      target: "To certify to new ISO27001 2022 V",
      resourcesRequired: "IT Management system New documentation",
      progressToDate: "Looking at a suitable date to start transition",
      who: "MD",
      dueDate: new Date("2025-03-15"),
      likelihood: 1,
      severity: 5,
      riskLevel: 5,
      completed: false,
      createdById: admin.id,
    },
    {
      source: "Management Review",
      categories: ["Quality"],
      objective: "New business",
      target: "TO obtain new contracts with clients",
      resourcesRequired: "Tenders IT Resources Correct infrastructure",
      progressToDate: "Up-grading current warhouse to meet the requirments of a current tender bid.",
      who: "MD",
      dueDate: new Date("2025-03-15"),
      likelihood: 2,
      severity: 4,
      riskLevel: 8,
      completed: false,
      createdById: admin.id,
    },
    {
      source: "Management Review",
      categories: ["Business", "Quality", "Environmental", "Information Security", "Health and Safety"],
      objective: "Implement an integrated management system to ISO 9001, ISO 13485 and ISO 27001",
      target: "Attain certification to the standards from a UKAS accredited certification body",
      resourcesRequired: "External Consultancy Certification Body",
      progressToDate: "Successful certification to ISO9001 & ISO13485 achieved Stage 1 to ISO27001 completed with 29 AoC however many of these areas had been deemed as compliant under 4 previous audits. Stage 2 booked for 24-26th August",
      who: "Managing Director",
      dueDate: new Date("2022-09-30"),
      likelihood: 3,
      severity: 3,
      riskLevel: 9,
      completed: true,
      dateCompleted: new Date("2022-08-30"),
      createdById: admin.id,
    },
    {
      source: "Management Review",
      categories: ["Quality"],
      objective: "Increase Awareness of ISO 9001 and Quality Management System",
      target: "Complete ISO awareness training for all members of staff.",
      resourcesRequired: "Training materials.",
      progressToDate: "Policy awareness provided will need some additional awareness sessions after certification to maintain awareness.",
      who: "Managing Director",
      dueDate: new Date("2024-01-31"),
      likelihood: 2,
      severity: 3,
      riskLevel: 6,
      completed: true,
      dateCompleted: new Date("2023-12-15"),
      createdById: admin.id,
    },
  ];

  for (const objective of objectives) {
    await prisma.objective.create({
      data: objective,
    });
  }

  // Add sample maintenance items
  console.log("Creating maintenance items...");

  const maintenanceItems = [
    {
      name: "Portable Appliance Testing",
      category: "Maintenance",
      subCategory: "Electrical Testing",
      supplier: "L R & Son Electrical",
      serialNumber: "",
      reference: "",
      actionRequired: "Portable Appliance Testing",
      frequency: "Two Yearly",
      dueDate: new Date("2023-10-07"),
      owner: "Kulvinder Bhullar",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
    {
      name: "Pest and Vermin Control",
      category: "Maintenance",
      subCategory: "Pest Control",
      supplier: "Glen Pest Control Services",
      serialNumber: "",
      reference: "",
      actionRequired: "Quarterly Pest and Vermin Control visit.",
      frequency: "Quarterly",
      dueDate: new Date("2024-01-30"),
      owner: "Kulvinder Bhullar",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
    {
      name: "Renew Insurance",
      category: "Maintenance",
      subCategory: "Insurance",
      supplier: "",
      serialNumber: "",
      reference: "Legal Register - Workers and Employees",
      actionRequired: "Renew insurance and update on legal register.",
      frequency: "Yearly",
      dueDate: new Date("2024-07-31"),
      owner: "MD",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
    {
      name: "Motor Vehicle Insurance",
      category: "Maintenance",
      subCategory: "Insurance",
      supplier: "Signature Underwriting",
      serialNumber: "T90340000123",
      reference: "",
      actionRequired: "Renewal",
      frequency: "Yearly",
      dueDate: new Date("2025-01-31"),
      owner: "Kulvinder Bhullar",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
    {
      name: "Fire Extinguishers",
      category: "Maintenance",
      subCategory: "Fire Safety",
      supplier: "Fire Point Services Limited",
      serialNumber: "",
      reference: "",
      actionRequired: "Maintenance and Inspection of Fire Extinguishers in accordance with BS 5306: Part 3.",
      frequency: "Yearly",
      dueDate: new Date("2025-03-30"),
      owner: "Kulvinder Bhullar",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
    {
      name: "Ubibot GST1A",
      category: "Calibration",
      subCategory: "Temperature Sensors",
      supplier: "Dalian Cloud Force Technologies Co Ltd",
      serialNumber: "5QQ9M465DS1",
      reference: "C162086",
      actionRequired: "Three Yearly calibration Required",
      frequency: "ThreeYearly",
      dueDate: new Date("2025-05-15"),
      owner: "Kulvinder Bhullar",
      allocatedTo: "",
      completed: false,
      createdById: admin.id,
    },
  ];

  for (const item of maintenanceItems) {
    await prisma.maintenance.create({
      data: item,
    });
  }

  // Create improvement register entries
  console.log("Creating improvement register entries...")

  const improvementRegister1 = await prisma.improvementRegister.create({
    data: {
      number: 86,
      category: "Improvement Suggestion",
      type: "OFI",
      description: "All procedures require reviewing and re-writing.",
      originator: "",
      evaluatedForSimilar: false,
      requiresRiskAnalysis: false,
      affectedPolicies: false,
      justified: true,
      containmentAction: "",
      rootCauseType: "Other",
      rootCause:
        "Due to the development of the business, the procedures no longer match how AA Xpress maintains quality.",
      correctiveAction: "",
      comments: "",
      internalOwnerId: admin.id,
      dateRaised: new Date("2024-04-23"),
      dateDue: new Date("2024-09-30"),
      likelihoodRating: 3,
      severityRating: 4,
      restrictedAccess: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const improvementRegister2 = await prisma.improvementRegister.create({
    data: {
      number: 87,
      category: "Process Issue",
      type: "Non Conformance",
      description:
        "Not all employees are entered on the training module and not all training material has been loaded on to each employee when training has been conducted.",
      originator: "",
      evaluatedForSimilar: false,
      requiresRiskAnalysis: false,
      affectedPolicies: false,
      justified: false,
      containmentAction: "",
      rootCauseType: "Human Error",
      rootCause: "There has been a separate training matrix updated and it hasn't been moved over to business smart suite.",
      correctiveAction: "",
      comments: "",
      internalOwnerId: user.id,
      internalRaisedById: admin.id,
      dateRaised: new Date("2024-05-16"),
      dateDue: new Date("2024-09-30"),
      likelihoodRating: 2,
      severityRating: 3,
      restrictedAccess: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Add some completed entries
  for (let i = 1; i <= 10; i++) {
    await prisma.improvementRegister.create({
      data: {
        number: i,
        category: i % 3 === 0 ? "External Audit" : i % 2 === 0 ? "Management Review" : "Internal Audit",
        type: i % 2 === 0 ? "Non Conformance" : "OFI",
        description: `Sample completed improvement register item ${i}`,
        originator: "Sample originator",
        evaluatedForSimilar: i % 2 === 0,
        requiresRiskAnalysis: i % 3 === 0,
        affectedPolicies: i % 4 === 0,
        justified: true,
        containmentAction: "Sample containment action",
        rootCauseType:
          i % 4 === 0 ? "Human Error" : i % 3 === 0 ? "Management Error" : i % 2 === 0 ? "Software" : "Materials",
        rootCause: "Sample root cause description",
        correctiveAction: "Sample corrective action",
        comments: "Sample comments",
        internalOwnerId: i % 2 === 0 ? admin.id : user.id,
        internalRaisedById: i % 2 === 0 ? user.id : admin.id,
        dateRaised: new Date(2022, 2, 18), // March 18, 2022
        dateDue: new Date(2022, 3, 30), // April 30, 2022
        dateActionTaken: new Date(2022, 3, 15), // April 15, 2022
        likelihoodRating: (i % 5) + 1,
        severityRating: (i % 5) + 1,
        restrictedAccess: i % 3 === 0,
        restrictedUsers: i % 3 === 0 ? [admin.id, user.id] : [],
        dateCompleted: new Date(2022, 4, 15), // May 15, 2022
        completedById: i % 2 === 0 ? admin.id : user.id,
        effectivenessOfAction: "Sample effectiveness description",
        cost: i * 100,
        createdAt: new Date(2022, 2, 18),
        updatedAt: new Date(2022, 4, 15),
      },
    })
  }

// Statement of Applicability Controls
  console.log("Creating Statement of Applicability controls...");

  // A.5 Organisational Controls
  const organisationalControls = [
    {
      clause: "A.5.1",
      title: "Policies for information security",
      description: "Control – Information security policy and topic specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.",
      section: "A.5 Organisational Controls",
      order: 1
    },
    {
      clause: "A.5.2",
      title: "Information security roles and responsibilities",
      description: "Control – Information security roles and responsibilities shall be defined and allocated according to organisation needs.",
      section: "A.5 Organisational Controls",
      order: 2
    },
    {
      clause: "A.5.3",
      title: "Segregation of duties",
      description: "Control – Conflicting duties and conflicting areas of responsibility shall be segregated.",
      section: "A.5 Organisational Controls",
      order: 3
    },
    {
      clause: "A.5.4",
      title: "Management responsibilities",
      description: "Control – Management shall require all personnel to apply information security in accordance with the established information security policy, topic specific policies and procedures of the organisation.",
      section: "A.5 Organisational Controls",
      order: 4
    },
    {
      clause: "A.5.5",
      title: "Contact with authorities",
      description: "Control – The organisation shall establish and maintain contact with relevant authorities.",
      section: "A.5 Organisational Controls",
      order: 5
    },
    {
      clause: "A.5.6",
      title: "Contact with special interest groups",
      description: "Control – The organisation shall establish and maintain contact with special interest groups or other specialist security forums and professional associations.",
      section: "A.5 Organisational Controls",
      order: 6
    },
    {
      clause: "A.5.7",
      title: "Threat intelligence",
      description: "Control – Information relating to information security threats shall be collected and analysed to produce threat intelligence.",
      section: "A.5 Organisational Controls",
      order: 7
    },
    {
      clause: "A.5.8",
      title: "Information security in project management",
      description: "Control – Information security shall be integrated into project management.",
      section: "A.5 Organisational Controls",
      order: 8
    },
    {
      clause: "A.5.9",
      title: "Inventory of information and other associated assets",
      description: "Control – An inventory of information and other associated assets, including owners, shall be developed and maintained.",
      section: "A.5 Organisational Controls",
      order: 9
    },
    {
      clause: "A.5.10",
      title: "Acceptable use of information and other associated assets",
      description: "Control – Rules for the acceptable use and procedures for handling information and other associated assets shall be identified, documented and implemented.",
      section: "A.5 Organisational Controls",
      order: 10
    },
    {
      clause: "A.5.11",
      title: "Return of assets",
      description: "Control – Personnel and other interested parties as appropriate shall return all the organisation's assets in their possession upon change or termination of their employment, contract or agreement.",
      section: "A.5 Organisational Controls",
      order: 11
    },
    {
      clause: "A.5.12",
      title: "Classification of information",
      description: "Control – Information shall be classified according to the information security needs of the organisation based on confidentiality, integrity, availability and relevant interested party requirements.",
      section: "A.5 Organisational Controls",
      order: 12
    },
    {
      clause: "A.5.13",
      title: "Labelling of information",
      description: "Control – An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organisation.",
      section: "A.5 Organisational Controls",
      order: 13
    },
    {
      clause: "A.5.14",
      title: "Information transfer",
      description: "Control – Information transfer rules, procedures or agreements shall be in place for all types of transfer facilities within the organisation and between the organisation and other parties.",
      section: "A.5 Organisational Controls",
      order: 14
    },
    {
      clause: "A.5.15",
      title: "Access control",
      description: "Control – Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.",
      section: "A.5 Organisational Controls",
      order: 15
    },
    {
      clause: "A.5.16",
      title: "Identity management",
      description: "Control – The full life cycle of identities shall be managed.",
      section: "A.5 Organisational Controls",
      order: 16
    },
    {
      clause: "A.5.17",
      title: "Authentication information",
      description: "Control – Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.",
      section: "A.5 Organisational Controls",
      order: 17
    },
    {
      clause: "A.5.18",
      title: "Access rights",
      description: "Control – Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed in accordance with the organisation's topic-specific policy on and rules for access control.",
      section: "A.5 Organisational Controls",
      order: 18
    },
    {
      clause: "A.5.19",
      title: "Information security in supplier relationships",
      description: "Control – Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier's products or services.",
      section: "A.5 Organisational Controls",
      order: 19
    },
    {
      clause: "A.5.20",
      title: "Addressing information security within supplier agreements",
      description: "Control – Relevant information security requirements shall be established and agreed with each supplier based on the type of supplier relationship.",
      section: "A.5 Organisational Controls",
      order: 20
    },
    {
      clause: "A.5.21",
      title: "Managing information security in the information and communication technology (ICT) supply chain",
      description: "Control – Processes and procedures shall be defined and implemented to manage the information security risks associated with the ICT products and services supply chain.",
      section: "A.5 Organisational Controls",
      order: 21
    },
    {
      clause: "A.5.22",
      title: "Monitoring, review and change management of supplier services",
      description: "Control – The organisation shall regularly monitor, review, evaluate and manage change in supplier information security practices and service delivery.",
      section: "A.5 Organisational Controls",
      order: 22
    },
    {
      clause: "A.5.23",
      title: "Information security for use of cloud services",
      description: "Control – Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organisation's information security requirements.",
      section: "A.5 Organisational Controls",
      order: 23
    },
    {
      clause: "A.5.24",
      title: "Information security incident management planning and preparation",
      description: "Control – The organisation shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.",
      section: "A.5 Organisational Controls",
      order: 24
    },
    {
      clause: "A.5.25",
      title: "Assessment and decision on information security events",
      description: "Control – The organisation shall assess information security events and decide if they are to be categorised as information security incidents.",
      section: "A.5 Organisational Controls",
      order: 25
    },
    {
      clause: "A.5.26",
      title: "Response to information security incidents",
      description: "Control – Information security incidents shall be responded to in accordance with the documented procedures.",
      section: "A.5 Organisational Controls",
      order: 26
    },
    {
      clause: "A.5.27",
      title: "Learning from information security incidents",
      description: "Control – Knowledge gained from information security incidents shall be used to strengthen and improve the information security controls.",
      section: "A.5 Organisational Controls",
      order: 27
    },
    {
      clause: "A.5.28",
      title: "Collection of evidence",
      description: "Control – The organisation shall establish and implement procedures for the identification, collection, acquisition and preservation of evidence related to information security events.",
      section: "A.5 Organisational Controls",
      order: 28
    },
    {
      clause: "A.5.29",
      title: "Information security during disruption",
      description: "Control – The organisation shall plan how to maintain information security at an appropriate level during disruption.",
      section: "A.5 Organisational Controls",
      order: 29
    },
    {
      clause: "A.5.30",
      title: "ICT readiness for business continuity",
      description: "Control – ICT readiness shall be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.",
      section: "A.5 Organisational Controls",
      order: 30
    },
    {
      clause: "A.5.31",
      title: "Legal, statutory, regulatory and contractual requirements",
      description: "Control – Legal, statutory, regulatory and contractual requirements relevant to information security and the organisation's approach to meet these requirements shall be identified, documented and kept up to date.",
      section: "A.5 Organisational Controls",
      order: 31
    },
    {
      clause: "A.5.32",
      title: "Intellectual property rights",
      description: "Control – The organisation shall implement appropriate procedures to protect intellectual property rights.",
      section: "A.5 Organisational Controls",
      order: 32
    },
    {
      clause: "A.5.33",
      title: "Protection of records",
      description: "Control – Records shall be protected from loss, destruction, falsification, unauthorised access and unauthorised release.",
      section: "A.5 Organisational Controls",
      order: 33
    },
    {
      clause: "A.5.34",
      title: "Privacy and protection of personal identifiable information (PII)",
      description: "Control – The organisation shall identify and meet the requirements regarding the preservation of privacy and protection of PII according to applicable laws and regulations and contractual requirements.",
      section: "A.5 Organisational Controls",
      order: 34
    },
    {
      clause: "A.5.35",
      title: "Independent review of information security",
      description: "Control – The organisation's approach to managing information security and its implementation including people, processes and technologies shall be reviewed independently at planned intervals, or when significant changes occur.",
      section: "A.5 Organisational Controls",
      order: 35
    },
    {
      clause: "A.5.36",
      title: "Compliance with policies, rules and standards for information security",
      description: "Control – Compliance with the organisation's information security policy, topic specific policies, rules and standards shall be regularly reviewed.",
      section: "A.5 Organisational Controls",
      order: 36
    },
    {
      clause: "A.5.37",
      title: "Documented operating procedures",
      description: "Control – Operating procedures for information processing facilities shall be documented and made available to personnel who need them.",
      section: "A.5 Organisational Controls",
      order: 37
    },
  ];

  // A.6 People Control
  const peopleControls = [
    {
      clause: "A.6.1",
      title: "Screening",
      description: "Control – Background verification checks on all candidates become personnel shall be carried out prior to joining the organisation and on an ongoing basis taking into consideration applicable laws, regulations and ethics and be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.",
      section: "A.6 People Control",
      order: 1
    },
    {
      clause: "A.6.2",
      title: "Terms and conditions of employment",
      description: "Control – The employment contractual agreements shall state the personnel's and the organisation's responsibilities for information security.",
      section: "A.6 People Control",
      order: 2
    },
    {
      clause: "A.6.3",
      title: "Information security awareness, education and training",
      description: "Control – Personnel of the organisation and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates of the organisation's information security policy. Topic specific policies and procedures, as relevant for their job function.",
      section: "A.6 People Control",
      order: 3
    },
    {
      clause: "A.6.4",
      title: "Disciplinary process",
      description: "Control – A disciplinary process shall be formalised and communicated to take actions against personnel and other relevant interested parties who have committed an information security policy violation.",
      section: "A.6 People Control",
      order: 4
    },
    {
      clause: "A.6.5",
      title: "Responsibilities after termination or change of employment",
      description: "Control – Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, enforced and communicated to relevant personnel and other interested parties.",
      section: "A.6 People Control",
      order: 5
    },
    {
      clause: "A.6.6",
      title: "Confidentiality or non-disclosure agreements",
      description: "Control – Confidentiality or non-disclosure agreements reflecting the organisation's needs for the protection of information shall be identified, documented, regularly reviewed and signed by personnel and other relevant interested parties.",
      section: "A.6 People Control",
      order: 6
    },
    {
      clause: "A.6.7",
      title: "Remote working",
      description: "Control – Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organisation's premises.",
      section: "A.6 People Control",
      order: 7
    },
    {
      clause: "A.6.8",
      title: "Information security event reporting",
      description: "Control – The organisation shall provide a mechanism for personnel to report observed or suspected information security events through appropriate channels in a timely manner.",
      section: "A.6 People Control",
      order: 8
    },
  ];

  // A.7 Physical Controls
  const physicalControls = [
    {
      clause: "A.7.1",
      title: "Physical security perimeters",
      description: "Control – Security perimeters shall be defined and used to protect areas that contain information and other associated assets.",
      section: "A.7 Physical Controls",
      order: 1
    },
    {
      clause: "A.7.2",
      title: "Physical entry",
      description: "Control – Secure areas shall be protected by appropriate entry controls and access points.",
      section: "A.7 Physical Controls",
      order: 2
    },
    {
      clause: "A.7.3",
      title: "Securing offices, rooms and facilities",
      description: "Control – Physical security for offices, rooms and facilities shall be designed and implemented.",
      section: "A.7 Physical Controls",
      order: 3
    },
    {
      clause: "A.7.4",
      title: "Physical security monitoring",
      description: "Control – Premises shall be continuously monitored for unauthorised physical access.",
      section: "A.7 Physical Controls",
      order: 4
    },
    {
      clause: "A.7.5",
      title: "Protecting against physical and environmental threats",
      description: "Control – Protection against physical and environmental threats, such as natural disasters and other intentional or unintentional physical threats to infrastructure shall be designed and implemented.",
      section: "A.7 Physical Controls",
      order: 5
    },
    {
      clause: "A.7.6",
      title: "Working in secure areas",
      description: "Control – Security measures for working in secure areas shall be designed and implemented.",
      section: "A.7 Physical Controls",
      order: 6
    },
    {
      clause: "A.7.7",
      title: "Clear desk and clear screen",
      description: "Control – Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities shall be defined and appropriately enforced.",
      section: "A.7 Physical Controls",
      order: 7
    },
    {
      clause: "A.7.8",
      title: "Equipment siting and protection",
      description: "Control – Equipment shall be sited securely and protected.",
      section: "A.7 Physical Controls",
      order: 8
    },
    {
      clause: "A.7.9",
      title: "Security of assets off-premises",
      description: "Control – Off-site assets shall be protected.",
      section: "A.7 Physical Controls",
      order: 9
    },
    {
      clause: "A.7.10",
      title: "Storage media",
      description: "Control – Storage media shall be manged through their life cycle of acquisition, use, transportation and disposal in accordance with the organisation's classification scheme and handling requirements.",
      section: "A.7 Physical Controls",
      order: 10
    },
    {
      clause: "A.7.11",
      title: "Supporting utilities",
      description: "Control – Information processing facilities shall be protected from power failures and other disruptions caused by failures in supporting utilities.",
      section: "A.7 Physical Controls",
      order: 11
    },
    {
      clause: "A.7.12",
      title: "Cabling security",
      description: "Control – Cables carrying power, data or supporting information services shall be protected from interception, interference or damage.",
      section: "A.7 Physical Controls",
      order: 12
    },
    {
      clause: "A.7.13",
      title: "Equipment maintenance",
      description: "Control – Equipment shall be maintained correctly to ensure availability, integrity and confidentiality of information.",
      section: "A.7 Physical Controls",
      order: 13
    },
    {
      clause: "A.7.14",
      title: "Secure disposal or re-use of equipment",
      description: "Control – Items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use.",
      section: "A.7 Physical Controls",
      order: 14
    },
  ];

  // A.8 Technological Controls
  const technologicalControls = [
    {
      clause: "A.8.1",
      title: "User end point devices",
      description: "Control – Information stored on, processed be or accessible via user end point devices shall be protected.",
      section: "A.8 Technological Controls",
      order: 1
    },
    {
      clause: "A.8.2",
      title: "Privileged access rights",
      description: "Control – The allocation and use of privileged access rights shall be restricted and managed.",
      section: "A.8 Technological Controls",
      order: 2
    },
    {
      clause: "A.8.3",
      title: "Information access restriction",
      description: "Control – Access to information and other associated assets shall be restricted in accordance with the established topic specific policy on access control.",
      section: "A.8 Technological Controls",
      order: 3
    },
    {
      clause: "A.8.4",
      title: "Access to source code",
      description: "Control – Read and write access to source code, development tools and software libraries shall be appropriately managed.",
      section: "A.8 Technological Controls",
      order: 4
    },
    {
      clause: "A.8.5",
      title: "Secure authentication",
      description: "Control – Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic specific policy on access control.",
      section: "A.8 Technological Controls",
      order: 5
    },
    {
      clause: "A.8.6",
      title: "Capacity management",
      description: "Control – The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.",
      section: "A.8 Technological Controls",
      order: 6
    },
    {
      clause: "A.8.7",
      title: "Protection against malware",
      description: "Control – Protection against malware shall be implemented and supported by appropriate user awareness.",
      section: "A.8 Technological Controls",
      order: 7
    },
    {
      clause: "A.8.8",
      title: "Management of technical vulnerabilities",
      description: "Control – Information about technical vulnerabilities of information systems in use shall be obtained, the organisation's exposure to such vulnerabilities shall be evaluated and appropriate measures shall be taken.",
      section: "A.8 Technological Controls",
      order: 8
    },
    {
      clause: "A.8.9",
      title: "Configuration management",
      description: "Control – Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.",
      section: "A.8 Technological Controls",
      order: 9
    },
    {
      clause: "A.8.10",
      title: "Information deletion",
      description: "Control – Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.",
      section: "A.8 Technological Controls",
      order: 10
    },
    {
      clause: "A.8.11",
      title: "Data masking",
      description: "Control – Data masking shall be used in accordance with the organisation's topic specific policy on access control and other related topic specific related policies, and business requirements, taking applicable legislation into consideration.",
      section: "A.8 Technological Controls",
      order: 11
    },
    {
      clause: "A.8.12",
      title: "Data leakage prevention",
      description: "Control – Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.",
      section: "A.8 Technological Controls",
      order: 12
    },
    {
      clause: "A.8.13",
      title: "Information backup",
      description: "Control – Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic specific policy in backup.",
      section: "A.8 Technological Controls",
      order: 13
    },
    {
      clause: "A.8.14",
      title: "Redundancy of information processing facilities",
      description: "Control – Information processing facilities shall be implemented with redundancy sufficient to meet availability requirements.",
      section: "A.8 Technological Controls",
      order: 14
    },
    {
      clause: "A.8.15",
      title: "Logging",
      description: "Control – Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analysed.",
      section: "A.8 Technological Controls",
      order: 15
    },
    {
      clause: "A.8.16",
      title: "Monitoring activities",
      description: "Control – Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.",
      section: "A.8 Technological Controls",
      order: 16
    },
    {
      clause: "A.8.17",
      title: "Clock synchronisation",
      description: "Control – The clocks of information processing systems used by the organisation shall be synchronised to approved time sources.",
      section: "A.8 Technological Controls",
      order: 17
    },
    {
      clause: "A.8.18",
      title: "Use of privileged utility programs",
      description: "Control – The use of utility programs that can be capable of overriding system and application controls shall be restricted and tightly controlled.",
      section: "A.8 Technological Controls",
      order: 18
    },
    {
      clause: "A.8.19",
      title: "Installation of software on operational systems",
      description: "Control – Procedures and measures shall be implemented to securely manage software installation on operational systems.",
      section: "A.8 Technological Controls",
      order: 19
    },
    {
      clause: "A.8.20",
      title: "Networks security",
      description: "Control – Networks and network devices shall be secured, managed and controlled to protect information in systems and applications.",
      section: "A.8 Technological Controls",
      order: 20
    },
    {
      clause: "A.8.21",
      title: "Security of network services",
      description: "Control – Security mechanisms, service levels and service requirements of network services shall be identified, implemented and monitored.",
      section: "A.8 Technological Controls",
      order: 21
    },
    {
      clause: "A.8.22",
      title: "Segregation of networks",
      description: "Control – Groups of information services, users and information systems shall be segregated in the organisation's networks.",
      section: "A.8 Technological Controls",
      order: 22
    },
    {
      clause: "A.8.23",
      title: "Web filtering",
      description: "Control – Access to external websites shall be managed to reduce exposure to malicious content.",
      section: "A.8 Technological Controls",
      order: 23
    },
    {
      clause: "A.8.24",
      title: "Use of cryptography",
      description: "Control – Rules for the effective use of cryptography, including cryptographic key management, shall be defined and applied.",
      section: "A.8 Technological Controls",
      order: 24
    },
    {
      clause: "A.8.25",
      title: "Secure development life cycle",
      description: "Control – Rules for the secure development of software and systems shall be established and applied.",
      section: "A.8 Technological Controls",
      order: 25
    },
    {
      clause: "A.8.26",
      title: "Application security requirements",
      description: "Control – Information security requirements shall be identified, specified and approved when developing or acquiring applications.",
      section: "A.8 Technological Controls",
      order: 26
    },
    {
      clause: "A.8.27",
      title: "Secure system architecture and engineering principles",
      description: "Control – Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.",
      section: "A.8 Technological Controls",
      order: 27
    },
    {
      clause: "A.8.28",
      title: "Secure coding",
      description: "Control – Secure coding principles shall be applied to software development.",
      section: "A.8 Technological Controls",
      order: 28
    },
    {
      clause: "A.8.29",
      title: "Security testing in development and acceptance",
      description: "Control – Security testing processes shall be defined and implemented in the development life cycle.",
      section: "A.8 Technological Controls",
      order: 29
    },
    {
      clause: "A.8.30",
      title: "Outsourced development",
      description: "Control – The organisation shall direct, monitor and review the activities related to outsourced system development.",
      section: "A.8 Technological Controls",
      order: 30
    },
    {
      clause: "A.8.31",
      title: "Separation of development, test and production environments",
      description: "Control – Development, testing and production environments shall be separated and secured.",
      section: "A.8 Technological Controls",
      order: 31
    },
    {
      clause: "A.8.32",
      title: "Change management",
      description: "Control – Changes to information processing facilities and information systems shall be subject to change management procedures.",
      section: "A.8 Technological Controls",
      order: 32
    },
    {
      clause: "A.8.33",
      title: "Test information",
      description: "Control – Test information shall be appropriately selected, protected and managed.",
      section: "A.8 Technological Controls",
      order: 33
    },
    {
      clause: "A.8.34",
      title: "Protection of information systems during audit testing",
      description: "Control – Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.",
      section: "A.8 Technological Controls",
      order: 34
    },
  ];

  // Insert all controls
  for (const control of organisationalControls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control
    });
  }

  for (const control of peopleControls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control
    });
  }

  for (const control of physicalControls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control
    });
  }

  for (const control of technologicalControls) {
    await prisma.statementOfApplicabilityControl.create({
      data: control
    });
  }

  // Create suppliers
  console.log("Creating suppliers...");

  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Business Smart Suite Group",
      provisionOf: "Training and Consultancy",
      certifications: "ISO 9001: 2015\nISO 14001: 2015\nISO 45001; 2018\nCyber Essentials",
      contactName: "John Keen",
      address: "17 The Pavilions\nAvroe Crescent\nBlackpool\nFY4 2DP",
      contactNumber: "0844 815 77 65",
      website: "www.businessmartsuite.co.uk",
      dateAdded: new Date("2021-11-12"),
      reviewFrequency: "2 years",
      lastReviewDate: new Date("2023-12-27"),
      lastReviewedBy: "Kulvinder Bhullar (info@aaxpress.co.uk)",
      riskLikelihood: 1,
      riskSeverity: 1,
      controlsRecommendations: "Ensure certification current",
      residualLikelihood: 1,
      residualSeverity: 1,
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "ACS Technologies",
      provisionOf: "Closed Circuit Television",
      certifications: "NSI Electronic Security Systems - Nacoss Gold - Expires: 23-Nov-2024",
      contactName: "Mathew Jefferson",
      address: "27 Sedling Road\nWear East Industrial Estate\nWashington\nNE38 9BZ",
      contactNumber: "0191 417 8882",
      dateAdded: new Date("2022-03-15"),
      riskLikelihood: 1,
      riskSeverity: 1,
      controlsRecommendations: "Ensure company certification current.\nExpiry 23/11/2024",
      residualLikelihood: 1,
      residualSeverity: 1,
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "Glen Pest Control Services",
      provisionOf: "Vermin and Pest Control.",
      certifications: "British Pest Control Association Certificate",
      contactName: "Russ Woodward",
      address: "66 Glen Street\nHebburn\nTyne and Wear\nNE31 1NG",
      contactNumber: "0191 489 9881",
      dateAdded: new Date("2021-12-03"),
      riskLikelihood: 3,
      riskSeverity: 3,
      controlsRecommendations: "See Pest Control File",
      residualLikelihood: 1,
      residualSeverity: 3,
    },
  });

  // Create supplier version history
  await prisma.supplierVersion.create({
    data: {
      number: 1,
      date: new Date("2022-03-09"),
      details: "Initial version",
      updatedBy: "System",
    },
  });

  // Add this new function before main().catch()

  console.log("Seeding procedures...");

  // Create procedure categories
  const managementProcedures = await prisma.procedureCategory.create({
    data: {
      title: "Management Procedures",
      order: 1,
    },
  });

  const operationalProcedures = await prisma.procedureCategory.create({
    data: {
      title: "Operational Procedures",
      order: 2,
    },
  });

  const healthSafetyProcedures = await prisma.procedureCategory.create({
    data: {
      title: "Health & Safety Procedures",
      order: 3,
    },
  });

  // Get admin user
  const adminUser = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  if (!adminUser) {
    throw new Error("Admin user not found")
  };

  // Create procedures
  await prisma.procedure.create({
    data: {
      title: "01 Document Control Procedure",
      version: "3",
      issueDate: new Date("2023-01-15"),
      location: "IMS",
      content: "This procedure outlines the process for controlling documents within the organization.",
      categoryId: managementProcedures.id,
      createdById: adminUser.id,
      order: 1,
      approved: true,
    },
  });

  // Create COSHH
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

  // Create Corrective Actions
  console.log("Creating Corrective Actions...")
  const correctiveActionCategory = await prisma.correctiveActionCategory.create({
    data: {
      title: "General Corrective Actions",
      order: 1,
    },
  })

  await prisma.correctiveAction.create({
    data: {
      title: "Initial Corrective Action",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: correctiveActionCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Create HSE Guidance
  console.log("Creating HSE Guidance...")
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

  // Create Risk Assessments
  console.log("Creating Risk Assessments...")
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

  // Create Work Instructions
  console.log("Creating Work Instructions...")
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

  // Create Job Descriptions
  console.log("Creating Job Descriptions...")
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

  // Create Business Continuity
  console.log("Creating Business Continuity...")
  const businessContinuityCategory = await prisma.businessContinuityCategory.create({
    data: {
      title: "General Business Continuity",
      order: 1,
    },
  })

  await prisma.businessContinuity.create({
    data: {
      title: "General Business Continuity Plan",
      version: "1.0",
      issueDate: new Date(),
      location: "IMS",
      categoryId: businessContinuityCategory.id,
      createdById: admin.id,
      order: 1,
    },
  })

  // Create Management Review
  console.log("Creating Management Review...")
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

  console.log("Database has been seeded!")

  // Create roles and permissions
  console.log("Creating roles and permissions...")
  
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
    },
  })

  const writeRole = await prisma.role.upsert({
    where: { name: "write" },
    update: {},
    create: {
      name: "write",
      description: "Can create and edit content",
    },
  })

  const deleteRole = await prisma.role.upsert({
    where: { name: "delete" },
    update: {},
    create: {
      name: "delete",
      description: "Can delete content",
    },
  })

  // Create permissions for admin
  const systems = [
    "policies",
    "manuals",
    "procedures",
    "forms",
    "certificates",
    "corrective-actions",
    "business-continuity",
    "management-review",
    "job-descriptions",
    "work-instructions",
    "coshh",
    "risk-assessments",
    "hse-guidance",
    "technical-files",
    "environmental-guidance",
    "custom-sections",
    "registers",
    "legal-register",
    "training",
    "maintenance",
    "improvement-register",
    "objectives",
    "organizational-context",
    "interested-parties",
    "audit-schedule",
    "suppliers",
    "statement-of-applicability"
  ]

  // Delete existing permissions for admin to avoid duplicates
  await prisma.permission.deleteMany({
    where: { userId: admin.id },
  })

  // Create permissions for each system with both write and delete roles
  for (const system of systems) {
    // Add write permission
    await prisma.permission.create({
      data: {
        userId: admin.id,
        systemId: system,
        roleId: writeRole.id,
        createdBy: admin.id,
      },
    })

    // Add delete permission
    await prisma.permission.create({
      data: {
        userId: admin.id,
        systemId: system,
        roleId: deleteRole.id,
        createdBy: admin.id,
      },
    })
  }

  // Create admin group if it doesn't exist
  const adminGroup = await prisma.group.upsert({
    where: { name: "Administrators" },
    update: {},
    create: {
      name: "Administrators",
      description: "System administrators group",
    },
  })

  // Add admin to admin group if not already added
  await prisma.userGroup.upsert({
    where: {
      userId_groupId: {
        userId: admin.id,
        groupId: adminGroup.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      groupId: adminGroup.id,
      addedBy: admin.id,
    },
  })

  // Delete existing group permissions to avoid duplicates
  await prisma.groupPermission.deleteMany({
    where: { groupId: adminGroup.id },
  })

  // Add group permissions for each system with both write and delete roles
  for (const system of systems) {
    // Add write permission
    await prisma.groupPermission.create({
      data: {
        groupId: adminGroup.id,
        systemId: system,
        roleId: writeRole.id,
        createdBy: admin.id,
      },
    })

    // Add delete permission
    await prisma.groupPermission.create({
      data: {
        groupId: adminGroup.id,
        systemId: system,
        roleId: deleteRole.id,
        createdBy: admin.id,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })