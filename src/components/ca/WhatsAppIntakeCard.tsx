import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { activateWhatsApp } from "@/lib/caWhatsapp.functions";
import { CA, CACard, CAButton, CABadge, caInputStyle, dateIN } from "@/components/ca/portalUi";

interface WaConnection {
  id: string;
  phone_number: string;
  display_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  last_received_at: string | null;
  webhook_verify_token: string;
  error_message: string | null;
}

const WEBHOOK_URL = "https://fynhelp.lovable.app/api/public/ca-whatsapp-webhook";

export function WhatsAppIntakeCard({ firmId }: { firmId: string | null }) {
  const activate = useServerFn(activateWhatsApp);
  const [conn, setConn] = useState<WaConnection | null>(null);
  const [phone, setPhone] = useState("+91");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [token, setToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!firmId) return;
    const { data } = await supabase
      .from("ca_whatsapp_connections")
      .select("id, phone_number, display_name, is_active, is_verified, last_received_at, webhook_verify_token, error_message")
      .eq("ca_firm_id", firmId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setConn((data as WaConnection | null) ?? null);
  }, [firmId]);

  useEffect(() => { void load(); }, [load]);

  const connect = async () => {
    if (!firmId) return;
    const clean = phone.replace(/\s/g, "");
    if (!/^\+\d{10,15}$/.test(clean)) return toast.error("Enter the number as +91XXXXXXXXXX");
    setBusy(true);
    const { error } = await supabase.from("ca_whatsapp_connections").insert({ ca_firm_id: firmId, phone_number: clean });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Number saved. Finish the setup steps below.");
    void load();
  };

  const doActivate = async () => {
    if (!conn) return;
    setBusy(true);
    try {
      await activate({ data: { connectionId: conn.id, phoneNumberId, accessToken: token, appSecret } });
      toast.success("WhatsApp intake is active");
      setToken(""); setAppSecret("");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not activate WhatsApp");
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    if (!conn || !window.confirm("Stop receiving WhatsApp documents from this number?")) return;
    const { error } = await supabase.from("ca_whatsapp_connections").delete().eq("id", conn.id);
    if (error) return toast.error(error.message);
    toast.success("WhatsApp disconnected");
    setConn(null);
  };

  const copy = (v: string) => { void navigator.clipboard.writeText(v); toast.success("Copied"); };
  const label = { fontFamily: CA.sans, fontSize: 11.5, color: CA.faint, marginBottom: 4 } as const;
  const mono = { fontFamily: CA.mono, fontSize: 12, color: CA.ink, wordBreak: "break-all" } as const;

  return (
    <CACard style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `0.5px solid ${CA.line}`, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: CA.sans, fontSize: 14, fontWeight: 700, color: CA.ink }}>WhatsApp Intake</div>
          <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 2 }}>
            Connect your WhatsApp Business number. Documents your clients send you on WhatsApp are automatically extracted and routed to the correct client project.
          </div>
        </div>
        {conn && (
          <CAButton variant="danger" onClick={disconnect} style={{ fontSize: 12, padding: "5px 10px", flexShrink: 0 }}>Disconnect</CAButton>
        )}
      </div>

      <div style={{ padding: 20 }}>
        {!conn ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" style={{ ...caInputStyle, maxWidth: 240 }} />
            <CAButton onClick={connect} disabled={busy}>{busy ? "Saving…" : "Connect WhatsApp"}</CAButton>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
              <div><div style={label}>Number</div><div style={mono}>{conn.phone_number}{conn.display_name ? ` · ${conn.display_name}` : ""}</div></div>
              <div><div style={label}>Status</div><CABadge tone={conn.is_active ? "green" : "amber"}>{conn.is_active ? "active" : "setup pending"}</CABadge></div>
              <div><div style={label}>Meta webhook check</div><CABadge tone={conn.is_verified ? "green" : "grey"}>{conn.is_verified ? "verified" : "not yet"}</CABadge></div>
              <div><div style={label}>Last document</div><div style={{ fontFamily: CA.sans, fontSize: 12.5 }}>{conn.last_received_at ? dateIN(conn.last_received_at) : "None yet"}</div></div>
            </div>
            {conn.error_message && <div style={{ fontFamily: CA.sans, fontSize: 12, color: CA.red, marginBottom: 12 }}>{conn.error_message}</div>}

            {!conn.is_active && (
              <>
                <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                  <div><div style={label}>Callback URL</div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={mono}>{WEBHOOK_URL}</span><CAButton variant="ghost" onClick={() => copy(WEBHOOK_URL)} style={{ fontSize: 11, padding: "3px 8px" }}>Copy</CAButton></div></div>
                  <div><div style={label}>Verify token</div><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={mono}>{conn.webhook_verify_token}</span><CAButton variant="ghost" onClick={() => copy(conn.webhook_verify_token)} style={{ fontSize: 11, padding: "3px 8px" }}>Copy</CAButton></div></div>
                </div>
                <ol style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, lineHeight: 1.8, paddingLeft: 18, marginBottom: 16 }}>
                  <li>Go to developers.facebook.com and create a WhatsApp Business app</li>
                  <li>Add your number {conn.phone_number} as a WhatsApp Business number</li>
                  <li>In Webhooks, set the callback URL to the URL shown above</li>
                  <li>Set the verify token to the token shown above</li>
                  <li>Subscribe to the messages field</li>
                  <li>Copy the Phone number ID, a permanent access token and the App secret (App settings, Basic) and paste them below</li>
                  <li>Click Activate</li>
                </ol>
                <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
                  <input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="Phone number ID" style={caInputStyle} />
                  <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Permanent access token" type="password" style={caInputStyle} />
                  <input value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder="App secret" type="password" style={caInputStyle} />
                  <div><CAButton onClick={doActivate} disabled={busy}>{busy ? "Checking with Meta…" : "Activate"}</CAButton></div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </CACard>
  );
}
