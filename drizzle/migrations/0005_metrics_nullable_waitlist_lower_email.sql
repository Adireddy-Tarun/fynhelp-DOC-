ALTER TABLE public.liquidity_metrics ALTER COLUMN cash_position DROP NOT NULL;
ALTER TABLE public.liquidity_metrics ALTER COLUMN burn_rate_current DROP NOT NULL;
ALTER TABLE public.liquidity_metrics ALTER COLUMN runway_months DROP NOT NULL;
ALTER TABLE public.liquidity_metrics ALTER COLUMN runway_days DROP NOT NULL;
ALTER TABLE public.liquidity_metrics ALTER COLUMN health_score DROP NOT NULL;
ALTER TABLE public.liquidity_metrics ADD COLUMN IF NOT EXISTS cash_source TEXT;
ALTER TABLE public.liquidity_metrics ADD COLUMN IF NOT EXISTS transactions_analyzed INTEGER;
COMMENT ON COLUMN public.liquidity_metrics.cash_source IS 'bank_balance | derived_balance | derived_cumulative | none. NULL metric = not computable (not zero).';
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_key ON public.waitlist (lower(email));