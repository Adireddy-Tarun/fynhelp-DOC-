-- India business date helpers
CREATE OR REPLACE FUNCTION public.ist_today() RETURNS date LANGUAGE sql STABLE SET search_path = public AS $$ SELECT (now() AT TIME ZONE 'Asia/Kolkata')::date $$;
CREATE OR REPLACE FUNCTION public.ist_period() RETURNS text LANGUAGE sql STABLE SET search_path = public AS $$ SELECT to_char(public.ist_today(), 'YYYY-MM') $$;

-- Request matching columns
ALTER TABLE public.ca_document_requests ADD COLUMN IF NOT EXISTS fulfilled_by_document_id uuid;
ALTER TABLE public.ca_document_requests ADD COLUMN IF NOT EXISTS received_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_ca_doc_requests_open_match ON public.ca_document_requests (ca_firm_id, business_id, status);

-- One place: which document categories answer a request type
CREATE OR REPLACE FUNCTION public.ca_request_type_categories(p_type text) RETURNS text[]
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN lower(coalesce(p_type,'')) IN ('bank','bank_statement') OR lower(p_type) LIKE '%bank%' THEN ARRAY['bank_statement']
    WHEN lower(coalesce(p_type,'')) IN ('invoice','sales_invoice') OR lower(p_type) LIKE '%sales%' THEN ARRAY['sales_invoice']
    WHEN lower(coalesce(p_type,'')) IN ('expense','purchase_invoice','expense_receipt') OR lower(p_type) LIKE '%purchase%' OR lower(p_type) LIKE '%expense%' OR lower(p_type) LIKE '%bill%' THEN ARRAY['purchase_invoice','expense_receipt']
    WHEN lower(coalesce(p_type,'')) IN ('challan','tds','tds_record') OR lower(p_type) LIKE '%tds%' OR lower(p_type) LIKE '%challan%' THEN ARRAY['tds_record']
    ELSE ARRAY['bank_statement','sales_invoice','purchase_invoice','expense_receipt','tds_record','reference_document']
  END
$$;

-- Value helpers (may trap errors; the posting core itself does not)
CREATE OR REPLACE FUNCTION public._ca_try_num(p text) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE s text := regexp_replace(coalesce(p,''), '[,₹\s]', '', 'g');
BEGIN
  IF s = '' THEN RETURN 0; END IF;
  RETURN s::numeric;
EXCEPTION WHEN others THEN RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public._ca_try_date(p text) RETURNS date
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE s text := btrim(coalesce(p,''));
BEGIN
  IF s !~ '^\d{4}-\d{2}-\d{2}$' THEN RETURN NULL; END IF;
  RETURN to_date(s, 'YYYY-MM-DD') + 0 * (CASE WHEN to_char(to_date(s,'YYYY-MM-DD'),'YYYY-MM-DD') = s THEN 1 ELSE 1/0 END);
EXCEPTION WHEN others THEN RETURN NULL;
END $$;

