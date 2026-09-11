import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { completeGmailConnect } from "@/lib/caGmail.functions";
import { CA, CACard, CAButton } from "@/components/ca/portalUi";

export default function CAGmailCallbackPage() {
  const navigate = useNavigate();
  const complete = useServerFn(completeGmailConnect);
  const started = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      console.log("[fyn:gmail] oauth callback received");
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error || !code || !state) {
        setErrorMsg(
          error === "access_denied"
            ? "You declined Gmail access. You can try again from the Integrations page."
            : "Something went wrong with the Google authorisation. Please try again.",
        );
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Your session expired. Please sign in again, then reconnect Gmail.");
        return;
      }

      try {
        const res = await complete({ data: { code, state, origin: window.location.origin } });
        toast.success(`Gmail connected — ${res.gmailAddress}`);
        navigate("/ca/integrations", { replace: true });
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Could not complete the Gmail connection.");
      }
    };

    void run();
  }, [complete, navigate]);

  if (errorMsg) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CA.page, padding: 24 }}>
        <CACard style={{ maxWidth: 440, padding: 36, textAlign: "center" }}>
          <div style={{ fontFamily: CA.serif, fontSize: 20, fontWeight: 700, color: CA.ink }}>Gmail not connected</div>
          <div style={{ fontFamily: CA.sans, fontSize: 13.5, color: CA.red, marginTop: 14, marginBottom: 20, lineHeight: 1.6 }}>{errorMsg}</div>
          <CAButton onClick={() => navigate("/ca/integrations")}>Back to Integrations</CAButton>
        </CACard>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: CA.page }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: CA.serif, fontSize: 20, fontWeight: 700, color: CA.ink }}>FynHelp</div>
        <p style={{ fontFamily: CA.sans, fontSize: 14, color: CA.muted, marginTop: 12 }}>Connecting your Gmail…</p>
      </div>
    </div>
  );
}
