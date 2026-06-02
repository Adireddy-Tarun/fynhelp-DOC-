import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check } from "lucide-react";
import { COLORS, PageWrap, PageHeader, Card, PrimaryBtn, SecondaryBtn } from "@/components/ca/ui";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAAuth } from "@/contexts/CAAuthContext";

const GSTIN_RX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function CAAddClientPage() {
  const navigate = useNavigate();
  const { caFirm } = useCAAuth();
  const [step, setStep] = useState(1);
  const [gstin, setGstin] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [access, setAccess] = useState("read_only");
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validateAndContinue = () => {
    const clean = gstin.trim().toUpperCase();
    if (!GSTIN_RX.test(clean)) {
      toast.error("Enter a valid 15-character GSTIN");
      return;
    }
    setGstin(clean);
    setValidated(true);
    setStep(2);
  };

  const sendRequest = async () => {
    if (!caFirm?.id) { toast.error("CA firm not loaded"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("ca_access_requests").insert({
      ca_firm_id: caFirm.id,
      target_gstin: gstin,
      target_email: email.trim() || null,
      access_level: access,
      message: message.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    // BACKEND: trigger Resend email to business owner here (edge function)
    setDone(true);
    toast.success("Request sent");
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
            The business owner of GSTIN <span className="font-mono">{gstin}</span> will see your request in their settings and can approve or reject it.
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
            <span className="text-xs font-medium">{s === 1 ? "Identify" : s === 2 ? "Access" : "Send"}</span>
            {s < 3 && <div className="w-12 h-px" style={{ background: COLORS.caBorder }} />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        {step === 1 && (
          <>
            <h3 className="text-[15px] font-semibold mb-1">Identify the client by GSTIN</h3>
            <p className="text-[13px] mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>
              The business owner registered on FynHelp under this GSTIN will receive your request.
            </p>
            <label className="block text-[12px] font-medium mb-1.5">GSTIN</label>
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="29ABCDE1234F1Z5"
              className="w-full h-10 px-3 rounded text-sm font-mono mb-3"
              style={{ border: `1px solid ${COLORS.caBorder}` }}
            />
            <label className="block text-[12px] font-medium mb-1.5">Owner email (optional)</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@business.com"
              className="w-full h-10 px-3 rounded text-sm mb-4"
              style={{ border: `1px solid ${COLORS.caBorder}` }}
            />
            <PrimaryBtn onClick={validateAndContinue}><Search size={14} className="inline mr-1" />Continue</PrimaryBtn>
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
              The business owner for <span className="font-mono">{gstin}</span> must approve your request. Add an optional note explaining who you are.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm your CA at Mehta & Associates, requesting view access to manage your GST filings."
              rows={3}
              className="w-full p-3 rounded text-sm mb-4"
              style={{ border: `1px solid ${COLORS.caBorder}` }}
            />
            <div className="flex gap-2">
              <SecondaryBtn onClick={() => setStep(2)} disabled={submitting}>Back</SecondaryBtn>
              <PrimaryBtn onClick={sendRequest} disabled={submitting}>
                {submitting ? "Sending…" : "Send access request →"}
              </PrimaryBtn>
            </div>
          </>
        )}
      </Card>
    </PageWrap>
  );
}
