import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SecurityPage = () => {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const strength = (() => {
    if (!newPw) return 0;
    let s = 0;
    if (newPw.length >= 8) s++;
    if (/[A-Z]/.test(newPw) && /[a-z]/.test(newPw)) s++;
    if (/\d/.test(newPw)) s++;
    if (/[^A-Za-z0-9]/.test(newPw)) s++;
    return s;
  })();
  const strengthLabels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["", "#DC2626", "#F59E0B", "#16A34A", "#16A34A"];

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPw.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated successfully" }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-2xl font-bold" style={{ color: "#1A1008" }}>Security & Password</h2>

      {/* Change Password */}
      <div className="bg-white border rounded-lg p-6" style={{ borderColor: "#E0D9C8" }}>
        <h3 className="font-semibold text-[15px] mb-4" style={{ color: "#1A1008" }}>Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Current password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
              <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]"
                style={{ color: "rgba(26,16,8,0.40)" }}>{showCurrent ? "Hide" : "Show"}</button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>New password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]"
                style={{ color: "rgba(26,16,8,0.40)" }}>{showNew ? "Hide" : "Show"}</button>
            </div>
            {newPw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= strength ? strengthColors[strength] : "#E0D9C8" }} />
                  ))}
                </div>
                <p className="text-[11px] mt-1" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Confirm new password</label>
            <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
              style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
          </div>
          <button onClick={handleChangePassword} disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#C41E1E" }}>{saving ? "Updating..." : "Update password"}</button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white border rounded-lg p-6" style={{ borderColor: "#E0D9C8" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>Two-Factor Authentication</h3>
              <span className="text-[10px] font-semibold tracking-widest px-2 py-0.5 rounded-full" style={{ background: "rgba(139,105,20,0.20)", color: "#8B6914" }}>RECOMMENDED</span>
            </div>
            <p className="text-[13px] mt-1" style={{ color: "rgba(26,16,8,0.60)" }}>Add an extra layer of security. You'll need your phone to sign in.</p>
          </div>
          <div className="w-11 h-6 rounded-full cursor-pointer" style={{ background: "#E0D9C8" }}>
            <div className="w-5 h-5 rounded-full bg-white shadow mt-0.5 ml-0.5 transition-all" />
          </div>
        </div>
        {/* // BACKEND NEEDED: Supabase MFA API */}
      </div>

      {/* Active Sessions */}
      <div className="bg-white border rounded-lg p-6" style={{ borderColor: "#E0D9C8" }}>
        <h3 className="font-semibold text-[15px] mb-4" style={{ color: "#1A1008" }}>Devices signed in</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "#E0D9C8" }}>
            <div>
              <span className="text-[14px]" style={{ color: "#1A1008" }}>MacBook · Chrome · Bengaluru</span>
              <span className="text-[11px] ml-2" style={{ color: "rgba(26,16,8,0.40)" }}>Now</span>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#DCFCE7", color: "#16A34A" }}>Current</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-[14px]" style={{ color: "#1A1008" }}>iPhone · Safari · Bengaluru</span>
              <span className="text-[11px] ml-2" style={{ color: "rgba(26,16,8,0.40)" }}>2h ago</span>
            </div>
            <button className="text-[12px] font-medium" style={{ color: "#C41E1E" }}>Sign out</button>
          </div>
        </div>
        <button className="mt-4 text-[13px] font-medium" style={{ color: "#C41E1E" }}>Sign out all other devices</button>
      </div>

      {/* Danger Zone */}
      <div className="border rounded-lg p-6" style={{ background: "#FDEAEA", borderColor: "#C41E1E" }}>
        <h3 className="font-semibold text-[15px]" style={{ color: "#C41E1E" }}>Delete Account</h3>
        <p className="text-[13px] mt-1 mb-4" style={{ color: "#1A1008" }}>
          This permanently deletes your business data, all transactions, GST records, and AI CFO Nidhi history. This cannot be undone.
        </p>
        <button onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold border bg-white"
          style={{ borderColor: "#C41E1E", color: "#C41E1E" }}>Delete my account</button>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-xl">
            <h3 className="font-semibold text-[15px] mb-3" style={{ color: "#C41E1E" }}>Confirm account deletion</h3>
            <p className="text-[13px] mb-4" style={{ color: "#1A1008" }}>Type <strong>DELETE</strong> to confirm:</p>
            <input value={deleteText} onChange={e => setDeleteText(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none mb-4"
              style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
            <div className="flex gap-3">
              <button disabled={deleteText !== "DELETE"}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "#C41E1E" }}>Delete permanently</button>
              <button onClick={() => { setShowDeleteModal(false); setDeleteText(""); }}
                className="px-5 py-2 rounded-lg text-sm" style={{ color: "rgba(26,16,8,0.60)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityPage;
