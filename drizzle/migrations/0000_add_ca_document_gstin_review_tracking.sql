ALTER TABLE public.ca_document_extractions
  ADD COLUMN IF NOT EXISTS supplier_gstin text,
  ADD COLUMN IF NOT EXISTS gstin_verification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS gstin_verification_note text,
  ADD COLUMN IF NOT EXISTS gstin_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS gstin_verified_by uuid;

ALTER TABLE public.ca_document_extractions
  DROP CONSTRAINT IF EXISTS ca_document_extractions_gstin_verification_status_check;

ALTER TABLE public.ca_document_extractions
  ADD CONSTRAINT ca_document_extractions_gstin_verification_status_check
  CHECK (gstin_verification_status IN ('pending', 'verified', 'follow_up', 'not_applicable'));