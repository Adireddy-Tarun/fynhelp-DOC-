import { useState } from "react";
import { toast } from "sonner";

const RED = "#A93838"; const BORDER = "#E0D9C8";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in" style={{ borderColor: BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const inpCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A93838]/30";

const initialMembers = [
  { name: "Tarun Kumar", email: "tarun@fynhelp.com", role: "Admin", status: "Active", you: true },
  { name: "Nidhi Siddhapura", email: "nidhi@fynhelp.com", role: "Admin", status: "Active", you: false },
];

const permissions: [string, boolean, boolean, boolean, boolean][] = [
  ["View all data", true, true, true, true],
  ["Export reports", true, true, false, true],
  ["Edit data", true, true, false, false],
  ["Manage integrations", true, false, false, false],
  ["Invite team members", true, false, false, false],
  ["Billing access", true, false, false, false],
];

const TeamAccessPage = () => {
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Admin");

  const sendInvite = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inviteEmail)) return toast.error("Invalid email");
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail("");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Team & Access</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Invite teammates and manage role-based permissions.</p>

      <Card title="Current Team Members">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.email} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-3 font-medium">{m.name}</td><td>{m.email}</td><td>{m.role}</td>
                <td><span className="text-[11px] px-2 py-1 rounded font-medium" style={{ background: "rgba(22,163,74,0.15)", color: "#16A34A" }}>{m.status}</span></td>
                <td className="text-right">
                  {m.you ? <span className="text-[11px] px-2 py-1 rounded" style={{ background: "rgba(139,105,20,0.15)", color: "#8B6914" }}>You</span> : (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => toast("Edit member")} className="text-[12px] px-3 py-1 rounded border" style={{ borderColor: BORDER }}>Edit</button>
                      <button onClick={() => { setMembers((p) => p.filter((x) => x.email !== m.email)); toast.success("Member removed"); }}
                        className="text-[12px] px-3 py-1 rounded border font-medium" style={{ color: RED, borderColor: RED }}>Remove</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Invite Team Member">
        <div className="grid grid-cols-[1fr_180px_auto] gap-3 items-end">
          <div><label className="block text-[13px] font-medium mb-1.5">Email</label>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></div>
          <div><label className="block text-[13px] font-medium mb-1.5">Role</label>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className={inpCls} style={{ borderColor: BORDER }}>
              <option>Admin</option><option>Finance Manager</option><option>Viewer</option><option>CA (External)</option>
            </select></div>
          <button onClick={sendInvite} className="h-10 px-5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Send Invite</button>
        </div>
      </Card>

      <Card title="Roles & Permissions">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Permission</th><th className="text-center">Admin</th><th className="text-center">Finance Manager</th>
            <th className="text-center">Viewer</th><th className="text-center">CA</th></tr></thead>
          <tbody>
            {permissions.map(([perm, ...vals]) => (
              <tr key={perm as string} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-2.5">{perm}</td>
                {(vals as boolean[]).map((v, i) => (
                  <td key={i} className="text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold"
                      style={{ background: v ? "rgba(22,163,74,0.15)" : "rgba(220,38,38,0.12)", color: v ? "#16A34A" : "#DC2626" }}>
                      {v ? "✓" : "✗"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default TeamAccessPage;
