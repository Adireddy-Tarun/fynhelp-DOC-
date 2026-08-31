/**
 * Manual RBAC validation guide. Shown when a firm still has a single member,
 * so the partner can invite a test user and walk the role checks before going
 * live. Progress is remembered per firm in the browser.
 */
import { useEffect, useState } from "react";
import { CA, CACard, CAButton } from "@/components/ca/portalUi";

const CHECKS = [
  "Log in as the Junior user in a separate browser or private window",
  "Open Billing. The page should load but Save invoice should be disabled",
  "Create a document request. This should work",
  "Try to lock a period in Close. This should be blocked, Partner only",
  "Try to sign off a working paper. This should be blocked, Partner only",
  "Open Users and roles. The Junior should see a read only view with no invite button",
];

export default function RbacTestPanel({
  firmId,
  onQuickInvite,
}: {
  firmId: string;
  onQuickInvite: (role: string) => void;
}) {
  const key = `fyn_rbac_checks_${firmId}`;
  const [done, setDone] = useState<boolean[]>(() => CHECKS.map(() => false));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as boolean[];
        if (Array.isArray(parsed) && parsed.length === CHECKS.length) setDone(parsed);
      }
    } catch {
      // Ignore unreadable local state.
    }
  }, [key]);

  const toggle = (i: number) => {
    setDone((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore write failures in restricted browsers.
      }
      return next;
    });
  };

  const completed = done.filter(Boolean).length;

  return (
    <CACard style={{ marginTop: 18, padding: "18px 20px" }}>
      <div style={{ fontFamily: CA.serif, fontSize: 16, fontWeight: 700, color: CA.ink }}>
        Role based access test mode
      </div>
      <div style={{ fontFamily: CA.sans, fontSize: 13.5, color: CA.muted, marginTop: 8, lineHeight: 1.6 }}>
        Your firm has only one member. To validate role based access controls before going live, invite a test user and
        assign them the Junior role. Use a second email address you control.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <CAButton onClick={() => onQuickInvite("junior")}>Invite as Junior</CAButton>
        <CAButton variant="ghost" onClick={() => onQuickInvite("manager")}>Invite as Manager</CAButton>
      </div>

      <div
        style={{
          fontFamily: CA.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
          textTransform: "uppercase", color: CA.faint, marginTop: 20, marginBottom: 8,
        }}
      >
        Validation checklist
        <span style={{ fontFamily: CA.mono, marginLeft: 10, color: CA.muted, letterSpacing: 0 }}>
          {completed} of {CHECKS.length} done
        </span>
      </div>

      <div style={{ display: "grid", gap: 2 }}>
        {CHECKS.map((c, i) => (
          <label
            key={c}
            style={{
              display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0",
              borderBottom: `0.5px solid ${CA.line}`, cursor: "pointer",
            }}
          >
            <input type="checkbox" checked={done[i] ?? false} onChange={() => toggle(i)} style={{ marginTop: 3 }} />
            <span
              style={{
                fontFamily: CA.sans, fontSize: 13.5, lineHeight: 1.5,
                color: done[i] ? CA.faint : CA.ink,
                textDecoration: done[i] ? "line-through" : "none",
              }}
            >
              <span style={{ fontFamily: CA.mono, fontSize: 11.5, color: CA.muted, marginRight: 8 }}>
                Step {i + 1}
              </span>
              {c}
            </span>
          </label>
        ))}
      </div>

      <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.faint, marginTop: 12 }}>
        This is a manual quality check guide, not an automated test run.
      </div>
    </CACard>
  );
}
