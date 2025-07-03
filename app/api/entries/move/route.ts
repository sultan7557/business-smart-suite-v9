// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import type { Prisma } from "@prisma/client";

// // Section field mapping: required fields and defaults for each section
// const sectionFieldMaps: Record<string, { fields: string[]; defaults: Record<string, any> }> = {
//   manuals: {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   policies: {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   procedures: {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   forms: {
//     fields: ["title", "version", "issueDate", "location", "retentionPeriod", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", retentionPeriod: "1 year", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   certificates: {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   "corrective-actions": {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   "business-continuity": {
//     fields: ["title", "version", "issueDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0 },
//   },
//   "management-reviews": {
//     fields: ["title", "version", "reviewDate", "location", "categoryId", "createdById", "order"],
//     defaults: { location: "IMS", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "job-descriptions": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "work-instructions": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "risk-assessments": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   coshh: {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   registers: {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "hse-guidance": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "technical-file": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
//   "environmental-guidance": {
//     fields: ["title", "version", "reviewDate", "department", "categoryId", "createdById", "order"],
//     defaults: { department: "General", content: null, highlighted: false, approved: false, archived: false, order: 0, nextReviewDate: null },
//   },
// };

// // Map section IDs to their corresponding Prisma models
// const sectionModels: Record<string, any> = {
//   manuals: prisma.manual,
//   policies: prisma.policy,
//   procedures: prisma.procedure,
//   forms: prisma.form,
//   certificates: prisma.certificate,
//   "corrective-actions": prisma.correctiveAction,
//   "business-continuity": prisma.businessContinuity,
//   "management-reviews": prisma.managementReview,
//   "job-descriptions": prisma.jobDescription,
//   "work-instructions": prisma.workInstruction,
//   "risk-assessments": prisma.riskAssessment,
//   coshh: prisma.cOSHH,
//   registers: prisma.register,
//   "hse-guidance": prisma.hseGuidance,
//   "technical-file": prisma.technicalFile,
//   "environmental-guidance": prisma.environmentalGuidance,
// };

// // Map section IDs to their version models
// const versionModels: Record<string, string> = {
//   manuals: "manualVersion",
//   policies: "policyVersion",
//   procedures: "procedureVersion",
//   forms: "formVersion",
//   certificates: "certificateVersion",
//   "corrective-actions": "correctiveActionVersion",
//   "business-continuity": "businessContinuityVersion",
//   "management-reviews": "managementReviewVersion",
//   "job-descriptions": "jobDescriptionVersion",
//   "work-instructions": "workInstructionVersion",
//   "risk-assessments": "riskAssessmentVersion",
//   coshh: "cOSHHVersion",
//   registers: "registerVersion",
//   "hse-guidance": "hseGuidanceVersion",
//   "technical-file": "technicalFileVersion",
//   "environmental-guidance": "environmentalGuidanceVersion",
// };

// // Map section IDs to their review models
// const reviewModels: Record<string, any> = {
//   manuals: prisma.manualReview,
//   procedures: prisma.procedureReview,
//   forms: prisma.formReview,
//   certificates: prisma.certificateReview,
//   "corrective-actions": prisma.correctiveActionReview,
//   "business-continuity": prisma.businessContinuityReview,
//   "management-reviews": prisma.managementReviewReview,
//   "job-descriptions": prisma.jobDescriptionReview,
//   "work-instructions": prisma.workInstructionReview,
//   "risk-assessments": prisma.riskAssessmentReview,
//   coshh: prisma.cOSHHReview,
//   registers: prisma.registerReview,
//   "hse-guidance": prisma.hseGuidanceReview,
//   "technical-file": prisma.technicalFileReview,
//   "environmental-guidance": prisma.environmentalGuidanceReview,
// };

// // Map section IDs to their category models
// const categoryModels: Record<string, any> = {
//   manuals: prisma.manualCategory,
//   policies: prisma.policyCategory,
//   procedures: prisma.procedureCategory,
//   forms: prisma.formCategory,
//   certificates: prisma.certificateCategory,
//   "corrective-actions": prisma.correctiveActionCategory,
//   "business-continuity": prisma.businessContinuityCategory,
//   "management-reviews": prisma.managementReviewCategory,
//   "job-descriptions": prisma.jobDescriptionCategory,
//   "work-instructions": prisma.workInstructionCategory,
//   "risk-assessments": prisma.riskAssessmentCategory,
//   coshh: prisma.cOSHHCategory,
//   registers: prisma.registerCategory,
//   "hse-guidance": prisma.hseGuidanceCategory,
//   "technical-file": prisma.technicalFileCategory,
//   "environmental-guidance": prisma.environmentalGuidanceCategory,
// };

