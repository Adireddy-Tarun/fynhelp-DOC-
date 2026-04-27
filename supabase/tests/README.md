# Database security tests

Two equivalent suites. Use **pgTAP** in CI; the plain-SQL version is kept
as a zero-dependency fallback.

## Files

| File | Format | Run with |
|---|---|---|
| `security_regression.test.sql` | pgTAP (TAP output) | `pg_prove` or `supabase test db` |
| `security_regression.sql`      | plain SQL `RAISE EXCEPTION` | `psql -f` |

Both verify the same invariants:

1. `get_user_business_id()` and `get_user_ca_firm_id()` are **callable by
   `authenticated` only** — not by `anon` or `PUBLIC`.
2. Trigger-only functions (`handle_new_user`, `handle_ca_request_approval`,
   `update_updated_at_column`) are **not callable by any client role**.
3. Every owner-scoped table (`receivables`, `payables`, `transactions`,
   `alerts`, etc.) has a `DELETE` policy whose `USING` clause references
   `get_user_business_id()`.
4. Audit / immutable tables (`csv_uploads`, `nidhi_briefs`, `profiles`,
   `ca_activity_log`, …) have **no `DELETE` policy at all**.
5. Behavioural: when ≥2 tenants exist, tenant A cannot `DELETE` tenant B's
   receivable row (RLS blocks it; the test skips on a fresh DB).

Everything runs inside a transaction that is `ROLLBACK`ed at the end —
no test data persists.

## Local run (pgTAP)

```bash
# Requires libtap-parser-sourcehandler-pgtap-perl (apt) or
#   cpan TAP::Parser::SourceHandler::pgTAP
pg_prove -d "$SUPABASE_DB_URL" supabase/tests/security_regression.test.sql
```

Or with raw psql (any psql client works, no extra deps):

```bash
psql "$SUPABASE_DB_URL" -X -q -f supabase/tests/security_regression.test.sql
```

## Supabase CLI

```bash
supabase test db
```

Picks up any `*.test.sql` under `supabase/tests/` automatically.

## Plain-SQL fallback

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security_regression.sql
```

Prints `OK: …` per assertion and exits non-zero on first failure.
