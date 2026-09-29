import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { completeWhatsappSignup, disconnectWhatsapp, getWhatsappSignupConfig } from "@/lib/caWhatsapp.functions";
import { useCARole } from "@/hooks/useCARole";
import { CA, CACard, CAButton, CABadge, dateIN } from "@/components/ca/portalUi";

interface WaConnection {
  id: string;
  phone_number: string;
  phone_number_id: string | null;
  display_name: string | null;
  is_active: boolean;
  is_coexistence: boolean;
  last_received_at: string | null;
}

interface SessionInfo { phone_number_id: string; waba_id: string; is_coexistence: boolean }

export function WhatsAppIntakeCard({ firmId }: { firmId: string | null }) {
  const getConfig = useServerFn(getWhatsappSignupConfig);
  const complete = useServerFn(completeWhatsappSignup);
  const disconnectFn = useServerFn(disconnectWhatsapp);
  const { role } = useCARole();
  const canManage = role === "partner" || role === "manager";

  const [config, setConfig] = useState<{ appId: string; configId: string; configured: boolean } | null>(null);
  const [conn, setConn] = useState<WaConnection | null>(null);
  const [connecting, setConnecting] = useState(false);
  const session = useRef<SessionInfo | null>(null);

  const load = useCallback(async () => {
    if (!firmId) return;
    const { data } = await supabase
      .from("ca_whatsapp_connections")
      .select("id, phone_number, phone_number_id, display_name, is_active, is_coexistence, last_received_at")
      .eq("ca_firm_id", firmId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setConn((data as WaConnection | null) ?? null);
  }, [firmId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    getConfig().then(setConfig).catch(() => setConfig({ appId: "", configId: "", configured: false }));
  }, [getConfig]);

  // Load the Facebook SDK once.
  useEffect(() => {
    if (!config?.configured) return;
    window.fbAsyncInit = () => window.FB?.init({ appId: config.appId, autoLogAppEvents: true, xfbml: false, version: "v21.0" });
    if (window.FB) { window.fbAsyncInit(); return; }
    if (document.getElementById("facebook-jssdk")) return;
    const s = document.createElement("script");
    s.id = "facebook-jssdk";
    s.src = "https://connect.facebook.net/en_US/sdk.js";
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    document.body.appendChild(s);
  }, [config]);

  // Listen for Embedded Signup session info.
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        if (!new URL(event.origin).hostname.endsWith("facebook.com")) return;
      } catch { return; }
      let data: any;
      try { data = typeof event.data === "string" ? JSON.parse(event.data) : null; } catch { return; }
      if (!data || data.type !== "WA_EMBEDDED_SIGNUP") return;
      if (String(data.event).startsWith("FINISH")) {
        session.current = {
          phone_number_id: String(data.data?.phone_number_id ?? ""),
          waba_id: String(data.data?.waba_id ?? ""),
          is_coexistence: data.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
        };
      } else if (data.event === "CANCEL") {
        toast("WhatsApp connection was cancelled");
        session.current = null;
        setConnecting(false);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const connect = () => {
    if (!config?.configured || !firmId || !window.FB) {
      if (!window.FB) toast.error("Facebook is still loading. Try again in a moment.");
      return;
    }
    setConnecting(true);
    session.current = null;
    window.FB.login((response) => {
      const code = response.authResponse?.code;
      if (!code) { toast("WhatsApp connection was not completed"); setConnecting(false); return; }
      let waited = 0;
      const timer = window.setInterval(async () => {
        waited += 200;
        const info = session.current;
        if (info?.phone_number_id && info.waba_id) {
          window.clearInterval(timer);
          try {
            const res = await complete({ data: { code, waba_id: info.waba_id, phone_number_id: info.phone_number_id, firm_id: firmId, is_coexistence: info.is_coexistence } });
            toast.success(`WhatsApp connected — ${res.phone_number}`);
            void load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not connect WhatsApp");
          } finally {
            setConnecting(false);
          }
        } else if (waited >= 3000) {
          window.clearInterval(timer);
          toast.error("Meta did not return your number details. Please try again.");
          setConnecting(false);
        }
      }, 200);
    }, {
      config_id: config.configId,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {}, featureType: "whatsapp_business_app_onboarding", sessionInfoVersion: "3" },
    });
  };

  const disconnect = async () => {
    if (!firmId || !window.confirm("Disconnect WhatsApp? New documents will stop arriving.")) return;
    try {
      await disconnectFn({ data: { firm_id: firmId } });
      toast.success("WhatsApp disconnected");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not disconnect WhatsApp");
    }
  };

  const connected = !!conn && conn.is_active && !!conn.phone_number_id;
  const label = { fontFamily: CA.sans, fontSize: 11.5, color: CA.faint, marginBottom: 4 } as const;
  const muted = { fontFamily: CA.sans, fontSize: 12, color: CA.muted, marginTop: 8 } as const;

  return (
    <CACard style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${CA.line}`, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: CA.sans, fontSize: 14, fontWeight: 700, color: CA.ink }}>WhatsApp Intake</div>
          <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 2 }}>
            Documents your clients send you on WhatsApp are extracted and routed to the right client automatically.
          </div>
        </div>
        {connected && canManage && (
          <CAButton variant="danger" onClick={disconnect} style={{ fontSize: 12, padding: "5px 10px", flexShrink: 0 }}>Disconnect</CAButton>
        )}
      </div>

      <div style={{ padding: 20 }}>
        {connected ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
            <div><div style={label}>Number</div><div style={{ fontFamily: CA.mono, fontSize: 12.5 }}>{conn!.phone_number}</div></div>
            <div><div style={label}>Display name</div><div style={{ fontFamily: CA.sans, fontSize: 12.5 }}>{conn!.display_name ?? "—"}</div></div>
            <div><div style={label}>Status</div><CABadge tone="green">Active</CABadge></div>
            {conn!.is_coexistence && <div><div style={label}>Mode</div><div style={{ fontFamily: CA.sans, fontSize: 12.5 }}>Shared with WhatsApp Business app</div></div>}
            <div><div style={label}>Last document</div><div style={{ fontFamily: CA.sans, fontSize: 12.5 }}>{conn!.last_received_at ? dateIN(conn!.last_received_at) : "None yet"}</div></div>
          </div>
        ) : !canManage ? (
          <div style={muted}>Only partners and managers can change the WhatsApp connection.</div>
        ) : config && !config.configured ? (
          <>
            <CAButton disabled>Connect WhatsApp</CAButton>
            <div style={muted}>WhatsApp connect is not configured yet</div>
          </>
        ) : (
          <>
            <CAButton onClick={connect} disabled={connecting || !config}>{connecting ? "Connecting…" : "Connect WhatsApp"}</CAButton>
            <div style={muted}>You will log in with Facebook and verify your number with a one time code. Takes about 2 minutes.</div>
          </>
        )}
        {connected && !canManage && <div style={muted}>Only partners and managers can change the WhatsApp connection.</div>}
      </div>
    </CACard>
  );
}
