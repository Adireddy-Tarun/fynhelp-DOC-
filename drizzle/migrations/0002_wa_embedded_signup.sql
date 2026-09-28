ALTER TABLE public.ca_whatsapp_connections ADD COLUMN IF NOT EXISTS waba_id TEXT;
ALTER TABLE public.ca_whatsapp_connections ADD COLUMN IF NOT EXISTS is_coexistence BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.ca_whatsapp_connections ALTER COLUMN webhook_verify_token DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_connections_phone_number_id ON public.ca_whatsapp_connections(phone_number_id) WHERE phone_number_id IS NOT NULL;
DROP POLICY IF EXISTS "CA firm members can manage own WhatsApp connections" ON public.ca_whatsapp_connections;
CREATE POLICY "Firm members can view WhatsApp connections" ON public.ca_whatsapp_connections FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active'));
CREATE POLICY "Partners and managers can insert WhatsApp connections" ON public.ca_whatsapp_connections FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active' AND m.role IN ('partner','manager')));
CREATE POLICY "Partners and managers can update WhatsApp connections" ON public.ca_whatsapp_connections FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active' AND m.role IN ('partner','manager')))
WITH CHECK (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active' AND m.role IN ('partner','manager')));
CREATE POLICY "Partners and managers can delete WhatsApp connections" ON public.ca_whatsapp_connections FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.ca_firm_members m WHERE m.ca_firm_id = ca_whatsapp_connections.ca_firm_id AND m.user_id = auth.uid() AND m.status = 'active' AND m.role IN ('partner','manager')));