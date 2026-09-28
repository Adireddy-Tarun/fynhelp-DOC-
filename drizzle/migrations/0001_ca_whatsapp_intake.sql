CREATE TABLE IF NOT EXISTS public.ca_whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_firm_id UUID NOT NULL REFERENCES public.ca_firms(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  phone_number_id TEXT,
  display_name TEXT,
  access_token_enc TEXT,
  app_secret_enc TEXT,
  webhook_verify_token TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  last_received_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ca_firm_id, phone_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ca_whatsapp_connections TO authenticated;
GRANT ALL ON public.ca_whatsapp_connections TO service_role;
ALTER TABLE public.ca_whatsapp_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CA firm members can manage own WhatsApp connections"
ON public.ca_whatsapp_connections FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_conn_phone_number_id ON public.ca_whatsapp_connections(phone_number_id) WHERE phone_number_id IS NOT NULL AND is_active;

CREATE TABLE IF NOT EXISTS public.ca_whatsapp_sender_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_firm_id UUID NOT NULL,
  business_id UUID NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_name TEXT,
  match_method TEXT DEFAULT 'manual',
  confidence NUMERIC DEFAULT 0.95,
  confirmed_by_user_id UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ca_firm_id, sender_phone)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ca_whatsapp_sender_mappings TO authenticated;
GRANT ALL ON public.ca_whatsapp_sender_mappings TO service_role;
ALTER TABLE public.ca_whatsapp_sender_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CA firm members can manage WhatsApp mappings"
ON public.ca_whatsapp_sender_mappings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_sender_mappings.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active'))
WITH CHECK (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_sender_mappings.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active'));

ALTER TABLE public.ca_document_extractions
  ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sender_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_sender_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_caption TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_match_method TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_match_confidence NUMERIC;
ALTER TABLE public.ca_clients ADD COLUMN IF NOT EXISTS client_phone TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_extractions_whatsapp_message
ON public.ca_document_extractions(ca_firm_id, whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
ALTER TABLE public.ca_firms ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;