// // Map section IDs to their version relationship fields
// const versionRelationshipFields: Record<string, string> = {
//   manuals: "manual",
//   policies: "policy",
//   procedures: "procedure",
//   forms: "form",
//   certificates: "certificate",
//   "corrective-actions": "correctiveAction",
//   "business-continuity": "businessContinuity",
//   "management-reviews": "managementReview",
//   "job-descriptions": "jobDescription",
//   "work-instructions": "workInstruction",
//   "risk-assessments": "riskAssessment",
//   coshh: "coshh",
//   registers: "register",
//   "hse-guidance": "hseGuidance",
//   "technical-file": "technicalFile",
//   "environmental-guidance": "environmentalGuidance",
// };

// // Required fields for each version model
// const versionRequiredFields: Record<string, string[]> = {
//   manuals: ["version", "issueDate"],
//   policies: ["version", "issueDate"],
//   procedures: ["version", "issueDate"],
//   forms: ["version", "issueDate"],
//   certificates: ["version", "issueDate"],
//   "corrective-actions": ["version", "issueDate"],
//   "business-continuity": ["version", "issueDate"],
//   "management-reviews": ["version", "reviewDate"],
//   "job-descriptions": ["version", "reviewDate"],
//   "work-instructions": ["version", "reviewDate"],
//   "risk-assessments": ["version", "reviewDate"],
//   coshh: ["version", "reviewDate"],
//   registers: ["version", "reviewDate"],
//   "hse-guidance": ["version", "reviewDate"],
//   "technical-file": ["version", "reviewDate"],
//   "environmental-guidance": ["version", "reviewDate"],
// };

// interface VersionRecord {
//   id: string;
//   version: string;
//   issueDate?: Date;
//   reviewDate?: Date;
//   notes?: string;
//   createdAt?: Date;
//   createdById: string;
//   documentId?: string;
//   [key: string]: any;
// }

// interface DocumentRecord {
//   id: string;
//   [key: string]: any;
// }

// interface ReviewRecord {
//   id: string;
//   [key: string]: any;
// }

// interface EntryRecord {
//   id: string;
//   versions?: VersionRecord[];
//   documents?: DocumentRecord[];
//   reviews?: ReviewRecord[];
//   [key: string]: any;
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     console.log("Move request body:", body);

//     const { entryId, currentSectionId, newSectionId, newCategoryId } = body;

//     // Validate required fields
//     if (!entryId || !currentSectionId || !newSectionId || !newCategoryId) {
//       console.error("Missing required fields:", { entryId, currentSectionId, newSectionId, newCategoryId });
//       return NextResponse.json(
//         { error: "Missing required fields: entryId, currentSectionId, newSectionId, and newCategoryId are required" },
//         { status: 400 }
//       );
//     }

//     // Validate section IDs
//     const validSections = Object.keys(sectionModels);
//     if (!validSections.includes(currentSectionId) || !validSections.includes(newSectionId)) {
//       console.error("Invalid section IDs:", { currentSectionId, newSectionId });
//       return NextResponse.json(
//         { error: `Invalid section ID: ${currentSectionId} or ${newSectionId}` },
//         { status: 400 }
//       );
//     }

//     // Validate entry ID format
//     if (typeof entryId !== "string" || entryId.length === 0) {
//       console.error("Invalid entry ID:", entryId);
//       return NextResponse.json({ error: "Invalid entry ID format" }, { status: 400 });
//     }

//     // Validate category ID
//     const categoryModel = categoryModels[newSectionId];
//     if (!categoryModel) {
//       console.error("No category model for section:", newSectionId);
//       return NextResponse.json({ error: `No category model defined for section: ${newSectionId}` }, { status: 400 });
//     }
//     const categoryExists = await categoryModel.findUnique({ where: { id: newCategoryId } });
//     if (!categoryExists) {
//       console.error("Invalid category ID:", newCategoryId, "for section:", newSectionId);
//       return NextResponse.json({ error: `Category ID ${newCategoryId} does not exist for section ${newSectionId}` }, { status: 400 });
//     }

