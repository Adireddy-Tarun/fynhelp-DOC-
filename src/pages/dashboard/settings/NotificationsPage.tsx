import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AlertRow {
  category: string;
  description: string;
  group: "critical" | "warning" | "info" | "brief";
  whatsapp: boolean;
  email: boolean;
  inApp: boolean;
  locked?: boolean;
}

const defaultAlerts: AlertRow[] = [
  { category: "Cash below threshold", description: "When cash drops below your limit", group: "critical", whatsapp: true, email: true, inApp: true, locked: true },
  { category: "Payroll cash risk", description: "10 days before if cash may be tight", group: "critical", whatsapp: true, email: true, inApp: true, locked: true },
  { category: "ITC mismatch", description: "When 2B mismatches found on 14th", group: "warning", whatsapp: true, email: true, inApp: true },
  { category: "Overdue receivables", description: "When customer 30/60/90 days overdue", group: "warning", whatsapp: true, email: true, inApp: true },
  { category: "Filing deadline", description: "14/7/3/0 days before each filing", group: "warning", whatsapp: true, email: true, inApp: true },
  { category: "Vendor GST risk", description: "When vendor compliance drops below 60", group: "warning", whatsapp: true, email: true, inApp: true },
  { category: "Monthly CFO report", description: "Auto-generated on 1st of month", group: "info", whatsapp: false, email: false, inApp: true },
  { category: "CBIC notifications", description: "New circulars relevant to you", group: "info", whatsapp: false, email: false, inApp: true },
  { category: "Product updates", description: "New FynHelp features", group: "info", whatsapp: false, email: false, inApp: false },
  { category: "Morning brief", description: "Daily 8AM financial summary", group: "brief", whatsapp: true, email: true, inApp: true },
];

const Toggle = ({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) => (
  <button onClick={disabled ? undefined : onChange}
    className="w-10 h-[22px] rounded-full relative transition-all duration-250"
    style={{ background: on ? "#C41E1E" : "#E0D9C8", opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>
    <div className="w-4 h-4 rounded-full bg-white shadow absolute top-[3px] transition-all duration-250"
      style={{ left: on ? 21 : 3 }} />
  </button>
);

const NotificationsPage = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState(defaultAlerts);
  const [channels, setChannels] = useState({ whatsapp: true, email: true });
  const [briefTime, setBriefTime] = useState("8:00 AM");

  const toggleAlert = (idx: number, channel: "whatsapp" | "email" | "inApp") => {
    setAlerts(prev => prev.map((a, i) => i === idx ? { ...a, [channel]: !a[channel] } : a));
  };

  const groupLabels: Record<string, { label: string; color: string }> = {
    critical: { label: "CRITICAL — Always on", color: "#C41E1E" },
    warning: { label: "WARNING — On by default", color: "#8B5A00" },
    info: { label: "INFORMATIONAL — Off by default", color: "#1A4A8B" },
    brief: { label: "NIDHI DAILY BRIEF", color: "#8B6914" },
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Notifications</h2>
      <p className="text-[14px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Choose how and when Nidhi contacts you.</p>

      {/* Channels */}
      <div className="mb-8">
        <h3 className="font-semibold text-[15px] mb-4" style={{ color: "#1A1008" }}>How Nidhi reaches you</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "WhatsApp", key: "whatsapp" as const, status: channels.whatsapp, sub: "+91-XXXXXXXXXX" },
            { label: "Email", key: "email" as const, status: channels.email, sub: "Connected" },
            { label: "In-App", key: null, status: true, sub: "Always on" },
          ].map(ch => (
            <div key={ch.label} className="bg-white border rounded-lg p-4" style={{ borderColor: "#E0D9C8" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-medium" style={{ color: "#1A1008" }}>{ch.label}</span>
                <Toggle on={ch.status} onChange={() => ch.key && setChannels(c => ({ ...c, [ch.key!]: !c[ch.key!] }))} disabled={!ch.key} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ch.status ? "#16A34A" : "#E0D9C8" }} />
                <span className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>{ch.sub}</span>
              </div>
              {ch.key && !ch.status && (
                <p className="text-[12px] mt-2 px-2 py-1 rounded" style={{ background: "#FEF3E2", color: "#8B5A00" }}>
                  You'll miss daily briefs and urgent alerts
                </p>
              )}
              {!ch.key && <p className="text-[11px] mt-1" style={{ color: "rgba(26,16,8,0.40)" }}>(Required for core functionality)</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Alert types */}
      <h3 className="font-semibold text-[15px] mb-4" style={{ color: "#1A1008" }}>What Nidhi alerts you about</h3>
      <div className="bg-white border rounded-lg overflow-hidden" style={{ borderColor: "#E0D9C8" }}>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 text-[12px] font-semibold px-4 py-2" style={{ background: "#FAF7F0", color: "rgba(26,16,8,0.50)" }}>
          <span>Alert</span>
          <span className="w-16 text-center">WhatsApp</span>
          <span className="w-16 text-center">Email</span>
          <span className="w-16 text-center">In-App</span>
        </div>
        {(["critical", "warning", "info", "brief"] as const).map(group => (
          <div key={group}>
            <div className="px-4 py-2 border-t" style={{ borderColor: "#E0D9C8" }}>
              <span className="text-[10px] font-semibold tracking-widest" style={{ color: groupLabels[group].color }}>{groupLabels[group].label}</span>
            </div>
            {alerts.filter(a => a.group === group).map((alert, idx) => {
              const realIdx = alerts.findIndex(a => a === alert);
              return (
                <div key={alert.category} className="grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-4 py-3 border-t" style={{ borderColor: "#E0D9C8" }}>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "#1A1008" }}>{alert.category}</p>
                    <p className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>{alert.description}</p>
                  </div>
                  <div className="w-16 flex justify-center">
                    {alert.locked ? <span className="text-[11px]" style={{ color: "#16A34A" }}>✓</span> :
                      <Toggle on={alert.whatsapp} onChange={() => toggleAlert(realIdx, "whatsapp")} />}
                  </div>
                  <div className="w-16 flex justify-center">
                    {alert.locked ? <span className="text-[11px]" style={{ color: "#16A34A" }}>✓</span> :
                      <Toggle on={alert.email} onChange={() => toggleAlert(realIdx, "email")} />}
                  </div>
                  <div className="w-16 flex justify-center">
                    <span className="text-[11px]" style={{ color: "#16A34A" }}>✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Brief time */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[13px]" style={{ color: "#1A1008" }}>Send brief at</span>
        <select value={briefTime} onChange={e => setBriefTime(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-[13px]" style={{ borderColor: "#E0D9C8", color: "#1A1008" }}>
          {["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"].map(t => <option key={t}>{t}</option>)}
        </select>
        <span className="text-[12px]" style={{ color: "rgba(26,16,8,0.40)" }}>IST</span>
      </div>

      <button onClick={() => toast({ title: "Notification preferences saved" })}
        className="mt-6 px-6 py-3 rounded-lg text-sm font-semibold text-white"
        style={{ background: "#C41E1E" }}>Save notification preferences</button>
    </div>
  );
};

export default NotificationsPage;
