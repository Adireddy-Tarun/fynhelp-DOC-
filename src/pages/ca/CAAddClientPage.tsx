import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check } from "lucide-react";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn, SecondaryBtn } from "@/components/ca/ui";
import { toast } from "sonner";

export default function CAAddClientPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<{ name: string; gstin: string; industry: string } | null>(null);
  const [access, setAccess] = useState("read_only");
  const [done, setDone] = useState(false);

  const search = () => {
    // BACKEND: SELECT businesses JOIN auth.users WHERE email
    if (email.includes("@")) setFound({ name: "Demo Trading Pvt Ltd", gstin: "29ABCDE1234F1Z5", industry: "Trading" });
    else toast.error("Enter a valid email");
  };

  if (done) {
    return (
      <PageWrap>
        <Card className="max-w-xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={32} style={{ color: COLORS.green }} strokeWidth={3} />
          </div>
          <h2 className="text-[22px] font-bold mb-2">Access request sent</h2>
          <p className="text-[14px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>
            {found?.name} will receive an email to approve your access. They appear in your portfolio once approved.
          </p>
          <PrimaryBtn onClick={() => navigate("/ca/clients")}>Back to portfolio</PrimaryBtn>
        </Card>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <PageHeader title="Add a client" sub="Send a request to manage their FynHelp account." />

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: step >= s ? COLORS.red : "#E5E0CD", color: step >= s ? "#FFFFFF" : "rgba(26,16,8,0.50)" }}>{s}</div>
            <span className="text-xs font-medium">{s === 1 ? "Find" : s === 2 ? "Access" : "Send"}</span>
            {s < 3 && <div className="w-12 h-px" style={{ background: COLORS.caBorder }} />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        {step === 1 && (
          <>
            <h3 className="text-[15px] font-semibold mb-3">Find client by email</h3>
            <div className="flex gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com"
                className="flex-1 h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
              <PrimaryBtn onClick={search}><Search size={14} className="inline mr-1" />Search</PrimaryBtn>
            </div>

            {found && (
              <div className="mt-5 p-4 rounded" style={{ background: COLORS.caSurface, border: `1px solid ${COLORS.caBorder}` }}>
                <div className="text-sm font-semibold">{found.name}</div>
                <div className="text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.60)" }}>{found.gstin}</div>
                <div className="text-[12px] mb-3" style={{ color: "rgba(26,16,8,0.60)" }}>{found.industry}</div>
                <div className="flex gap-2">
                  <PrimaryBtn size="sm" onClick={() => setStep(2)}>Confirm</PrimaryBtn>
                  <SecondaryBtn size="sm" onClick={() => setFound(null)}>Search again</SecondaryBtn>
                </div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-[15px] font-semibold mb-4">Set access level</h3>
            <div className="space-y-2">
              {[
                { v: "read_only", t: "Read-only", d: "View all data, no changes" },
                { v: "full_read", t: "Full Read", d: "View all including sensitive" },
                { v: "report_download", t: "Report Download", d: "View + download all reports" },
                { v: "data_entry", t: "Data Entry", d: "Can mark filings, add notes" },
              ].map((o) => (
                <label key={o.v} className="flex items-start gap-3 p-3 rounded cursor-pointer"
                  style={{ border: `1px solid ${access === o.v ? COLORS.red : COLORS.caBorder}`, background: access === o.v ? "#FEF2F2" : "#FFFFFF" }}>
                  <input type="radio" name="access" value={o.v} checked={access === o.v} onChange={(e) => setAccess(e.target.value)} className="mt-1" />
                  <div>
                    <div className="text-sm font-semibold">{o.t}</div>
                    <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.60)" }}>{o.d}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <SecondaryBtn onClick={() => setStep(1)}>Back</SecondaryBtn>
              <PrimaryBtn onClick={() => setStep(3)}>Continue</PrimaryBtn>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-[15px] font-semibold mb-2">Send access request</h3>
            <p className="text-[13px] mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>
              {found?.name} must approve your access. They'll get an email with your firm's name and the access level you selected.
            </p>
            <div className="flex gap-2">
              <SecondaryBtn onClick={() => setStep(2)}>Back</SecondaryBtn>
              {/* BACKEND: POST /api/ca/request-access */}
              <PrimaryBtn onClick={() => { setDone(true); toast.success("Request sent"); }}>Send access request →</PrimaryBtn>
            </div>
          </>
        )}
      </Card>
    </PageWrap>
  );
}
