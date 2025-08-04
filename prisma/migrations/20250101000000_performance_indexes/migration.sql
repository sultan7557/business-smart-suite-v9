-- Performance optimization indexes
-- This migration adds indexes for frequently queried fields

-- User indexes
CREATE INDEX IF NOT EXISTS "idx_user_status" ON "User"("status");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_username" ON "User"("username");

-- Policy indexes
CREATE INDEX IF NOT EXISTS "idx_policy_category" ON "Policy"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_policy_archived" ON "Policy"("archived");
CREATE INDEX IF NOT EXISTS "idx_policy_created_by" ON "Policy"("createdById");
CREATE INDEX IF NOT EXISTS "idx_policy_updated_by" ON "Policy"("updatedById");
CREATE INDEX IF NOT EXISTS "idx_policy_created_at" ON "Policy"("createdAt");


-- Document indexes
CREATE INDEX IF NOT EXISTS "idx_document_entity" ON "Document"("relatedEntityId", "relatedEntityType");
CREATE INDEX IF NOT EXISTS "idx_document_uploaded_by" ON "Document"("uploadedById");
CREATE INDEX IF NOT EXISTS "idx_document_uploaded_at" ON "Document"("uploadedAt");

-- Audit indexes
CREATE INDEX IF NOT EXISTS "idx_audit_status" ON "Audit"("status");
CREATE INDEX IF NOT EXISTS "idx_audit_created_by" ON "Audit"("createdById");
CREATE INDEX IF NOT EXISTS "idx_audit_auditor" ON "Audit"("auditorId");
CREATE INDEX IF NOT EXISTS "idx_audit_planned_date" ON "Audit"("plannedStartDate");

-- Procedure indexes
CREATE INDEX IF NOT EXISTS "idx_procedure_category" ON "Procedure"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_procedure_archived" ON "Procedure"("archived");
CREATE INDEX IF NOT EXISTS "idx_procedure_created_by" ON "Procedure"("createdById");


-- COSHH indexes
CREATE INDEX IF NOT EXISTS "idx_coshh_category" ON "COSHH"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_coshh_archived" ON "COSHH"("archived");
CREATE INDEX IF NOT EXISTS "idx_coshh_created_by" ON "COSHH"("createdById");
CREATE INDEX IF NOT EXISTS "idx_coshh_review_date" ON "COSHH"("reviewDate");

-- Form indexes
CREATE INDEX IF NOT EXISTS "idx_form_category" ON "Form"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_form_archived" ON "Form"("archived");
CREATE INDEX IF NOT EXISTS "idx_form_created_by" ON "Form"("createdById");

-- Certificate indexes
CREATE INDEX IF NOT EXISTS "idx_certificate_category" ON "Certificate"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_certificate_archived" ON "Certificate"("archived");
CREATE INDEX IF NOT EXISTS "idx_certificate_created_by" ON "Certificate"("createdById");

-- Manual indexes
CREATE INDEX IF NOT EXISTS "idx_manual_category" ON "Manual"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_manual_archived" ON "Manual"("archived");
CREATE INDEX IF NOT EXISTS "idx_manual_created_by" ON "Manual"("createdById");

-- Register indexes
CREATE INDEX IF NOT EXISTS "idx_register_category" ON "Register"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_register_archived" ON "Register"("archived");
CREATE INDEX IF NOT EXISTS "idx_register_created_by" ON "Register"("createdById");

-- Risk Assessment indexes
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_category" ON "RiskAssessment"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_archived" ON "RiskAssessment"("archived");
CREATE INDEX IF NOT EXISTS "idx_risk_assessment_created_by" ON "RiskAssessment"("createdById");

-- HSE Guidance indexes
CREATE INDEX IF NOT EXISTS "idx_hse_guidance_category" ON "HseGuidance"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_hse_guidance_archived" ON "HseGuidance"("archived");
CREATE INDEX IF NOT EXISTS "idx_hse_guidance_created_by" ON "HseGuidance"("createdById");

-- Technical File indexes
CREATE INDEX IF NOT EXISTS "idx_technical_file_category" ON "TechnicalFile"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_technical_file_archived" ON "TechnicalFile"("archived");
CREATE INDEX IF NOT EXISTS "idx_technical_file_created_by" ON "TechnicalFile"("createdById");

-- Environmental Guidance indexes
CREATE INDEX IF NOT EXISTS "idx_environmental_guidance_category" ON "EnvironmentalGuidance"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_environmental_guidance_archived" ON "EnvironmentalGuidance"("archived");
CREATE INDEX IF NOT EXISTS "idx_environmental_guidance_created_by" ON "EnvironmentalGuidance"("createdById");

-- Custom Section indexes
CREATE INDEX IF NOT EXISTS "idx_custom_section_category" ON "CustomSection"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_custom_section_archived" ON "CustomSection"("archived");
CREATE INDEX IF NOT EXISTS "idx_custom_section_created_by" ON "CustomSection"("createdById");
CREATE INDEX IF NOT EXISTS "idx_custom_section_active" ON "CustomSection"("isActive");

-- Permission indexes
CREATE INDEX IF NOT EXISTS "idx_permission_user" ON "Permission"("userId");
CREATE INDEX IF NOT EXISTS "idx_permission_system" ON "Permission"("systemId");
CREATE INDEX IF NOT EXISTS "idx_permission_expiry" ON "Permission"("expiry");

-- Group Permission indexes
CREATE INDEX IF NOT EXISTS "idx_group_permission_group" ON "GroupPermission"("groupId");
CREATE INDEX IF NOT EXISTS "idx_group_permission_system" ON "GroupPermission"("systemId");
CREATE INDEX IF NOT EXISTS "idx_group_permission_expiry" ON "GroupPermission"("expiry");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_policy_category_archived" ON "Policy"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_procedure_category_archived" ON "Procedure"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_coshh_category_archived" ON "COSHH"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_form_category_archived" ON "Form"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_certificate_category_archived" ON "Certificate"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_manual_category_archived" ON "Manual"("categoryId", "archived");
CREATE INDEX IF NOT EXISTS "idx_register_category_archived" ON "Register"("categoryId", "archived");

 