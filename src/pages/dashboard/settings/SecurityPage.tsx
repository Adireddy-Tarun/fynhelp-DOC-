import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const RED = "#A93838";
const BORDER = "#E0D9C8";

const Card = ({ title, sub, danger, children }: { title: string; sub?: string; danger?: boolean; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in"
    style={{ borderColor: danger ? RED : BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: danger ? RED : "#1A1008" }}>{title}</h3>
    {sub && <p className="text-[12px] mt-1" style={{ color: "rgba(26,16,8,0.60)" }}>{sub}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A93838]/30";

const passwordStrength = (pw: string): { label: string; pct: number; color: string } => {
  let s = 0;
  if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { label: "Weak", pct: 33, color: "#DC2626" };
  if (s === 2 || s === 3) return { label: "Medium", pct: 66, color: "#D97706" };
  return { label: "Strong", pct: 100, color: "#16A34A" };
};

const sessions = [
  { device: "MacBook Pro", browser: "Chrome", location: "Bengaluru, India", lastActive: "2 min ago", current: true },
  { device: "iPhone 14", browser: "Safari", location: "Bengaluru, India", lastActive: "1 hour ago", current: false },
  { device: "Windows PC", browser: "Edge", location: "Mumbai, India", lastActive: "2 days ago", current: false },
];
const logins = [
  { dt: "13 Jun 2026 11:42 AM", device: "MacBook Pro", loc: "Bengaluru", ok: true },
  { dt: "12 Jun 2026 09:15 AM", device: "iPhone 14", loc: "Bengaluru", ok: true },
  { dt: "11 Jun 2026 03:22 PM", device: "MacBook Pro", loc: "Bengaluru", ok: true },
  { dt: "10 Jun 2026 08:45 AM", device: "MacBook Pro", loc: "Bengaluru", ok: true },
  { dt: "09 Jun 2026 02:11 PM", device: "Windows PC", loc: "Mumbai", ok: false },
];

const SecurityPage = () => {
  const [cur, setCur] = useState(""); const [np, setNp] = useState(""); const [cp, setCp] = useState("");
  const [twoFa, setTwoFa] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [delText, setDelText] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const strength = passwordStrength(np);

  const updatePw = () => {
    if (!cur || !np) return toast.error("Fill all fields");
    if (np !== cp) return toast.error("Passwords do not match");
    toast.success("Password updated");
    setCur(""); setNp(""); setCp("");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Security & Password</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Manage password, 2FA, sessions and API keys.</p>

      <Card title="Change Password">
        <input type="password" placeholder="Current password" value={cur} onChange={(e) => setCur(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} />
        <input type="password" placeholder="New password" value={np} onChange={(e) => setNp(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} />
        <input type="password" placeholder="Confirm new password" value={cp} onChange={(e) => setCp(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} />
        {np && (
          <div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3EBD9" }}>
              <div className="h-full transition-all" style={{ width: `${strength.pct}%`, background: strength.color }} />
            </div>
            <span className="text-[11px] font-medium mt-1 inline-block" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}
        <button onClick={updatePw} className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Update Password</button>
      </Card>

      <Card title="Two-Factor Authentication" sub="Add an extra layer of security to your account">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={twoFa} onCheckedChange={(v) => { setTwoFa(v); toast.success(v ? "2FA enabled" : "2FA disabled"); }} />
            <span className="text-[13px]">Enable 2FA</span>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full font-semibold"
            style={{ background: twoFa ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.12)", color: twoFa ? "#16A34A" : "#DC2626" }}>
            {twoFa ? "Enabled" : "Disabled"}
          </span>
        </div>
        {twoFa && (
          <div className="p-4 rounded-md grid grid-cols-2 gap-4" style={{ background: "#FAF7F0" }}>
            <div className="w-32 h-32 grid place-items-center text-[11px] border rounded" style={{ borderColor: BORDER, color: "rgba(26,16,8,0.4)" }}>QR CODE</div>
            <div>
              <p className="text-[12px] font-semibold mb-1">Backup codes</p>
              <ul className="text-[12px] font-mono space-y-0.5" style={{ color: "rgba(26,16,8,0.7)" }}>
                <li>X9F2-AB3C</li><li>R7K1-MN5P</li><li>QW8H-LT2D</li><li>VB6Y-CG4E</li>
              </ul>
            </div>
          </div>
        )}
      </Card>

      <Card title="Active Sessions">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Device</th><th>Browser</th><th>Location</th><th>Last Active</th><th></th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.device} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-3">{s.device}</td><td>{s.browser}</td><td>{s.location}</td><td>{s.lastActive}</td>
                <td className="text-right">
                  {s.current ? <span className="text-[11px] px-2 py-1 rounded" style={{ background: "rgba(22,163,74,0.15)", color: "#16A34A" }}>Current</span>
                    : <button onClick={() => toast.success("Session revoked")} className="text-[12px] px-3 py-1 rounded border font-medium" style={{ color: RED, borderColor: RED }}>Revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Login History">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Date/Time</th><th>Device</th><th>Location</th><th>Status</th></tr></thead>
          <tbody>
            {logins.map((l, i) => (
              <tr key={i} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-3">{l.dt}</td><td>{l.device}</td><td>{l.loc}</td>
                <td><span className="text-[11px] px-2 py-1 rounded font-medium"
                  style={{ background: l.ok ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.12)", color: l.ok ? "#16A34A" : "#DC2626" }}>
                  {l.ok ? "Success" : "Failed"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="API Keys" sub="Use API keys to access FynHelp data programmatically">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Key Name</th><th>Created</th><th>Last Used</th><th></th></tr></thead>
          <tbody>
            <tr className="border-t" style={{ borderColor: BORDER }}>
              <td className="py-3 font-mono">Default API Key</td><td>01 Jun 2026</td><td>10 Jun 2026</td>
              <td className="text-right"><button onClick={() => toast.success("Key revoked")} className="text-[12px] px-3 py-1 rounded border font-medium" style={{ color: RED, borderColor: RED }}>Revoke</button></td>
            </tr>
          </tbody>
        </table>
        <button onClick={() => {
          const k = "fyn_sk_" + Math.random().toString(36).slice(2, 18);
          setShowNewKey(k);
          setTimeout(() => setShowNewKey(null), 30000);
        }} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ color: RED, borderColor: RED }}>Generate New Key</button>
        {showNewKey && (
          <div className="p-3 rounded-md font-mono text-[12px] break-all" style={{ background: "#FAF7F0", border: `1px solid ${BORDER}` }}>
            {showNewKey} <span className="text-[11px] ml-2" style={{ color: "rgba(26,16,8,0.5)" }}>(visible for 30s)</span>
          </div>
        )}
      </Card>

      <Card title="Delete Account" sub="Permanently delete your account and all data. This cannot be undone." danger>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ color: RED, borderColor: RED }}>Delete Account</button>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px]">Type <span className="font-bold">DELETE</span> to confirm:</p>
            <input value={delText} onChange={(e) => setDelText(e.target.value)} className={inputCls} style={{ borderColor: RED }} />
            <div className="flex gap-2">
              <button disabled={delText !== "DELETE"} onClick={() => { toast.error("Account deletion requested"); setShowDelete(false); setDelText(""); }}
                className="px-4 py-2 rounded-md text-sm font-semibold text-white disabled:opacity-40" style={{ background: RED }}>Confirm Delete</button>
              <button onClick={() => { setShowDelete(false); setDelText(""); }} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: BORDER }}>Cancel</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SecurityPage;
