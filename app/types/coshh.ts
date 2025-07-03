import { User } from "@prisma/client"

export interface COSHHCategory {
  id: string
  title: string
  order: number
  archived: boolean
  highlighted: boolean
  createdAt: Date
  updatedAt: Date
  createdById: string
  updatedById: string
  createdBy: User
  updatedBy: User
  coshhs: COSHH[]
}

export interface COSHH {
  id: string
  title: string
  version: string
  reviewDate: Date
  nextReviewDate: Date
  department: string
  content: string
  categoryId: string
  category: COSHHCategory
  createdById: string
  createdBy: User
  updatedById: string
  updatedBy: User
  createdAt: Date
  updatedAt: Date
  documents: Document[]
  versions: COSHHVersion[]
  reviews: COSHHReview[]
  archived: boolean
  order: number
  highlighted: boolean
  approved: boolean
}

export interface COSHHVersion {
  id: string
  coshhId: string
  coshh: COSHH
  version: string
  reviewDate: Date
  nextReviewDate: Date
  notes: string
  createdAt: Date
  createdById: string
  createdBy: User
  documentId: string
  document: Document
}

export interface COSHHReview {
  id: string
  coshhId: string
  coshh: COSHH
  reviewerName: string
  reviewDate: Date
  nextReviewDate: Date
  details: string
  createdAt: Date
  createdById: string
  createdBy: User
}

export interface Document {
  id: string
  title: string
  fileUrl: string
  fileType: string
  size: number
  uploadedById: string
  uploadedBy: User
  uploadedAt: Date
  relatedEntityId: string
  relatedEntityType: string
  coshhId: string
  coshh: COSHH
  coshhVersions: COSHHVersion[]
} 