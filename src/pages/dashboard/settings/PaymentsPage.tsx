import { useState } from "react";
import { Star, CreditCard, Plus, Shield } from "lucide-react";

const PaymentsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: "#1A1008" }}>Payment Methods</h2>

      {/* Early access notice */}
      <div className="flex items-start gap-3 rounded-lg p-5 mb-6" style={{ background: "rgba(139,105,20,0.08)", border: "1px solid rgba(139,105,20,0.30)" }}>
        <Star size={24} style={{ color: "#8B6914", flexShrink: 0 }} />
        <div>
          <p className="font-semibold text-[14px]" style={{ color: "#1A1008" }}>No payment required during Early Access</p>
          <p className="text-[14px] mt-1" style={{ color: "rgba(26,16,8,0.80)" }}>
            You will not be charged until paid plans launch. Adding a payment method now ensures seamless transition when billing begins.
          </p>
        </div>
      </div>

      {/* Empty state */}
      <h3 className="font-semibold text-[15px] mb-4" style={{ color: "#1A1008" }}>Payment methods</h3>
      <button onClick={() => setShowModal(true)}
        className="w-full border-2 border-dashed rounded-lg h-[120px] flex flex-col items-center justify-center gap-2 hover:border-[#C41E1E] transition-colors cursor-pointer"
        style={{ borderColor: "#E0D9C8" }}>
        <Plus size={24} style={{ color: "rgba(26,16,8,0.30)" }} />
        <span className="text-[14px]" style={{ color: "rgba(26,16,8,0.50)" }}>No payment method added yet</span>
        <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.40)" }}>Add one now to prepare for when billing begins →</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-[440px] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-[16px] mb-4" style={{ color: "#1A1008" }}>Add payment method</h3>

            {/* Tabs */}
            <div className="flex border-b mb-5" style={{ borderColor: "#E0D9C8" }}>
              {(["card", "upi", "netbanking"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-4 py-2.5 text-[13px] font-medium transition-all"
                  style={{
                    color: tab === t ? "#C41E1E" : "rgba(26,16,8,0.45)",
                    borderBottom: tab === t ? "3px solid #C41E1E" : "3px solid transparent",
                  }}>
                  {t === "card" ? "Card" : t === "upi" ? "UPI" : "Net Banking"}
                </button>
              ))}
            </div>

            {tab === "card" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Card number</label>
                  <div className="relative">
                    <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                      style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
                    <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,16,8,0.30)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Expiry</label>
                    <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM/YY"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                      style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>CVV</label>
                    <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" type="password"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                      style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Name on card</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name as on card"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                    style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
                </div>
                <p className="text-[11px]" style={{ color: "rgba(26,16,8,0.45)" }}>
                  We save only the last 4 digits. Full card stored by Razorpay, never FynHelp servers.
                </p>
                {/* // BACKEND NEEDED: Razorpay Customer API */}
                <button className="w-full py-3 rounded-lg text-sm font-semibold text-white" style={{ background: "#C41E1E" }}>Add card</button>
              </div>
            )}

            {tab === "upi" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>UPI ID</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                    style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
                </div>
                <button className="w-full py-3 rounded-lg text-sm font-semibold text-white" style={{ background: "#C41E1E" }}>Verify UPI</button>
              </div>
            )}

            {tab === "netbanking" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>Select your bank</label>
                  <select className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                    style={{ borderColor: "#E0D9C8", color: "#1A1008" }}>
                    <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option><option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option><option>Yes Bank</option><option>Punjab National Bank</option>
                    <option>Bank of Baroda</option><option>IndusInd Bank</option>
                  </select>
                </div>
                <p className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>You'll be redirected to your bank to authorise</p>
                <button className="w-full py-3 rounded-lg text-sm font-semibold text-white" style={{ background: "#C41E1E" }}>Continue →</button>
              </div>
            )}

            {/* Security badge */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t" style={{ borderColor: "#E0D9C8" }}>
              <Shield size={14} style={{ color: "rgba(26,16,8,0.30)" }} />
              <span className="text-[11px]" style={{ color: "rgba(26,16,8,0.40)" }}>256-bit SSL encrypted · Powered by Razorpay — RBI authorised</span>
            </div>

            <button onClick={() => setShowModal(false)} className="w-full mt-4 py-2 text-[13px]" style={{ color: "rgba(26,16,8,0.50)" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
