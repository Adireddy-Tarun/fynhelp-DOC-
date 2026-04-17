import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn, SecondaryBtn, Chip } from "@/components/ca/ui";
import { toast } from "sonner";

const TABS = [
  { v: "/ca/settings", t: "Firm Profile" },
  { v: "/ca/settings/team", t: "Team Members" },
  { v: "/ca/settings/notifications", t: "Notifications" },
  { v: "/ca/settings/defaults", t: "Client Defaults" },
  { v: "/ca/settings/billing", t: "Billing" },
];

export default function CASettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { caFirm } = useCAAuth();
  const tab = location.pathname;

  return (
    <PageWrap>
      <PageHeader title="Firm Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <Card className="!p-3">
            {TABS.map((t) => (
              <button key={t.v} onClick={() => navigate(t.v)}
                className="w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors mb-1"
                style={tab === t.v ? { background: "#FEF2F2", color: COLORS.red } : { color: COLORS.ink }}>
                {t.t}
              </button>
            ))}
          </Card>
        </aside>

        <div className="lg:col-span-9">
          {tab === "/ca/settings" && (
            <Card>
              <h3 className="text-[15px] font-semibold mb-4">Firm Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Firm Name" defaultValue={caFirm?.firm_name} />
                <Field label="ICAI Membership" defaultValue={caFirm?.membership_number || ""} readOnly />
                <Field label="Email" defaultValue={caFirm?.email || ""} />
                <Field label="Phone / WhatsApp" defaultValue="" />
                <Field label="City" defaultValue={caFirm?.city || ""} />
                <Field label="State" defaultValue={caFirm?.state || ""} />
              </div>
              <div className="mt-5"><PrimaryBtn onClick={() => toast.success("Saved")}>Save changes</PrimaryBtn></div>
            </Card>
          )}

          {tab === "/ca/settings/team" && (
            <Card>
              <h3 className="text-[15px] font-semibold mb-1">Team Members</h3>
              <p className="text-[13px] mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>Add team members to your CA firm.</p>
              <div className="flex gap-2 mb-4">
                <input placeholder="email@firm.com" className="flex-1 h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
                <select className="h-10 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  <option>Partner</option><option>Manager</option><option>Senior</option><option>Junior</option><option>Staff</option>
                </select>
                <PrimaryBtn onClick={() => toast.success("Invite sent")}>Send invite</PrimaryBtn>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                  <th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Role</th><th className="py-2">Status</th>
                </tr></thead>
                <tbody>
                  {[["You", caFirm?.email || "—", "Partner", "Active"]].map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                      {r.slice(0, 3).map((c, j) => <td key={j} className="py-3 text-sm">{c}</td>)}
                      <td className="py-3"><Chip tone="green">{r[3]}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {tab === "/ca/settings/notifications" && (
            <Card>
              <h3 className="text-[15px] font-semibold mb-4">Notification Preferences</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                  <th className="py-2">Alert Type</th><th className="py-2">WhatsApp</th><th className="py-2">Email</th><th className="py-2">In-App</th>
                </tr></thead>
                <tbody>
                  {["Client cash critical", "ITC mismatch found", "Filing due 7 days", "Filing due tomorrow", "Bulk action complete"].map((a, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                      <td className="py-3 font-medium">{a}</td>
                      <td className="py-3"><input type="checkbox" defaultChecked /></td>
                      <td className="py-3"><input type="checkbox" defaultChecked /></td>
                      <td className="py-3 text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>always</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5"><PrimaryBtn onClick={() => toast.success("Saved")}>Save preferences</PrimaryBtn></div>
            </Card>
          )}

          {tab === "/ca/settings/defaults" && (
            <Card>
              <h3 className="text-[15px] font-semibold mb-4">Client Defaults</h3>
              <div className="space-y-4">
                <Field label="Default access level for new clients" type="select" options={["Read-only", "Full read", "Report download"]} />
                <Field label="Default report frequency" type="select" options={["Monthly", "Weekly", "On demand"]} />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> CA files GST</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> CA files TDS</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> CA files ROC</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Auto-generate monthly CFO reports on 5th</label>
              </div>
              <div className="mt-5"><PrimaryBtn onClick={() => toast.success("Saved")}>Save defaults</PrimaryBtn></div>
            </Card>
          )}

          {tab === "/ca/settings/billing" && (
            <Card>
              <h3 className="text-[15px] font-semibold mb-4">Billing</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Plan</div><div className="text-[20px] font-bold">CA Partner</div></div>
                <div><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Annual</div><div className="text-[20px] font-bold">₹2,50,000</div></div>
                <div><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Max Clients</div><div className="text-[20px] font-bold">200</div></div>
                <div><div className="text-[11px] uppercase mb-1" style={{ color: "rgba(26,16,8,0.50)" }}>Next Billing</div><div className="text-[20px] font-bold">Mar 1, 2027</div></div>
              </div>
              <SecondaryBtn>Update payment method</SecondaryBtn>
              <h4 className="text-[13px] font-semibold mt-8 mb-3 uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>Invoice history</h4>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                  <th className="py-2">Date</th><th className="py-2">Amount</th><th className="py-2">Status</th><th className="py-2"></th>
                </tr></thead>
                <tbody>
                  {[["Mar 1, 2026", "₹2,50,000", "Paid"], ["Mar 1, 2025", "₹2,00,000", "Paid"]].map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                      <td className="py-3 text-sm">{r[0]}</td><td className="py-3 text-sm font-semibold">{r[1]}</td>
                      <td className="py-3"><Chip tone="green">{r[2]}</Chip></td>
                      <td className="py-3 text-right"><button className="text-xs font-medium" style={{ color: COLORS.red }}>Download PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </PageWrap>
  );
}

function Field({ label, defaultValue = "", readOnly = false, type = "text", options = [] }: { label: string; defaultValue?: string; readOnly?: boolean; type?: string; options?: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5">{label}</label>
      {type === "select" ? (
        <select className="w-full h-10 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type="text" defaultValue={defaultValue} readOnly={readOnly}
          className="w-full h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}`, background: readOnly ? COLORS.caSurface : "#FFFFFF" }} />
      )}
    </div>
  );
}
