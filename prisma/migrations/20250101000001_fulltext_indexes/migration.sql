-- Full-text search indexes (separate migration to avoid conflicts)
-- These indexes enable fast text search across content

-- Full-text search indexes for content search
CREATE INDEX IF NOT EXISTS "idx_policy_content_search" ON "Policy" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS "idx_procedure_content_search" ON "Procedure" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS "idx_manual_content_search" ON "Manual" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));
CREATE INDEX IF NOT EXISTS "idx_form_content_search" ON "Form" USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, '')));

-- Title search indexes
CREATE INDEX IF NOT EXISTS "idx_policy_title_search" ON "Policy" USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS "idx_procedure_title_search" ON "Procedure" USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS "idx_manual_title_search" ON "Manual" USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS "idx_form_title_search" ON "Form" USING gin(to_tsvector('english', title)); 