CREATE OR REPLACE FUNCTION public._ca_blank(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT p IS NULL OR btrim(p) = '' $$;
CREATE OR REPLACE FUNCTION public._ca_nz(p text) RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT CASE WHEN p IS NULL OR btrim(p) = '' THEN NULL ELSE btrim(p) END $$;

-- FIX 3: exact type + period matching of open requests
CREATE OR REPLACE FUNCTION public.ca_match_document_requests(p_extraction_id uuid, p_mode text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ex record; v_cat text; v_rows jsonb; v_periods text[]; v_count int := 0; r record; v_client text; v_done uuid[] := '{}';
  v_null_done boolean := false;
BEGIN
  IF p_mode NOT IN ('received','fulfilled') THEN RAISE EXCEPTION 'invalid_mode'; END IF;
  SELECT * INTO ex FROM ca_document_extractions WHERE id = p_extraction_id;
  IF NOT FOUND OR ex.business_id IS NULL THEN RETURN 0; END IF;

  v_cat := CASE
    WHEN ex.classification IN ('bank_statement','sales_invoice','purchase_invoice','expense_receipt','tds_record','reference_document') THEN ex.classification
    WHEN ex.classification = 'bank' THEN 'bank_statement'
    WHEN ex.classification = 'invoice' THEN 'sales_invoice'
    WHEN ex.classification IN ('expense','bill','purchase_order') THEN 'purchase_invoice'
    WHEN ex.classification IN ('challan','tds') THEN 'tds_record'
    ELSE 'reference_document' END;

  v_rows := coalesce(ex.corrected->'rows', ex.extracted->'rows', '[]'::jsonb);
  IF jsonb_typeof(v_rows) <> 'array' THEN v_rows := '[]'::jsonb; END IF;
  SELECT array_agg(DISTINCT to_char(d, 'YYYY-MM')) INTO v_periods
  FROM (
    SELECT _ca_try_date(coalesce(e->>'date', e->>'invoice_date', e->>'payment_date')) d
    FROM jsonb_array_elements(v_rows) e
  ) x WHERE d IS NOT NULL;
  IF v_periods IS NULL THEN v_periods := ARRAY[to_char((ex.created_at AT TIME ZONE 'Asia/Kolkata')::date, 'YYYY-MM')]; END IF;

  SELECT client_name INTO v_client FROM ca_clients WHERE ca_firm_id = ex.ca_firm_id AND business_id = ex.business_id LIMIT 1;

  FOR r IN
    SELECT q.* FROM ca_document_requests q
    WHERE q.ca_firm_id = ex.ca_firm_id AND q.business_id = ex.business_id
      AND q.status NOT IN ('fulfilled','resolved','cancelled','closed')
      AND (p_mode = 'fulfilled' OR q.status <> 'received')
      AND (q.period IS NULL OR q.period = ANY(v_periods))
      AND (coalesce(array_length(q.doc_types,1),0) = 0
           OR EXISTS (SELECT 1 FROM unnest(q.doc_types) t WHERE v_cat = ANY(ca_request_type_categories(t))))
    ORDER BY (q.period IS NULL), q.created_at ASC
    FOR UPDATE
  LOOP
    IF r.period IS NULL THEN
      IF v_null_done THEN CONTINUE; END IF;
      v_null_done := true;
    END IF;
    IF p_mode = 'received' THEN
      UPDATE ca_document_requests SET status = 'received', received_at = now(), updated_at = now() WHERE id = r.id;
    ELSE
      UPDATE ca_document_requests SET status = 'fulfilled', fulfilled_at = now(), fulfilled_by_document_id = p_extraction_id, updated_at = now() WHERE id = r.id;
      INSERT INTO ca_notifications (ca_firm_id, business_id, type, severity, title, message, is_read, metadata)
      VALUES (ex.ca_firm_id, ex.business_id, 'request_fulfilled', 'info',
        'Request fulfilled — ' || coalesce(v_client, 'Client'),
        coalesce(ex.original_filename, 'A document') || ' fulfilled "' || r.title || '" for ' || coalesce(r.period, array_to_string(v_periods, ', ')),
        false, jsonb_build_object('request_id', r.id, 'extraction_id', p_extraction_id));
    END IF;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $$;

-- FIX 1A: transactional posting core
CREATE OR REPLACE FUNCTION public._ca_post_extraction_core(p_extraction_id uuid, p_category text, p_business_id uuid, p_rows jsonb, p_actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ex record; r jsonb; i int; f text; v numeric; d date; g text; p text;
  v_rows jsonb := coalesce(p_rows, '[]'::jsonb);
  v_req_dates text[]; v_date_fields text[]; v_amt_fields text[];
  v_period text; v_src text; v_ids jsonb := '{}'::jsonb; v_new uuid; v_tmp uuid[];
  v_count int := 0; v_state text; tv numeric; c numeric; s numeric; ig numeric; tot numeric; v_pd date; v_m int; v_y int; v_fy text; v_q text;
BEGIN
  SELECT * INTO ex FROM ca_document_extractions WHERE id = p_extraction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'extraction_not_found'; END IF;
  IF ex.posted_at IS NOT NULL OR ex.review_state IN ('posted','archived') THEN RAISE EXCEPTION 'already_posted'; END IF;
  IF NOT EXISTS (SELECT 1 FROM ca_clients WHERE ca_firm_id = ex.ca_firm_id AND business_id = p_business_id) THEN RAISE EXCEPTION 'client_not_in_firm'; END IF;
  IF p_category IS NULL OR p_category NOT IN ('bank_statement','sales_invoice','purchase_invoice','expense_receipt','tds_record','reference_document') THEN RAISE EXCEPTION 'invalid_category'; END IF;
  IF jsonb_typeof(v_rows) <> 'array' THEN RAISE EXCEPTION 'no_rows'; END IF;
  IF p_category = 'reference_document' THEN v_rows := '[]'::jsonb; END IF;
  IF p_category <> 'reference_document' AND jsonb_array_length(v_rows) = 0 THEN RAISE EXCEPTION 'no_rows'; END IF;

  v_date_fields := CASE p_category
    WHEN 'bank_statement' THEN ARRAY['date'] WHEN 'expense_receipt' THEN ARRAY['date']
    WHEN 'tds_record' THEN ARRAY['payment_date','challan_date'] ELSE ARRAY['invoice_date','due_date'] END;
  v_req_dates := CASE p_category WHEN 'bank_statement' THEN ARRAY['date'] WHEN 'expense_receipt' THEN ARRAY['date']
    WHEN 'tds_record' THEN ARRAY['payment_date'] ELSE ARRAY['invoice_date'] END;
  v_amt_fields := CASE p_category
    WHEN 'bank_statement' THEN ARRAY['amount','balance'] WHEN 'expense_receipt' THEN ARRAY['amount']
    WHEN 'tds_record' THEN ARRAY['payment_amount','tds_rate','tds_amount']
    ELSE ARRAY['taxable_value','cgst','sgst','igst','total_amount'] END;

  -- Validate every row
  FOR i IN 0 .. jsonb_array_length(v_rows) - 1 LOOP
    r := v_rows->i;
    FOREACH f IN ARRAY v_date_fields LOOP
      IF _ca_blank(r->>f) THEN
        IF f = ANY(v_req_dates) THEN RAISE EXCEPTION 'invalid_row:%:%', i + 1, f; END IF;
      ELSIF _ca_try_date(r->>f) IS NULL THEN RAISE EXCEPTION 'invalid_row:%:%', i + 1, f; END IF;
    END LOOP;
    FOREACH f IN ARRAY v_amt_fields LOOP
      IF f = 'balance' AND _ca_blank(r->>f) THEN CONTINUE; END IF;
      v := _ca_try_num(r->>f);
      IF v IS NULL OR (v < 0 AND f <> 'balance') THEN RAISE EXCEPTION 'invalid_row:%:%', i + 1, f; END IF;
    END LOOP;
    IF p_category = 'bank_statement' THEN
      IF lower(coalesce(r->>'type','')) NOT IN ('credit','debit') THEN RAISE EXCEPTION 'invalid_row:%:type', i + 1; END IF;
      IF _ca_try_num(r->>'amount') <= 0 THEN RAISE EXCEPTION 'invalid_row:%:amount', i + 1; END IF;
    ELSIF p_category IN ('sales_invoice','purchase_invoice') THEN
      tv := _ca_try_num(r->>'taxable_value'); c := _ca_try_num(r->>'cgst'); s := _ca_try_num(r->>'sgst'); ig := _ca_try_num(r->>'igst'); tot := _ca_try_num(r->>'total_amount');
      IF abs(tv + c + s + ig - tot) > 1 THEN RAISE EXCEPTION 'invalid_row:%:total_amount', i + 1; END IF;
      IF ig > 0 AND (c > 0 OR s > 0) THEN RAISE EXCEPTION 'invalid_row:%:igst', i + 1; END IF;
      IF (c > 0) <> (s > 0) THEN RAISE EXCEPTION 'invalid_row:%:sgst', i + 1; END IF;
      IF _ca_blank(r->>'invoice_number') THEN RAISE EXCEPTION 'invalid_row:%:invoice_number', i + 1; END IF;
      f := CASE WHEN p_category = 'sales_invoice' THEN 'customer_gstin' ELSE 'vendor_gstin' END;
      g := upper(btrim(coalesce(r->>f, '')));
      IF g <> '' AND g !~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$' THEN RAISE EXCEPTION 'invalid_row:%:%', i + 1, f; END IF;
      -- the ITC register requires the supplier GSTIN
      IF p_category = 'purchase_invoice' AND g = '' THEN RAISE EXCEPTION 'invalid_row:%:vendor_gstin', i + 1; END IF;
    ELSIF p_category = 'tds_record' THEN
      p := upper(btrim(coalesce(r->>'deductee_pan', '')));
      IF p <> '' AND p !~ '^[A-Z]{5}[0-9]{4}[A-Z]$' THEN RAISE EXCEPTION 'invalid_row:%:deductee_pan', i + 1; END IF;
      IF _ca_blank(r->>'section_code') THEN RAISE EXCEPTION 'invalid_row:%:section_code', i + 1; END IF;
      IF _ca_blank(r->>'deductee_name') THEN RAISE EXCEPTION 'invalid_row:%:deductee_name', i + 1; END IF;
    END IF;
  END LOOP;

  -- Period lock
  FOR v_period IN
    SELECT DISTINCT to_char(_ca_try_date(e->>(v_req_dates[1])), 'YYYY-MM') FROM jsonb_array_elements(v_rows) e
  LOOP
    IF EXISTS (SELECT 1 FROM ca_close_periods cp WHERE cp.business_id = p_business_id AND cp.ca_firm_id = ex.ca_firm_id
               AND cp.period = v_period AND cp.status IN ('signed_off','closed','locked')) THEN
      RAISE EXCEPTION 'period_locked:%', v_period;
    END IF;
  END LOOP;

  v_src := CASE WHEN ex.source_type IN ('gmail','whatsapp') THEN ex.source_type ELSE 'upload' END;

  -- Inserts (same mapping as the previous client code)
  IF p_category = 'bank_statement' THEN
    WITH ins AS (
      INSERT INTO bank_transactions (business_id, date, description, amount, type, balance, category, reconciled, source_document_id, source_type, source_reference)
      SELECT p_business_id, (e->>'date')::date, left(coalesce(e->>'description',''), 500), abs(_ca_try_num(e->>'amount')),
             lower(e->>'type'), CASE WHEN _ca_blank(e->>'balance') THEN 0 ELSE _ca_try_num(e->>'balance') END,
             'uncategorized', false, p_extraction_id, v_src, ex.original_filename
      FROM jsonb_array_elements(v_rows) e RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := jsonb_build_object('bank_transactions', to_jsonb(v_tmp));
  ELSIF p_category = 'sales_invoice' THEN
    WITH ins AS (
      INSERT INTO invoices (business_id, invoice_number, invoice_date, due_date, customer_name, customer_gstin, subtotal, tax_amount, total_amount, paid_amount, outstanding_amount, status, source_document_id, source_type)
      SELECT p_business_id, btrim(e->>'invoice_number'), (e->>'invoice_date')::date, _ca_try_date(e->>'due_date'),
             _ca_nz(e->>'customer_name'), upper(_ca_nz(e->>'customer_gstin')), _ca_try_num(e->>'taxable_value'),
             _ca_try_num(e->>'cgst') + _ca_try_num(e->>'sgst') + _ca_try_num(e->>'igst'), _ca_try_num(e->>'total_amount'),
             0, _ca_try_num(e->>'total_amount'), 'unpaid', p_extraction_id, v_src
      FROM jsonb_array_elements(v_rows) e RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := jsonb_build_object('invoices', to_jsonb(v_tmp));
  ELSIF p_category = 'purchase_invoice' THEN
    WITH ins AS (
      INSERT INTO expenses (business_id, vendor_name, vendor_gstin, invoice_number, date, due_date, amount, tax_amount, category, description, payment_status, source_document_id, source_type)
      SELECT p_business_id, _ca_nz(e->>'vendor_name'), upper(_ca_nz(e->>'vendor_gstin')), _ca_nz(e->>'invoice_number'),
             (e->>'invoice_date')::date, _ca_try_date(e->>'due_date'), _ca_try_num(e->>'total_amount'),
             _ca_try_num(e->>'cgst') + _ca_try_num(e->>'sgst') + _ca_try_num(e->>'igst'), 'purchase',
             btrim('Purchase bill ' || coalesce(e->>'invoice_number','') || ' from ' || coalesce(e->>'vendor_name','')), 'unpaid', p_extraction_id, v_src
      FROM jsonb_array_elements(v_rows) e RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := jsonb_build_object('expenses', to_jsonb(v_tmp));
    WITH ins AS (
      INSERT INTO ca_itc_records (ca_firm_id, business_id, filing_period, gstin_supplier, supplier_name, invoice_number, invoice_date, taxable_value, igst_amount, cgst_amount, sgst_amount, total_itc, gstr2b_matched, match_status, itc_eligible, itc_blocked, source, source_document_id)
      SELECT ex.ca_firm_id, p_business_id, to_char((e->>'invoice_date')::date, 'Mon YYYY'), upper(btrim(e->>'vendor_gstin')), _ca_nz(e->>'vendor_name'),
             _ca_nz(e->>'invoice_number'), (e->>'invoice_date')::date, _ca_try_num(e->>'taxable_value'), _ca_try_num(e->>'igst'),
             _ca_try_num(e->>'cgst'), _ca_try_num(e->>'sgst'), _ca_try_num(e->>'cgst') + _ca_try_num(e->>'sgst') + _ca_try_num(e->>'igst'),
             false, 'pending', true, false, 'document', p_extraction_id
      FROM jsonb_array_elements(v_rows) e RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := v_ids || jsonb_build_object('ca_itc_records', to_jsonb(v_tmp));
  ELSIF p_category = 'expense_receipt' THEN
    WITH ins AS (
      INSERT INTO expenses (business_id, vendor_name, date, amount, description, category, payment_status, source_document_id, source_type)
      SELECT p_business_id, _ca_nz(e->>'vendor_name'), (e->>'date')::date, _ca_try_num(e->>'amount'),
             coalesce(e->>'description', e->>'vendor_name', ''), 'expense', 'paid', p_extraction_id, v_src
      FROM jsonb_array_elements(v_rows) e RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := jsonb_build_object('expenses', to_jsonb(v_tmp));
  ELSIF p_category = 'tds_record' THEN
    WITH ins AS (
      INSERT INTO ca_tds_records (ca_firm_id, business_id, financial_year, quarter, section_code, deductee_name, deductee_pan, payment_date, payment_amount, tds_rate, tds_amount, deposited_amount, challan_number, challan_date, return_filed, status, source_document_id)
      SELECT ex.ca_firm_id, p_business_id,
             (CASE WHEN extract(month FROM pd) >= 4 THEN extract(year FROM pd)::int ELSE extract(year FROM pd)::int - 1 END)::text || '-' ||
               lpad((((CASE WHEN extract(month FROM pd) >= 4 THEN extract(year FROM pd)::int ELSE extract(year FROM pd)::int - 1 END) + 1) % 100)::text, 2, '0'),
             CASE WHEN extract(month FROM pd) BETWEEN 4 AND 6 THEN 'Q1' WHEN extract(month FROM pd) BETWEEN 7 AND 9 THEN 'Q2'
                  WHEN extract(month FROM pd) >= 10 THEN 'Q3' ELSE 'Q4' END,
             btrim(e->>'section_code'), btrim(e->>'deductee_name'), upper(_ca_nz(e->>'deductee_pan')), pd,
             _ca_try_num(e->>'payment_amount'), _ca_try_num(e->>'tds_rate'), _ca_try_num(e->>'tds_amount'),
             CASE WHEN _ca_nz(e->>'challan_number') IS NOT NULL THEN _ca_try_num(e->>'tds_amount') ELSE 0 END,
             _ca_nz(e->>'challan_number'), _ca_try_date(e->>'challan_date'), false,
             CASE WHEN _ca_nz(e->>'challan_number') IS NOT NULL THEN 'deposited' ELSE 'pending' END, p_extraction_id
      FROM (SELECT e, (e->>'payment_date')::date pd FROM jsonb_array_elements(v_rows) e) x RETURNING id)
    SELECT array_agg(id) INTO v_tmp FROM ins;
    v_ids := jsonb_build_object('ca_tds_records', to_jsonb(v_tmp));
  ELSE
    v_ids := jsonb_build_object('vault', '[]'::jsonb);
  END IF;

  SELECT coalesce(sum(jsonb_array_length(value)), 0) INTO v_count FROM jsonb_each(v_ids) WHERE jsonb_typeof(value) = 'array';
  v_state := CASE WHEN p_category = 'reference_document' THEN 'archived' ELSE 'posted' END;

  UPDATE ca_document_extractions SET business_id = p_business_id, classification = p_category,
    corrected = jsonb_build_object('rows', v_rows), review_state = v_state, posted_at = now(), posted_ref = v_ids::text,
    reviewed_by = p_actor, reviewed_at = now(), error_message = NULL, updated_at = now()
  WHERE id = p_extraction_id;

  INSERT INTO ca_audit_events (ca_firm_id, business_id, actor_id, entity_type, entity_id, action, detail, source_document_id)
  VALUES (ex.ca_firm_id, p_business_id, p_actor, 'document_extraction', p_extraction_id, 'document_posted',
          jsonb_build_object('extraction_id', p_extraction_id, 'category', p_category, 'row_count', v_count, 'actor', p_actor, 'posted_ref', v_ids),
          ex.document_id);

  INSERT INTO ca_brain_events (ca_firm_id, business_id, event_type, payload, actor_id)
  VALUES (ex.ca_firm_id, p_business_id, 'document_posted', jsonb_build_object('category', p_category, 'rows', v_count, 'source_type', ex.source_type), p_actor);

  PERFORM ca_match_document_requests(p_extraction_id, 'fulfilled');

  RETURN jsonb_build_object('ok', true, 'review_state', v_state, 'posted_ref', v_ids, 'row_count', v_count);
END $$;

-- FIX 1B: caller-checked wrapper
CREATE OR REPLACE FUNCTION public.ca_post_extraction(p_extraction_id uuid, p_category text, p_business_id uuid, p_rows jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_firm uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT ca_firm_id INTO v_firm FROM ca_document_extractions WHERE id = p_extraction_id;
  IF v_firm IS NULL THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF NOT user_in_ca_firm(v_firm) OR NOT ca_firm_has_client_access(v_firm, p_business_id) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN _ca_post_extraction_core(p_extraction_id, p_category, p_business_id, p_rows, auth.uid());
END $$;

-- Browser uploads mark matching requests received (member-checked)
CREATE OR REPLACE FUNCTION public.ca_mark_document_received(p_extraction_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_firm uuid; v_biz uuid;
BEGIN
  SELECT ca_firm_id, business_id INTO v_firm, v_biz FROM ca_document_extractions WHERE id = p_extraction_id;
  IF v_firm IS NULL OR v_biz IS NULL THEN RETURN 0; END IF;
  IF auth.uid() IS NULL OR NOT user_in_ca_firm(v_firm) OR NOT ca_firm_has_client_access(v_firm, v_biz) THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN ca_match_document_requests(p_extraction_id, 'received');
END $$;

REVOKE ALL ON FUNCTION public._ca_post_extraction_core(uuid,text,uuid,jsonb,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._ca_post_extraction_core(uuid,text,uuid,jsonb,uuid) TO service_role;
REVOKE ALL ON FUNCTION public.ca_post_extraction(uuid,text,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ca_post_extraction(uuid,text,uuid,jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.ca_match_document_requests(uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ca_match_document_requests(uuid,text) TO service_role;
REVOKE ALL ON FUNCTION public.ca_mark_document_received(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ca_mark_document_received(uuid) TO authenticated;

-- generate_compliance_calendar default FY: use India date
DO $$ BEGIN NULL; END $$;