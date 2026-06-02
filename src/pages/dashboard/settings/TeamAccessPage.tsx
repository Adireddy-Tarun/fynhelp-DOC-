import { useState } from "react";
import { Users, ChevronDown, FileCheck } from "lucide-react";

/* ============================================================
   FynHelp, Team & Access
   Inter only · backend stubbed
   ============================================================ */

const PAGE_WRAP: React.CSSProperties = {
  maxWidth: 900, margin: "0 auto", padding: "40px 48px", fontFamily: "'Inter', sans-serif",
};
const CARD: React.CSSProperties = {
  background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 10, padding: 28, marginBottom: 24,
};

type Member = { id: string; name: string; email: string; role: string; status: "active" | "pending"; isOwner?: boolean };

// BACKEND: SELECT * FROM team_members WHERE business_id = get_user_business_id()
const initialMembers: Member[] = [
  { id: "owner", name: "Adireddy Tarun", email: "tarun@mehtatextile.com", role: "Owner", status: "active", isOwner: true },
];

const ROLE_OPTIONS = [
  "CA Partner (read-only)",
  "Accountant (data entry)",
  "HR Manager (HR module only)",
  "Operations (cost + vendors)",
  "Admin (most access)",
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "CA Partner (read-only)": "Read-only access to financial data. CA-optimised view.",
  "Accountant (data entry)": "Can edit GST data, receivables, payables, and reports.",
  "HR Manager (HR module only)": "Access only to HR Intelligence and payroll data.",
  "Operations (cost + vendors)": "Can manage cost analysis, vendors, and procurement.",
  "Admin (most access)": "Full access except billing and team management.",
};

const Avatar = ({ name, isOwner }: { name: string; isOwner?: boolean }) => {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: isOwner ? "#C41E1E" : "#8B8478", color: "#FFFFFF",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0,
    }}>{initials}</div>
  );
};