//     const sourceModel = sectionModels[currentSectionId];
//     const targetModel = sectionModels[newSectionId];
//     const fieldMap = sectionFieldMaps[newSectionId];

//     if (!sourceModel || !targetModel || !fieldMap) {
//       console.error("Invalid model or field map:", { sourceModel, targetModel, fieldMap });
//       return NextResponse.json({ error: "Invalid section ID or configuration" }, { status: 400 });
//     }

//     // Define which sections have reviews
//     const sectionsWithReviews = [
//       "manuals",
//       "procedures",
//       "forms",
//       "certificates",
//       "corrective-actions",
//       "business-continuity",
//       "management-reviews",
//       "job-descriptions",
//       "work-instructions",
//       "risk-assessments",
//       "coshh",
//       "registers",
//       "hse-guidance",
//       "technical-file",
//       "environmental-guidance"
//     ];

//     // Create include object based on section type
//     const include: any = {
//       versions: true,
//       documents: true
//     };

//     // Only include reviews for sections that have them
//     if (sectionsWithReviews.includes(currentSectionId)) {
//       include.reviews = true;
//     }

//     const entry = (await sourceModel.findUnique({
//       where: { id: entryId },
//       include
//     })) as EntryRecord | null;

//     if (!entry) {
//       console.error("Entry not found:", entryId);
//       return NextResponse.json({ error: "Entry not found" }, { status: 404 });
//     }

//     if (currentSectionId === newSectionId) {
//       // If moving within the same section, just update the category
//       await sourceModel.update({
//         where: { id: entryId },
//         data: { categoryId: newCategoryId },
//       });
//     } else {
//       // Create new entry in target section
//       const newEntryData: Record<string, any> = {
//         title: entry.title,
//         version: entry.version,
//         categoryId: newCategoryId,
//         createdById: entry.createdById,
//         updatedById: entry.updatedById,
//       };

//       // Add required fields based on section type
//       fieldMap.fields.forEach((field: string) => {
//         if (field === "issueDate" || field === "reviewDate") {
//           newEntryData[field] = entry[field] || new Date();
//         } else if (field in fieldMap.defaults) {
//           newEntryData[field] = entry[field] ?? fieldMap.defaults[field];
//         } else if (!newEntryData[field]) {
//           newEntryData[field] = fieldMap.defaults[field] ?? null;
//         }
//       });

//       console.log("Creating new entry with data:", newEntryData);

//       // Create new entry in target section
//       const newEntry = await targetModel.create({ data: newEntryData });

//       // Move related records
//       if (entry.versions && versionModels[newSectionId]) {
//         await Promise.all(
//           entry.versions.map(async (version: VersionRecord) => {
//             // Create base version data
//             const versionData: Record<string, any> = {
//               version: version.version,
//               notes: version.notes,
//               createdAt: new Date(),
//             };

//             // Add required fields for version
//             versionRequiredFields[newSectionId].forEach((field) => {
//               if (field === "issueDate" || field === "reviewDate") {
//                 versionData[field] = version[field] || new Date();
//               }
//             });

//             // Use the correct relationship field for the version model
//             const relationshipField = versionRelationshipFields[newSectionId];

//             const createData: Record<string, any> = {
//               ...versionData,
//               [relationshipField]: {
//                 connect: { id: newEntry.id },
//               },
//               createdBy: {
//                 connect: { id: version.createdById || entry.createdById },
//               },
//             };

//             // If there's a document, connect it
//             if (version.documentId) {
//               createData.document = {
//                 connect: { id: version.documentId },
//               };
//             }

//             const prismaModel = (prisma as any)[versionModels[newSectionId]];
//             if (!prismaModel || typeof prismaModel.create !== "function") {
//               throw new Error(`Invalid Prisma model: ${versionModels[newSectionId]}`);
//             }

//             // Create new version
//             const newVersion = await prismaModel.create({
//               data: createData,
//             });

//             // Delete old version after successful creation
//             const oldVersionModel = (prisma as any)[versionModels[currentSectionId]];
//             if (oldVersionModel && typeof oldVersionModel.delete === "function") {
//               await oldVersionModel.delete({
//                 where: { id: version.id },
//               });
//             }

//             return newVersion;
//           })
//         );
//       }

