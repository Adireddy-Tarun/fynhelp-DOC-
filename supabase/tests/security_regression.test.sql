-- =============================================================================
-- Security regression tests (pgTAP edition)
--
-- Outputs standard TAP — runnable via:
--   pg_prove -d "$SUPABASE_DB_URL" supabase/tests/security_regression.test.sql
-- or
--   psql "$SUPABASE_DB_URL" -X -q -f supabase/tests/security_regression.test.sql
-- or via the Supabase CLI:
--   supabase test db
--
-- Verifies:
--   1. SECURITY DEFINER helper functions are NOT executable by anon / PUBLIC
--      and ARE executable by authenticated.
--   2. Trigger-only functions are NOT executable by any client role.
--   3. DELETE RLS policies on owner-scoped tables filter by
--      get_user_business_id().
--   4. Audit / immutable tables have NO DELETE policy.
--   5. Behavioural: tenant A cannot DELETE tenant B's receivables row.
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET search_path = public, extensions;

-- 6 helper privilege tests + 9 trigger privilege tests +
-- (13 owned tables * 2) DELETE policy tests +
-- 13 immutable-table tests + 2 behavioural tests
SELECT plan(56);

-- -----------------------------------------------------------------------------
-- 1. Helper function privileges (must be callable by authenticated only)
-- -----------------------------------------------------------------------------
SELECT ok(
  NOT has_function_privilege('anon', 'public.get_user_business_id()', 'EXECUTE'),
  'anon cannot EXECUTE public.get_user_business_id()'
);
SELECT ok(
  NOT has_function_privilege('public', 'public.get_user_business_id()', 'EXECUTE'),
  'PUBLIC cannot EXECUTE public.get_user_business_id()'
);
SELECT ok(
  has_function_privilege('authenticated', 'public.get_user_business_id()', 'EXECUTE'),
  'authenticated CAN EXECUTE public.get_user_business_id()'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.get_user_ca_firm_id()', 'EXECUTE'),
  'anon cannot EXECUTE public.get_user_ca_firm_id()'
);
SELECT ok(
  NOT has_function_privilege('public', 'public.get_user_ca_firm_id()', 'EXECUTE'),
  'PUBLIC cannot EXECUTE public.get_user_ca_firm_id()'
);
SELECT ok(
  has_function_privilege('authenticated', 'public.get_user_ca_firm_id()', 'EXECUTE'),
  'authenticated CAN EXECUTE public.get_user_ca_firm_id()'
);

-- -----------------------------------------------------------------------------
-- 2. Trigger-only functions: NO client role may EXECUTE
-- -----------------------------------------------------------------------------
SELECT ok(
  NOT has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
  'anon cannot EXECUTE handle_new_user()'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE'),
  'authenticated cannot EXECUTE handle_new_user()'
);
SELECT ok(
  NOT has_function_privilege('public', 'public.handle_new_user()', 'EXECUTE'),
  'PUBLIC cannot EXECUTE handle_new_user()'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.handle_ca_request_approval()', 'EXECUTE'),
  'anon cannot EXECUTE handle_ca_request_approval()'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.handle_ca_request_approval()', 'EXECUTE'),
  'authenticated cannot EXECUTE handle_ca_request_approval()'
);
SELECT ok(
  NOT has_function_privilege('public', 'public.handle_ca_request_approval()', 'EXECUTE'),
  'PUBLIC cannot EXECUTE handle_ca_request_approval()'
);

SELECT ok(
  NOT has_function_privilege('anon', 'public.update_updated_at_column()', 'EXECUTE'),
  'anon cannot EXECUTE update_updated_at_column()'
);
SELECT ok(
  NOT has_function_privilege('authenticated', 'public.update_updated_at_column()', 'EXECUTE'),
  'authenticated cannot EXECUTE update_updated_at_column()'
);
SELECT ok(
  NOT has_function_privilege('public', 'public.update_updated_at_column()', 'EXECUTE'),
  'PUBLIC cannot EXECUTE update_updated_at_column()'
);

-- -----------------------------------------------------------------------------
-- 3. Every owner-scoped table has a DELETE policy filtered by
--    get_user_business_id(). Two assertions per table:
--      (a) at least one DELETE policy exists
--      (b) at least one DELETE policy references get_user_business_id()
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  owned_tables text[] := ARRAY[
    'alerts',
    'bank_accounts',
    'compliance_events',
    'employees',
    'gst_filings',
    'gst_itc_lines',
    'payables',
    'payroll_records',
    'payroll_snapshots',
    'receivables',
    'tds_filings',
    'transactions',
    'vendor_gst_health'
  ];
BEGIN
  FOREACH t IN ARRAY owned_tables LOOP
    PERFORM ok(
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND cmd = 'DELETE'
      ),
      format('public.%s has a DELETE policy', t)
    );
    PERFORM ok(
      EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = t
          AND cmd = 'DELETE'
          AND qual ILIKE '%get_user_business_id()%'
      ),
      format('public.%s DELETE policy is owner-scoped', t)
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Audit / immutable tables: NO DELETE policy may exist
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  no_delete_tables text[] := ARRAY[
    'businesses',
    'ca_access_requests',
    'ca_activity_log',
    'ca_firms',
    'ca_notifications',
    'ca_reports_log',
    'csv_uploads',
    'gst_notice_risk_scores',
    'nidhi_briefs',
    'nidhi_conversations',
    'profiles',
    'receivable_chases',
    'simulations'
  ];
BEGIN
  FOREACH t IN ARRAY no_delete_tables LOOP
    PERFORM ok(
      NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = t AND cmd = 'DELETE'
      ),
      format('public.%s has NO DELETE policy (immutable)', t)
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 5. Behavioural test: cross-tenant DELETE is blocked by RLS.
--    Picks two existing tenants from the DB; emits skip() if fewer than 2
--    are present (typical in a fresh project).
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  user_a uuid;
  biz_a  uuid;
  biz_b  uuid;
  rec_b  uuid;
  deleted_count int;
BEGIN
  SELECT p.user_id, p.business_id INTO user_a, biz_a
  FROM public.profiles p
  WHERE p.business_id IS NOT NULL
  ORDER BY p.created_at
  LIMIT 1;

  SELECT b.id INTO biz_b
  FROM public.businesses b
  WHERE b.id IS DISTINCT FROM biz_a
  LIMIT 1;

  IF user_a IS NULL OR biz_b IS NULL THEN
    PERFORM skip(
      'cross-tenant DELETE: needs >=2 tenants in DB',
      2
    );
    RETURN;
  END IF;

  rec_b := gen_random_uuid();
  INSERT INTO public.receivables (id, business_id, customer_name, amount)
  VALUES (rec_b, biz_b, '__pgtap_rls_test__', 1);

  -- Switch to tenant A's identity.
  SET LOCAL ROLE authenticated;
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', user_a::text, 'role', 'authenticated')::text,
    true
  );

  DELETE FROM public.receivables WHERE id = rec_b;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RESET ROLE;

  PERFORM is(
    deleted_count,
    0,
    'tenant A cannot DELETE tenant B receivables row via RLS'
  );
  PERFORM ok(
    EXISTS (SELECT 1 FROM public.receivables WHERE id = rec_b),
    'tenant B receivable row survived cross-tenant DELETE attempt'
  );
END $$;

-- -----------------------------------------------------------------------------
-- Finalize
-- -----------------------------------------------------------------------------
SELECT * FROM finish();

ROLLBACK;