const TeamAccessPage = () => {
  const [members] = useState<Member[]>(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLE_OPTIONS[0]);
  const [emailFocused, setEmailFocused] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [caEmail, setCaEmail] = useState("");
  const [caEmailFocused, setCaEmailFocused] = useState(false);

  // BACKEND: businesses.plan + plan_seat_limits lookup
  const seatLimit = 3;
  const seatsUsed = members.length;
  const pct = Math.round((seatsUsed / seatLimit) * 100);

  const handleInvite = () => {
    if (!inviteEmail) return;
    // BACKEND: POST /api/team/invite { email, role, business_id }
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => setInviteSent(false), 3000);
  };

  const inputBase = (focused: boolean): React.CSSProperties => ({
    height: 42, padding: "0 12px",
    background: "#FFFFFF",
    border: focused ? "1.5px solid #C41E1E" : "1px solid #D4C9A8",
    borderRadius: 6, outline: "none",
    boxShadow: focused ? "0 0 0 3px rgba(196,30,30,0.08)" : "none",
    fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "#1A1008",
  });

  return (
    <div style={PAGE_WRAP}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Team & Access</h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)", marginTop: 6 }}>
        Control who can see your financial data and what they can do with it.
      </p>

      {/* Plan capacity */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        margin: "24px 0 32px",
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>
          {seatsUsed} of {seatLimit} seats used
        </span>
        <div style={{ flex: 1, maxWidth: 220, height: 6, background: "#E0D9C8", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#8B6914" }} />
        </div>
        {seatsUsed >= seatLimit && (
          <button style={{
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#C41E1E",
          }}>Upgrade for more seats →</button>
        )}
      </div>

      {/* SECTION 1: Current Team */}
      <div style={CARD}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 16 }}>Team members</h2>

        {/* Header row */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1fr 1fr",
          gap: 16, padding: "0 0 12px", borderBottom: "1px solid #F0EBD8",
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12,
          color: "rgba(26,16,8,0.50)", letterSpacing: "0.06em", textTransform: "uppercase",
        }}>
          <div>Member</div><div>Role</div><div>Access Level</div><div>Status</div><div>Actions</div>
        </div>

        {/* Member rows */}
        {members.map((m) => (
          <div key={m.id} style={{
            display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1fr 1fr",
            gap: 16, alignItems: "center", padding: "16px 0",
            borderBottom: "1px solid #F0EBD8",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={m.name} isOwner={m.isOwner} />
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{m.name}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)" }}>{m.email}</div>
              </div>
            </div>
            <div>
              {m.isOwner ? (
                <span style={{
                  background: "#1A1008", color: "#FFFFFF", borderRadius: 100, padding: "3px 10px",
                  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
                }}>Owner</span>
              ) : (
                <select defaultValue={m.role} style={{
                  width: "100%", height: 36, padding: "0 10px",
                  border: "1px solid #D4C9A8", borderRadius: 6, background: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1A1008",
                }}>
                  {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              )}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.60)" }}>
              {m.isOwner ? "Full access" : ROLE_DESCRIPTIONS[m.role] || "-"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.status === "active" ? "#16A34A" : "#F59E0B" }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: m.status === "active" ? "#166534" : "#92400E" }}>
                {m.status === "active" ? "Active" : "Pending"}
              </span>
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
              color: m.isOwner ? "rgba(26,16,8,0.35)" : "#C41E1E", cursor: m.isOwner ? "default" : "pointer",
            }}>
              {m.isOwner ? "That's you" : "Remove"}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {members.filter((m) => !m.isOwner).length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Users size={48} style={{ color: "rgba(26,16,8,0.15)", margin: "0 auto" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "rgba(26,16,8,0.50)", marginTop: 12 }}>No team members yet</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.40)", marginTop: 6 }}>
              Add your CA or accountant to give them read-only access to your data
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Invite */}
      <div style={CARD}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 16 }}>Invite a team member</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap" }}>
          <input
            type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
            placeholder="colleague@company.com"
            style={{ ...inputBase(emailFocused), flex: 1, minWidth: 220 }}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} style={{
            ...inputBase(false), width: 220, cursor: "pointer", appearance: "none",
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231A1008' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")",
            backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32,
          }}>
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button onClick={handleInvite} style={{
            height: 42, padding: "0 20px", borderRadius: 6,
            background: "#C41E1E", border: "none", color: "#FFFFFF",
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Send Invite</button>
        </div>

        {inviteSent && (
          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 6,
            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#166534",
          }}>Invite sent ✓</div>
        )}

        {/* Role matrix accordion */}
        <button onClick={() => setMatrixOpen(!matrixOpen)} style={{
          marginTop: 20, background: "transparent", border: "none", padding: 0, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#C41E1E",
        }}>
          What can each role see? <ChevronDown size={14} style={{ transform: matrixOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms" }} />
        </button>

        {matrixOpen && (
          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E0D9C8" }}>
                  {["Feature", "CA Partner", "Accountant", "HR Manager", "Admin"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 500, fontSize: 12, color: "rgba(26,16,8,0.50)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cash & Bank", "View", "View", "Hidden", "View"],
                  ["GST Data", "View", "View+Edit", "Hidden", "View+Edit"],
                  ["HR Data", "Hidden", "Hidden", "View+Edit", "View"],
                  ["Receivables", "View", "View+Edit", "Hidden", "View+Edit"],
                  ["Payables", "View", "View+Edit", "Hidden", "View+Edit"],
                  ["Simulations", "View", "Run", "Hidden", "Run+Save"],
                  ["Reports", "Download", "Download", "HR only", "All"],
                  ["Settings", "Hidden", "Hidden", "Hidden", "Limited"],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F5F0E0" }}>
                    {row.map((cell, j) => {
                      const color =
                        cell === "Hidden" ? "rgba(26,16,8,0.25)" :
                        cell.includes("Edit") || cell === "Run+Save" || cell === "All" || cell === "Run" ? "#166534" :
                        "rgba(26,16,8,0.60)";
                      const italic = cell === "Hidden";
                      return (
                        <td key={j} style={{ padding: "10px 12px", color, fontStyle: italic ? "italic" : "normal", fontWeight: j === 0 ? 500 : 400 }}>{cell}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: CA Partner Access */}
      <div style={{ ...CARD, background: "#FAF7F0" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 4 }}>CA Partner Access</h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.65)", lineHeight: 1.6, marginBottom: 16 }}>
              Give your Chartered Accountant read-only access to your FynHelp data. They get a dedicated view optimised for CA workflows including client reporting and GST reconciliation.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email" value={caEmail} onChange={(e) => setCaEmail(e.target.value)}
                onFocus={() => setCaEmailFocused(true)} onBlur={() => setCaEmailFocused(false)}
                placeholder="ca@yourfirm.com"
                style={{ ...inputBase(caEmailFocused), flex: 1 }}
              />
              {/* BACKEND: POST /api/team/invite { email, role: 'ca_partner' } */}
              <button style={{
                height: 42, padding: "0 20px", borderRadius: 6,
                background: "#C41E1E", border: "none", color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>Grant CA Access</button>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)", marginTop: 10 }}>
              Your CA gets a separate portal view. They cannot make changes to your data.
            </p>
          </div>
          <div style={{ width: 140, textAlign: "center", flexShrink: 0 }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              border: "2px solid #8B6914", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto",
            }}>
              <FileCheck size={36} color="#8B6914" />
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, color: "#8B6914", marginTop: 10 }}>CA Partner</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAccessPage;