//       // Move documents
//       if (entry.documents) {
//         await Promise.all(
//           entry.documents.map(async (doc: DocumentRecord) => {
//             // Map section IDs to their correct Prisma field names
//             const fieldMapping: Record<string, string> = {
//               manuals: "manual",
//               policies: "policy",
//               procedures: "procedure",
//               forms: "form",
//               certificates: "certificate",
//               "corrective-actions": "correctiveAction",
//               "business-continuity": "businessContinuity",
//               "management-reviews": "managementReview",
//               "job-descriptions": "jobDescription",
//               "work-instructions": "workInstruction",
//               "risk-assessments": "riskAssessment",
//               coshh: "coshh",
//               registers: "register",
//               "hse-guidance": "hseGuidance",
//               "technical-file": "technicalFile",
//               "environmental-guidance": "environmentalGuidance",
//             };

//             const newSectionField = fieldMapping[newSectionId];
//             const currentSectionField = fieldMapping[currentSectionId];

//             if (!newSectionField || !currentSectionField) {
//               throw new Error(`Invalid section ID: ${newSectionId} or ${currentSectionId}`);
//             }

//             // Update the document to point to the new entry
//             await prisma.document.update({
//               where: { id: doc.id },
//               data: {
//                 [newSectionField]: {
//                   connect: { id: newEntry.id },
//                 },
//                 [currentSectionField]: {
//                   disconnect: true,
//                 },
//               },
//             });
//           })
//         );
//       }

//       // Move reviews
//       if (entry.reviews && reviewModels[newSectionId]) {
//         await Promise.all(
//           entry.reviews.map(async (review: ReviewRecord) => {
//             const reviewData = {
//               ...review,
//               id: undefined,
//               createdAt: new Date(),
//               [`${newSectionId.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase())}Id`]: newEntry.id,
//               createdBy: {
//                 connect: { id: review.createdById || entry.createdById },
//               },
//             };

//             delete reviewData[`${currentSectionId.replace(/-([a-z])/g, (_: string, letter: string) => letter.toUpperCase())}Id`];

//             const prismaModel = (prisma as any)[reviewModels[newSectionId]];
//             if (!prismaModel || typeof prismaModel.create !== "function") {
//               throw new Error(`Invalid Prisma model: ${reviewModels[newSectionId]}`);
//             }

//             // Create new review
//             const newReview = await prismaModel.create({
//               data: reviewData,
//             });

//             // Delete old review after successful creation
//             const oldReviewModel = (prisma as any)[reviewModels[currentSectionId]];
//             if (oldReviewModel && typeof oldReviewModel.delete === "function") {
//               await oldReviewModel.delete({
//                 where: { id: review.id },
//               });
//             }

//             return newReview;
//           })
//         );
//       }

//       // Delete the original entry after moving all related records
//       await sourceModel.delete({ where: { id: entryId } });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("Error moving entry:", error);
//     return NextResponse.json({ error: "Failed to move entry", details: error.message }, { status: 500 });
//   }
// }







import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

