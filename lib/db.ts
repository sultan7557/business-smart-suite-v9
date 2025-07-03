"use server"

// Types
export interface Policy {
  id: string
  title: string
  version: string
  issueDate: string
  location: string
  content?: string
  categoryId: string
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface PolicyCategory {
  id: string
  title: string
}

export interface Document {
  id: string
  title: string
  type: string
  fileUrl: string
  fileType: string
  size: number
  uploadedBy: string
  uploadedAt: string
  relatedEntityId?: string
  relatedEntityType?: string
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: string
  fileUrl: string
  createdBy: string
  createdAt: string
  notes?: string
}

// Add these new types for Audits
export interface Audit {
  id: string
  title: string
  plannedStartDate: string
  actualStartDate?: string
  followUpDate?: string
  dateCompleted?: string
  auditorId?: string
  auditorName?: string
  externalAuditor?: string
  status: "not_started" | "in_progress" | "completed"
  createNextAudit: boolean
  nextAuditDate?: string
  createdById: string
  createdByName?: string
  updatedById?: string
  updatedByName?: string
  createdAt: string
  updatedAt: string
  documents?: Document[]
  auditDocuments?: AuditDocument[]
}

export interface AuditDocument {
  id: string
  auditId: string
  docType: string
  docId: string
  docName: string
  createdAt: string
}


// Mock data
const policyCategories: PolicyCategory[] = [
  { id: "info-security-control", title: "Information Security Control Policies (Annex A Controls)" },
  { id: "integrated-management", title: "Integrated Management System" },
  { id: "info-security-management", title: "Information Security Management System Policy" },
  { id: "carbon-footprint", title: "Carbon Footprint Statement and Carbon Reduction Plan" },
  { id: "info-communication", title: "Information Communication Technology Security Policy" },
  { id: "signing-sheets", title: "Signing Sheets" },
  { id: "human-resources", title: "Human Resources" },
]

const policies: Policy[] = [
  {
    id: "01",
    title: "01 Mobile Phone & Devices Policy",
    version: "4",
    issueDate: "11/May/2023",
    location: "IMS",
    categoryId: "info-security-control",
    createdBy: "John Keen",
    createdAt: "18/Aug/2022",
    updatedBy: "Dave Nicholson",
    updatedAt: "11/May/2023",
  },
  {
    id: "02",
    title: "02 Acceptable Use Policy",
    version: "2",
    issueDate: "11/May/2023",
    location: "IMS",
    categoryId: "info-security-control",
    createdBy: "John Keen",
    createdAt: "19/Jan/2022",
    updatedBy: "Dave Nicholson",
    updatedAt: "11/May/2023",
  },
  {
    id: "03",
    title: "03 Access Control Policy",
    version: "3",
    issueDate: "11/May/2023",
    location: "IMS",
    categoryId: "info-security-control",
    createdBy: "John Keen",
    createdAt: "19/Jan/2022",
    updatedBy: "Dave Nicholson",
    updatedAt: "11/May/2023",
  },
  // Add more policies as needed
]

const documents: Document[] = [
  {
    id: "doc-01",
    title: "Mobile Phone & Devices Policy Document",
    type: "policy",
    fileUrl: "/documents/mobile-phone-policy.docx",
    fileType: "docx",
    size: 245000,
    uploadedBy: "Dave Nicholson",
    uploadedAt: "11/May/2023",
    relatedEntityId: "01",
    relatedEntityType: "policy",
  },
  {
    id: "doc-02",
    title: "Acceptable Use Policy Document",
    type: "policy",
    fileUrl: "/documents/acceptable-use-policy.docx",
    fileType: "docx",
    size: 198000,
    uploadedBy: "Dave Nicholson",
    uploadedAt: "11/May/2023",
    relatedEntityId: "02",
    relatedEntityType: "policy",
  },
  // Add more documents as needed
]

const documentVersions: DocumentVersion[] = [
  {
    id: "ver-01-1",
    documentId: "doc-01",
    version: "1",
    fileUrl: "/documents/mobile-phone-policy-v1.docx",
    createdBy: "John Keen",
    createdAt: "18/Aug/2022 18:06:33",
    notes: "Initial version",
  },
  {
    id: "ver-01-2",
    documentId: "doc-01",
    version: "2",
    fileUrl: "/documents/mobile-phone-policy-v2.docx",
    createdBy: "John Keen",
    createdAt: "22/Aug/2022 12:00:37",
    notes: "Updated with new requirements",
  },
  {
    id: "ver-01-3",
    documentId: "doc-01",
    version: "3",
    fileUrl: "/documents/mobile-phone-policy-v3.docx",
    createdBy: "Kulvinder Bhullar",
    createdAt: "24/Apr/2023 11:00:25",
    notes: "Annual review",
  },
  {
    id: "ver-01-4",
    documentId: "doc-01",
    version: "4",
    fileUrl: "/documents/mobile-phone-policy-v4.docx",
    createdBy: "Dave Nicholson",
    createdAt: "11/May/2023 10:36:41",
    notes: "Updated with new mobile device guidelines",
  },
  // Add more versions as needed
]

const audits: Audit[] = [
  {
    id: "audit-01",
    title: "Annual Policy Review",
    plannedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "not_started",
    createNextAudit: false,
    createdById: "admin-01",
    createdByName: "Admin User",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auditDocuments: [
      {
        id: "audit-doc-01",
        auditId: "audit-01",
        docType: "procedure",
        docId: "Procedure No 1 Planning & Review",
        docName: "Procedure No 1 Planning & Review",
        createdAt: new Date().toISOString(),
      }
    ]
  },
  {
    id: "audit-02",
    title: "Information Security Compliance",
    plannedStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    actualStartDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "in_progress",
    createNextAudit: false,
    auditorId: "manager-01",
    auditorName: "Manager User",
    createdById: "admin-01",
    createdByName: "Admin User",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]


// Database functions
export async function getPolicyCategories(): Promise<PolicyCategory[]> {
  return policyCategories
}

export async function getPoliciesByCategory(categoryId: string): Promise<Policy[]> {
  return policies.filter((policy) => policy.categoryId === categoryId)
}

export async function getPolicyById(id: string): Promise<Policy | null> {
  return policies.find((policy) => policy.id === id) || null
}

export async function getDocumentsByRelatedEntity(entityId: string, entityType: string): Promise<Document[]> {
  return documents.filter((doc) => doc.relatedEntityId === entityId && doc.relatedEntityType === entityType)
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  return documentVersions.filter((ver) => ver.documentId === documentId)
}

export async function createPolicy(policy: Omit<Policy, "id">): Promise<Policy> {
  const newPolicy: Policy = {
    ...policy,
    id: `${policies.length + 1}`.padStart(2, "0"),
  }

  policies.push(newPolicy)
  return newPolicy
}

export async function updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy | null> {
  const policyIndex = policies.findIndex((p) => p.id === id)

  if (policyIndex === -1) {
    return null
  }

  policies[policyIndex] = {
    ...policies[policyIndex],
    ...updates,
  }

  return policies[policyIndex]
}

export async function deletePolicy(id: string): Promise<boolean> {
  const initialLength = policies.length
  const newPolicies = policies.filter((p) => p.id !== id)

  if (newPolicies.length === initialLength) {
    return false
  }

  // In a real app, you would actually delete from the database
  // Here we're just simulating it
  return true
}
export async function getAudits(status?: string): Promise<Audit[]> {
  if (status) {
    return audits.filter(audit => audit.status === status);
  }
  return audits;
}

export async function getAuditById(id: string): Promise<Audit | null> {
  return audits.find(audit => audit.id === id) || null;
}

export async function createAudit(audit: Omit<Audit, "id" | "createdAt" | "updatedAt">): Promise<Audit> {
  const newAudit: Audit = {
    ...audit,
    id: `audit-${audits.length + 1}`.padStart(8, "0"),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  audits.push(newAudit);
  return newAudit;
}

export async function updateAudit(id: string, updates: Partial<Audit>): Promise<Audit | null> {
  const auditIndex = audits.findIndex(a => a.id === id);
  
  if (auditIndex === -1) {
    return null;
  }
  
  audits[auditIndex] = {
    ...audits[auditIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return audits[auditIndex];
}

// Dashboard data
export interface ChartData {
  name: string
  value: number
}

export async function getRootCauseData(): Promise<ChartData[]> {
  return [
    { name: "Hardware", value: 2 },
    { name: "Management Error", value: 1 },
    { name: "Software", value: 2 },
    { name: "Information Security", value: 0 },
    { name: "Lack of Control Procedure", value: 0 },
    { name: "Location", value: 0 },
    { name: "Machinery", value: 0 },
    { name: "Materials", value: 0 },
  ]
}

export async function getAchievementRateData(): Promise<{ name: string; timely: number; overdue: number }[]> {
  return [
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
}

export async function getCostOfQualityData(): Promise<ChartData[]> {
  return [
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
}

