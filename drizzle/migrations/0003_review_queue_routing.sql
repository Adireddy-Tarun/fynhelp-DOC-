ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_gstin TEXT,
  ADD COLUMN IF NOT EXISTS source_document_id UUID,
  ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS vendor_name TEXT,
  ADD COLUMN IF NOT EXISTS vendor_gstin TEXT,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS source_document_id UUID,
  ADD COLUMN IF NOT EXISTS source_type TEXT;

ALTER TABLE public.ca_itc_records ADD COLUMN IF NOT EXISTS source_document_id UUID;
ALTER TABLE public.ca_tds_records ADD COLUMN IF NOT EXISTS source_document_id UUID;

CREATE INDEX IF NOT EXISTS idx_bank_txn_source_doc ON public.bank_transactions(source_document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_source_doc ON public.invoices(source_document_id);
CREATE INDEX IF NOT EXISTS idx_expenses_source_doc ON public.expenses(source_document_id);
CREATE INDEX IF NOT EXISTS idx_itc_source_doc ON public.ca_itc_records(source_document_id);
CREATE INDEX IF NOT EXISTS idx_tds_source_doc ON public.ca_tds_records(source_document_id);

ALTER TABLE public.ca_document_extractions DROP CONSTRAINT IF EXISTS ca_document_extractions_review_state_check;
ALTER TABLE public.ca_document_extractions ADD CONSTRAINT ca_document_extractions_review_state_check
  CHECK (review_state = ANY (ARRAY['pending','auto_accepted','needs_review','posted','rejected','failed','pending_verification','archived']));

-- Rollback path: CA members may delete only document-sourced rows for their clients
CREATE POLICY "ca firm rolls back client bank txns" ON public.bank_transactions FOR DELETE TO authenticated
  USING (source_document_id IS NOT NULL AND ca_firm_has_client_access(get_user_ca_firm_id(), business_id) AND ca_can(get_user_ca_firm_id(), 'process'));
CREATE POLICY "ca firm rolls back client invoices" ON public.invoices FOR DELETE TO authenticated
  USING (source_document_id IS NOT NULL AND ca_firm_has_client_access(get_user_ca_firm_id(), business_id) AND ca_can(get_user_ca_firm_id(), 'process'));
CREATE POLICY "ca firm rolls back client expenses" ON public.expenses FOR DELETE TO authenticated
  USING (source_document_id IS NOT NULL AND ca_firm_has_client_access(get_user_ca_firm_id(), business_id) AND ca_can(get_user_ca_firm_id(), 'process'));