// Define section configurations with proper field mappings
const SECTION_CONFIG = {
  manuals: {
    model: prisma.manual,
    versionModel: prisma.manualVersion,
    reviewModel: prisma.manualReview,
    categoryModel: prisma.manualCategory,
    documentField: "manualId",
    versionField: "manualId",
    reviewField: "manualId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      content: (entry: any) => entry.content || "",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  policies: {
    model: prisma.policy,
    versionModel: prisma.policyVersion,
    reviewModel: null,
    categoryModel: prisma.policyCategory,
    documentField: "policyId",
    versionField: "policyId",
    reviewField: null,
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  procedures: {
    model: prisma.procedure,
    versionModel: prisma.procedureVersion,
    reviewModel: prisma.procedureReview,
    categoryModel: prisma.procedureCategory,
    documentField: "procedureId",
    versionField: "procedureId",
    reviewField: "procedureId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      content: (entry: any) => entry.content || "",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  forms: {
    model: prisma.form,
    versionModel: prisma.formVersion,
    reviewModel: prisma.formReview,
    categoryModel: prisma.formCategory,
    documentField: "formId",
    versionField: "formId",
    reviewField: "formId",
    requiredFields: ["title", "version", "issueDate", "location", "retentionPeriod"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      retentionPeriod: (entry: any) => entry.retentionPeriod || "1 year",
      content: (entry: any) => entry.content || "",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  certificates: {
    model: prisma.certificate,
    versionModel: prisma.certificateVersion,
    reviewModel: prisma.certificateReview,
    categoryModel: prisma.certificateCategory,
    documentField: "certificateId",
    versionField: "certificateId",
    reviewField: "certificateId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "corrective-actions": {
    model: prisma.correctiveAction,
    versionModel: prisma.correctiveActionVersion,
    reviewModel: prisma.correctiveActionReview,
    categoryModel: prisma.correctiveActionCategory,
    documentField: "correctiveActionId",
    versionField: "correctiveActionId",
    reviewField: "correctiveActionId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      content: (entry: any) => entry.content || "",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "business-continuity": {
    model: prisma.businessContinuity,
    versionModel: prisma.businessContinuityVersion,
    reviewModel: prisma.businessContinuityReview,
    categoryModel: prisma.businessContinuityCategory,
    documentField: "businessContinuityId",
    versionField: "businessContinuityId",
    reviewField: "businessContinuityId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "issueDate"],
    fieldMapping: {
      issueDate: (entry: any) => entry.issueDate || entry.reviewDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      content: (entry: any) => entry.content || "",
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "management-reviews": {
    model: prisma.managementReview,
    versionModel: prisma.managementReviewVersion,
    reviewModel: prisma.managementReviewReview,
    categoryModel: prisma.managementReviewCategory,
    documentField: "managementReviewId",
    versionField: "managementReviewId",
    reviewField: "managementReviewId",
    requiredFields: ["title", "version", "reviewDate", "location"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      location: (entry: any) => entry.location || entry.department || "IMS",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "job-descriptions": {
    model: prisma.jobDescription,
    versionModel: prisma.jobDescriptionVersion,
    reviewModel: prisma.jobDescriptionReview,
    categoryModel: prisma.jobDescriptionCategory,
    documentField: "jobDescriptionId",
    versionField: "jobDescriptionId",
    reviewField: "jobDescriptionId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "work-instructions": {
    model: prisma.workInstruction,
    versionModel: prisma.workInstructionVersion,
    reviewModel: prisma.workInstructionReview,
    categoryModel: prisma.workInstructionCategory,
    documentField: "workInstructionId",
    versionField: "workInstructionId",
    reviewField: "workInstructionId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "risk-assessments": {
    model: prisma.riskAssessment,
    versionModel: prisma.riskAssessmentVersion,
    reviewModel: prisma.riskAssessmentReview,
    categoryModel: prisma.riskAssessmentCategory,
    documentField: "riskAssessmentId",
    versionField: "riskAssessmentId",
    reviewField: "riskAssessmentId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  coshh: {
    model: prisma.cOSHH,
    versionModel: prisma.cOSHHVersion,
    reviewModel: prisma.cOSHHReview,
    categoryModel: prisma.cOSHHCategory,
    documentField: "cOSHHId",
    versionField: "cOSHHId",
    reviewField: "cOSHHId",
    requiredFields: ["title", "version", "issueDate", "location"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  registers: {
    model: prisma.register,
    versionModel: prisma.registerVersion,
    reviewModel: prisma.registerReview,
    categoryModel: prisma.registerCategory,
    documentField: "registerId",
    versionField: "registerId",
    reviewField: "registerId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "hse-guidance": {
    model: prisma.hseGuidance,
    versionModel: prisma.hseGuidanceVersion,
    reviewModel: prisma.hseGuidanceReview,
    categoryModel: prisma.hseGuidanceCategory,
    documentField: "hseGuidanceId",
    versionField: "hseGuidanceId",
    reviewField: "hseGuidanceId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "technical-file": {
    model: prisma.technicalFile,
    versionModel: prisma.technicalFileVersion,
    reviewModel: prisma.technicalFileReview,
    categoryModel: prisma.technicalFileCategory,
    documentField: "technicalFileId",
    versionField: "technicalFileId",
    reviewField: "technicalFileId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
  "environmental-guidance": {
    model: prisma.environmentalGuidance,
    versionModel: prisma.environmentalGuidanceVersion,
    reviewModel: prisma.environmentalGuidanceReview,
    categoryModel: prisma.environmentalGuidanceCategory,
    documentField: "environmentalGuidanceId",
    versionField: "environmentalGuidanceId",
    reviewField: "environmentalGuidanceId",
    requiredFields: ["title", "version", "reviewDate", "department"],
    versionRequiredFields: ["version", "reviewDate"],
    fieldMapping: {
      reviewDate: (entry: any) => entry.reviewDate || entry.issueDate || new Date(),
      department: (entry: any) => entry.department || entry.location || "General",
      content: (entry: any) => entry.content || "",
      nextReviewDate: (entry: any) => entry.nextReviewDate || null,
    },
    defaults: {
      highlighted: false,
      approved: false,
      archived: false,
    },
  },
} as const

type SectionId = keyof typeof SECTION_CONFIG

interface MoveEntryRequest {
  entryId: string
  currentSectionId: SectionId
  newSectionId: SectionId
  newCategoryId: string
}

// Comprehensive cleanup function to handle all possible version and review models
async function cleanupAllReferences(entryId: string, sourceConfig: any) {
  console.log("Starting comprehensive cleanup for entry:", entryId)

  // Clean up all possible version models
  const versionCleanupPromises = []

  if (sourceConfig.versionModel) {
    versionCleanupPromises.push(
      sourceConfig.versionModel.deleteMany({
        where: { [sourceConfig.versionField!]: entryId },
      }),
    )
  }

  // Additional cleanup for specific models that might have been created
  const additionalVersionCleanups = [
    prisma.manualVersion.deleteMany({ where: { manualId: entryId } }),
    prisma.policyVersion.deleteMany({ where: { policyId: entryId } }),
    prisma.procedureVersion.deleteMany({ where: { procedureId: entryId } }),
    prisma.formVersion.deleteMany({ where: { formId: entryId } }),
    prisma.certificateVersion.deleteMany({ where: { certificateId: entryId } }),
    prisma.correctiveActionVersion.deleteMany({ where: { correctiveActionId: entryId } }),
    prisma.businessContinuityVersion.deleteMany({ where: { businessContinuityId: entryId } }),
    prisma.managementReviewVersion.deleteMany({ where: { managementReviewId: entryId } }),
    prisma.jobDescriptionVersion.deleteMany({ where: { jobDescriptionId: entryId } }),
    prisma.workInstructionVersion.deleteMany({ where: { workInstructionId: entryId } }),
    prisma.riskAssessmentVersion.deleteMany({ where: { riskAssessmentId: entryId } }),
    prisma.cOSHHVersion.deleteMany({ where: { cOSHHId: entryId } }),
    prisma.registerVersion.deleteMany({ where: { registerId: entryId } }),
    prisma.hseGuidanceVersion.deleteMany({ where: { hseGuidanceId: entryId } }),
    prisma.technicalFileVersion.deleteMany({ where: { technicalFileId: entryId } }),
    prisma.environmentalGuidanceVersion.deleteMany({ where: { environmentalGuidanceId: entryId } }),
  ]

  // Clean up all possible review models
  const reviewCleanupPromises = [
    prisma.manualReview.deleteMany({ where: { manualId: entryId } }),
    prisma.procedureReview.deleteMany({ where: { procedureId: entryId } }),
    prisma.formReview.deleteMany({ where: { formId: entryId } }),
    prisma.certificateReview.deleteMany({ where: { certificateId: entryId } }),
    prisma.correctiveActionReview.deleteMany({ where: { correctiveActionId: entryId } }),
    prisma.businessContinuityReview.deleteMany({ where: { businessContinuityId: entryId } }),
    prisma.managementReviewReview.deleteMany({ where: { managementReviewId: entryId } }),
    prisma.jobDescriptionReview.deleteMany({ where: { jobDescriptionId: entryId } }),
    prisma.workInstructionReview.deleteMany({ where: { workInstructionId: entryId } }),
    prisma.riskAssessmentReview.deleteMany({ where: { riskAssessmentId: entryId } }),
    prisma.cOSHHReview.deleteMany({ where: { cOSHHId: entryId } }),
    prisma.registerReview.deleteMany({ where: { registerId: entryId } }),
    prisma.hseGuidanceReview.deleteMany({ where: { hseGuidanceId: entryId } }),
    prisma.technicalFileReview.deleteMany({ where: { technicalFileId: entryId } }),
    prisma.environmentalGuidanceReview.deleteMany({ where: { environmentalGuidanceId: entryId } }),
  ]

  // Clean up document references
  const documentCleanupPromises = [
    prisma.document.updateMany({
      where: { manualId: entryId },
      data: { manualId: null },
    }),
    prisma.document.updateMany({
      where: { policyId: entryId },
      data: { policyId: null },
    }),
    prisma.document.updateMany({
      where: { procedureId: entryId },
      data: { procedureId: null },
    }),
    prisma.document.updateMany({
      where: { formId: entryId },
      data: { formId: null },
    }),
    prisma.document.updateMany({
      where: { certificateId: entryId },
      data: { certificateId: null },
    }),
    prisma.document.updateMany({
      where: { correctiveActionId: entryId },
      data: { correctiveActionId: null },
    }),
    prisma.document.updateMany({
      where: { businessContinuityId: entryId },
      data: { businessContinuityId: null },
    }),
    prisma.document.updateMany({
      where: { managementReviewId: entryId },
      data: { managementReviewId: null },
    }),
    prisma.document.updateMany({
      where: { jobDescriptionId: entryId },
      data: { jobDescriptionId: null },
    }),
    prisma.document.updateMany({
      where: { workInstructionId: entryId },
      data: { workInstructionId: null },
    }),
    prisma.document.updateMany({
      where: { riskAssessmentId: entryId },
      data: { riskAssessmentId: null },
    }),
    prisma.document.updateMany({
      where: { coshhId: entryId },
      data: { coshhId: null },
    }),
    prisma.document.updateMany({
      where: { registerId: entryId },
      data: { registerId: null },
    }),
    prisma.document.updateMany({
      where: { hseGuidanceId: entryId },
      data: { hseGuidanceId: null },
    }),
    prisma.document.updateMany({
      where: { technicalFileId: entryId },
      data: { technicalFileId: null },
    }),
    prisma.document.updateMany({
      where: { environmentalGuidanceId: entryId },
      data: { environmentalGuidanceId: null },
    }),
  ]

  try {
    // Execute all cleanup operations, ignoring errors for non-existent references
    await Promise.allSettled([
      ...versionCleanupPromises,
      ...additionalVersionCleanups,
      ...reviewCleanupPromises,
      ...documentCleanupPromises,
    ])

    console.log("Comprehensive cleanup completed")
  } catch (error) {
    console.error("Error during cleanup:", error)
    // Continue anyway, as some errors might be expected (e.g., trying to delete non-existent records)
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: MoveEntryRequest = await request.json()
    console.log("Move request:", body)

    const { entryId, currentSectionId, newSectionId, newCategoryId } = body

    // Validate input
    if (!entryId || !currentSectionId || !newSectionId || !newCategoryId) {
      console.error("Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate sections exist
    const sourceConfig = SECTION_CONFIG[currentSectionId]
    const targetConfig = SECTION_CONFIG[newSectionId]

    if (!sourceConfig || !targetConfig) {
      console.error("Invalid section IDs:", { currentSectionId, newSectionId })
      return NextResponse.json({ error: "Invalid section IDs" }, { status: 400 })
    }

    // Validate category exists
    const categoryExists = await targetConfig.categoryModel.findUnique({
      where: { id: newCategoryId },
    })

    if (!categoryExists) {
      console.error("Category not found:", newCategoryId)
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // If moving within same section, just update category
    if (currentSectionId === newSectionId) {
      console.log("Moving within same section")
      await sourceConfig.model.update({
        where: { id: entryId },
        data: { categoryId: newCategoryId },
      })
      console.log("Category updated successfully")
      return NextResponse.json({ success: true })
    }

    // For cross-section moves, break it down into smaller operations
    console.log("Starting cross-section move")

    // Step 1: Fetch source entry with all related data
    const sourceEntry = await sourceConfig.model.findUnique({
      where: { id: entryId },
      include: {
        documents: true,
        versions: sourceConfig.versionModel ? true : undefined,
        reviews: sourceConfig.reviewModel ? true : undefined,
      },
    })

    if (!sourceEntry) {
      console.error("Source entry not found")
      return NextResponse.json({ error: "Source entry not found" }, { status: 404 })
    }

    console.log("Source entry found:", {
      id: sourceEntry.id,
      title: sourceEntry.title,
      documentsCount: sourceEntry.documents?.length || 0,
      versionsCount: sourceEntry.versions?.length || 0,
      reviewsCount: sourceEntry.reviews?.length || 0,
    })

    // Step 2: Get next order for target category
    const highestOrder = await targetConfig.model.findFirst({
      where: { categoryId: newCategoryId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const newOrder = (highestOrder?.order || 0) + 1

    // Step 3: Build new entry data
    const newEntryData: any = {
      title: sourceEntry.title,
      version: sourceEntry.version,
      categoryId: newCategoryId,
      createdById: sourceEntry.createdById,
      updatedById: user.id,
      order: newOrder,
      ...targetConfig.defaults,
    }

    // Apply field mapping
    for (const [field, mapper] of Object.entries(targetConfig.fieldMapping)) {
      newEntryData[field] = mapper(sourceEntry)
    }

    // Ensure all required fields are present
    for (const field of targetConfig.requiredFields) {
      if (!(field in newEntryData)) {
        if (field in sourceEntry) {
          newEntryData[field] = sourceEntry[field]
        } else {
          throw new Error(`Required field ${field} missing and cannot be mapped`)
        }
      }
    }

    console.log("Creating new entry")

    // Step 4: Create new entry
    const newEntry = await targetConfig.model.create({
      data: newEntryData,
    })

    console.log("New entry created:", newEntry.id)

    // Step 5: Move documents (if any)
    if (sourceEntry.documents && sourceEntry.documents.length > 0) {
      console.log(`Moving ${sourceEntry.documents.length} documents`)

      for (const document of sourceEntry.documents) {
        await prisma.document.update({
          where: { id: document.id },
          data: {
            [targetConfig.documentField]: newEntry.id,
            [sourceConfig.documentField]: null,
          },
        })
      }
      console.log("Documents moved successfully")
    }

    // Step 6: Move versions (if any and target supports versions)
    if (sourceEntry.versions && sourceEntry.versions.length > 0 && targetConfig.versionModel) {
      console.log(`Moving ${sourceEntry.versions.length} versions`)

      for (const version of sourceEntry.versions) {
        // Build version data with proper field mapping
        const versionData: any = {
          version: version.version,
          notes: version.notes,
          createdById: version.createdById,
          [targetConfig.versionField!]: newEntry.id,
        }

        // Add required fields based on target section
        for (const field of targetConfig.versionRequiredFields) {
          if (field === "issueDate") {
            versionData.issueDate = version.issueDate || sourceEntry.issueDate || sourceEntry.reviewDate || new Date()
          } else if (field === "reviewDate") {
            versionData.reviewDate = version.reviewDate || sourceEntry.reviewDate || sourceEntry.issueDate || new Date()
          } else if (field in version) {
            versionData[field] = version[field]
          }
        }

        // Handle document reference
        if (version.documentId) {
          versionData.documentId = version.documentId
        }

        console.log("Creating version with data:", Object.keys(versionData))

        await targetConfig.versionModel.create({
          data: versionData,
        })
      }
      console.log("Versions moved successfully")
    } else if (sourceEntry.versions && sourceEntry.versions.length > 0) {
      console.log("Target doesn't support versions, versions will be deleted during cleanup")
    }

    // Step 7: Move reviews (if any and target supports reviews)
    if (sourceEntry.reviews && sourceEntry.reviews.length > 0 && targetConfig.reviewModel) {
      console.log(`Moving ${sourceEntry.reviews.length} reviews`)

      for (const review of sourceEntry.reviews) {
        // Create new review
        const reviewData: any = {
          reviewedById: review.reviewedById,
          reviewerName: review.reviewerName || "",
          details: review.details,
          reviewDate: review.reviewDate,
          nextReviewDate: review.nextReviewDate || null,
          [targetConfig.reviewField!]: newEntry.id,
        }

        await targetConfig.reviewModel.create({
          data: reviewData,
        })
      }
      console.log("Reviews moved successfully")
    }

    // Step 8: Comprehensive cleanup of all references
    await cleanupAllReferences(entryId, sourceConfig)

    // Step 9: Delete source entry (last step)
    await sourceConfig.model.delete({
      where: { id: entryId },
    })

    console.log("Source entry deleted")
    console.log("Move operation completed successfully")

    return NextResponse.json({
      success: true,
      newEntryId: newEntry.id,
    })
  } catch (error: any) {
    console.error("Error moving entry:", error)
    return NextResponse.json(
      {
        error: "Failed to move entry",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
