import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertCircle, ChevronRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Internal Access, moved from /demo/login (previously the "Access" tab).
 * Grants the team access to the demo dashboard by validating the password
 * server-side via the `verify-demo-password` edge function and storing the
 * returned short-lived HMAC-signed token in sessionStorage.
 */
export default function AdminInternalAccessPage() {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(
    typeof window !== "undefined" && !!sessionStorage.getItem("demo_access_token"),
  );

  const handleAccess = async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("verify-demo-password", {
        body: { password },
      });
      if (fnErr || !data?.token) {
        setError(true);
      } else {
        sessionStorage.setItem("demo_access_token", data.token as string);
        sessionStorage.setItem("demo_access", "true"); // back-compat for older gates
        setGranted(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const revoke = () => {
    sessionStorage.removeItem("demo_access_token");
    sessionStorage.removeItem("demo_access");
    setGranted(false);
    setPassword("");
  };


  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 28,
            color: "hsl(var(--fyn-ink))",
            margin: 0,
          }}
        >
          Internal Access
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            color: "hsl(var(--fyn-ink) / 0.6)",
            marginTop: 6,
          }}
        >
          Unlock the demo dashboard for the FYNHelp team.
        </p>
      </div>

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid hsl(var(--fyn-gold) / 0.25)",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 8px 24px hsl(var(--fyn-ink) / 0.06)",
        }}
      >
        {granted ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#1A6B3C",
                fontFamily: "Inter, sans-serif",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              <CheckCircle size={20} /> Access granted for this session
            </div>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "hsl(var(--fyn-ink) / 0.65)",
                margin: 0,
              }}
            >
              The internal demo dashboard is unlocked until this browser tab is closed.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => nav("/demo/dashboard")}
                style={{
                  background: "#C41E1E",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Open Demo Dashboard <ChevronRight size={16} />
              </button>
              <button
                onClick={revoke}
                style={{
                  background: "transparent",
                  color: "hsl(var(--fyn-ink))",
                  border: "1px solid hsl(var(--fyn-ink) / 0.2)",
                  borderRadius: 10,
                  padding: "12px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Revoke session access
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                color: "hsl(var(--fyn-ink))",
              }}
            >
              Access password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--fyn-ink) / 0.4)",
                }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAccess()}
                placeholder="Enter internal password"
                autoFocus
                style={{
                  width: "100%",
                  height: 46,
                  paddingLeft: 40,
                  paddingRight: 14,
                  borderRadius: 10,
                  border: error
                    ? "1.5px solid #C41E1E"
                    : "1.5px solid hsl(var(--fyn-ink) / 0.15)",
                  background: "#FAF7F0",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "hsl(var(--fyn-ink))",
                  outline: "none",
                }}
              />
            </div>
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  color: "#C41E1E",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <AlertCircle size={12} /> Incorrect password. Try again.
              </div>
            )}
            <button
              onClick={handleAccess}
              disabled={loading || !password}
              style={{
                background: "#C41E1E",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: loading || !password ? "not-allowed" : "pointer",
                opacity: loading || !password ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              {loading ? "Verifying…" : (
                <>
                  Unlock Demo Access <ChevronRight size={16} />
                </>
              )}
            </button>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "hsl(var(--fyn-ink) / 0.5)",
                margin: 0,
                marginTop: 4,
              }}
            >
              For the FYNHelp internal team only. Access is scoped to this browser session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
