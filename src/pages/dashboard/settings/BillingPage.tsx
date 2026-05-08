import { useState } from "react";
import { Star, CreditCard, Shield, X } from "lucide-react";

/* ============================================================
   FynHelp — Billing (combined)
   Inter only · backend stubbed
   Replaces: Plan, Payments, Billing History
   ============================================================ */

const PAGE_WRAP: React.CSSProperties = {
  maxWidth: 900, margin: "0 auto", padding: "40px 48px", fontFamily: "'Inter', sans-serif",
};
const CARD: React.CSSProperties = {
  background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 10, padding: 28, marginBottom: 24,
};

const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <>
    <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 4 }}>{title}</h2>
    {sub && <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.55)", marginBottom: 24 }}>{sub}</p>}
  </>
);

const PLANS = [
  {
    name: "Starter", original: "₹1,999", discounted: "₹1,399",
    features: ["Cash intelligence", "GST alerts", "CFO Fynny daily brief", "1 bank connection"],
  },
  {
    name: "Growth", original: "₹4,999", discounted: "₹3,499",
    features: ["Everything in Starter", "Full ITC reconciliation", "HR module", "Cash flow simulator"],
  },
  {
    name: "Pro", original: "₹9,999", discounted: "₹6,999",
    features: ["Everything in Growth", "Governance intelligence", "All Indian languages", "CA workspace"],
  },
];

const BillingPage = () => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [tab, setTab] = useState<"card" | "upi" | "netbanking">("card");
  const [notifyToggles, setNotifyToggles] = useState<Record<string, boolean>>({});
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");

  // BACKEND: businesses.razorpay_customer_id + Razorpay tokens lookup
  const hasPaymentMethod = false;

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 42, padding: "0 12px",
    background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 6, outline: "none",
    fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "#1A1008",
  };

  return (
    <div style={PAGE_WRAP}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Billing</h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)", marginTop: 6, marginBottom: 24 }}>
        Manage your plan, payment methods, and invoices.
      </p>

      {/* SECTION 1: CURRENT PLAN */}
      <div style={CARD}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "rgba(26,16,8,0.50)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              Your current plan
            </p>
            {/* BACKEND: businesses.subscription_status, businesses.plan */}
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008", marginBottom: 12 }}>Early Access</h2>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 100, padding: "5px 14px",
              fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "#166534",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
              Active · No payment required
            </span>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "rgba(26,16,8,0.65)", marginTop: 12, lineHeight: 1.65 }}>
              Full access to all FynHelp modules during our Early Access period. No credit card required.
            </p>
            <ul style={{ marginTop: 12, padding: 0, listStyle: "none" }}>
              {[
                "All 50+ intelligence modules unlocked",
                "CFO Fynny AI CFO — full access",
                "Priority support",
                "30% permanent discount when paid plans launch",
                "Early access to new features before public release",
              ].map((b) => (
                <li key={b} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.65)", lineHeight: 2 }}>
                  <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#8B6914", marginRight: 8, verticalAlign: "middle" }} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ width: 220, textAlign: "center", flexShrink: 0 }}>
            {/* BACKEND: profiles.member_number */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%", border: "2px solid #8B6914",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              margin: "0 auto",
            }}>
              <Star size={32} color="#8B6914" fill="#8B6914" />
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 12, color: "#8B6914", marginTop: 4 }}>Founding Member</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(26,16,8,0.40)" }}>#0042</div>
            </div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)", marginTop: 14 }}>Member since</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#1A1008" }}>April 2026</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: UPCOMING PLANS */}
      <div style={CARD}>
        <SectionTitle title="What's coming" sub="Paid plans launch soon. As a founding member you pay 30% less — permanently." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{
              position: "relative", background: "#FFFFFF", border: "1px solid #E0D9C8", borderRadius: 8,
              padding: 20, opacity: 0.85, transition: "all 250ms",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "#C41E1E"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,16,8,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.borderColor = "#E0D9C8"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{
                position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                background: "#8B6914", color: "#FFFFFF", borderRadius: 100, padding: "3px 10px",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 10, letterSpacing: "0.10em",
              }}>COMING SOON</span>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "#1A1008" }}>{p.name}</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "rgba(26,16,8,0.40)", textDecoration: "line-through", marginTop: 8 }}>{p.original}/mo</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 22, color: "#166534", marginTop: 2 }}>{p.discounted}/mo</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "#166534", marginTop: 2 }}>30% founding member discount</p>
              <div style={{ height: 1, background: "#F0EBD8", margin: "14px 0" }} />
              <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.65)", marginBottom: 6 }}>
                    <span style={{ color: "#166534", marginRight: 6 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              {/* BACKEND: profiles.notification_prefs.plan_launch_notify */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer" }}>
                <button
                  onClick={() => setNotifyToggles({ ...notifyToggles, [p.name]: !notifyToggles[p.name] })}
                  style={{
                    width: 32, height: 18, borderRadius: 100,
                    background: notifyToggles[p.name] ? "#C41E1E" : "rgba(26,16,8,0.20)",
                    border: "none", cursor: "pointer", position: "relative", padding: 0, transition: "background 200ms",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: notifyToggles[p.name] ? 16 : 2,
                    width: 14, height: 14, borderRadius: "50%", background: "#FFFFFF", transition: "left 200ms",
                  }} />
                </button>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.60)" }}>Notify me when this launches</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: PAYMENT METHODS */}
      <div style={CARD}>
        <SectionTitle title="Payment Methods" sub="No payment required during Early Access. Add a card now to ensure seamless billing when paid plans begin." />

        {!hasPaymentMethod ? (
          <div style={{
            border: "1.5px dashed #D4C9A8", borderRadius: 8, padding: 32, textAlign: "center",
          }}>
            <CreditCard size={40} style={{ color: "rgba(26,16,8,0.15)", margin: "0 auto" }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 15, color: "rgba(26,16,8,0.50)", marginTop: 12 }}>No payment method added yet</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.40)", marginTop: 6 }}>You will not be charged until paid plans launch</p>
            <button onClick={() => setShowAddCard(true)} style={{
              marginTop: 20, height: 42, padding: "0 20px", borderRadius: 6,
              background: "transparent", border: "1px solid #D4C9A8", color: "#1A1008",
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
            }}>Add payment method</button>
          </div>
        ) : (
          <>
            {/* BACKEND: GET stored cards from Razorpay */}
            <div style={{
              display: "flex", alignItems: "center", height: 68,
              border: "1px solid #D4C9A8", borderRadius: 8, padding: "0 20px", gap: 16,
            }}>
              <div style={{
                width: 40, height: 26, border: "1px solid #E0D9C8", borderRadius: 4,
                background: "#F8F8F8", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10, color: "#1A1008",
              }}>VISA</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>Visa ending in 4242</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)" }}>Expires 12/28</div>
              </div>
              <span style={{
                background: "#F0FDF4", color: "#166534", border: "1px solid #A7F3D0",
                borderRadius: 100, padding: "3px 10px",
                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
              }}>Default</span>
              <button style={{
                background: "transparent", border: "none", padding: 0, cursor: "pointer",
                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "#C41E1E",
              }}>Remove</button>
            </div>
          </>
        )}
      </div>

      {/* SECTION 4: BILLING HISTORY */}
      <div style={CARD}>
        <SectionTitle title="Invoice History" />
        <div style={{
          background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8,
          padding: "16px 20px", marginBottom: 20,
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, color: "#92400E" }}>
            No invoices yet — Early Access is completely free
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "#92400E", marginTop: 4 }}>
            Your invoices will appear here when paid plans launch. We will email you before your first charge.
          </p>
        </div>

        {/* Preview table grayed out */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.50)",
              background: "#FFFFFF", padding: "8px 14px", borderRadius: 6, boxShadow: "0 2px 8px rgba(26,16,8,0.08)",
            }}>Your invoice history will appear here</p>
          </div>
          <table style={{
            width: "100%", borderCollapse: "collapse", opacity: 0.35,
            pointerEvents: "none", userSelect: "none",
            fontFamily: "'Inter', sans-serif", fontSize: 13,
          }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E0D9C8" }}>
                {["Date", "Plan", "Amount", "Status", "Invoice"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, fontSize: 12, color: "rgba(26,16,8,0.50)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: "May 1, 2026", plan: "Growth Plan", amount: "₹3,499", status: "Paid" },
                { date: "Jun 1, 2026", plan: "Growth Plan", amount: "₹3,499", status: "Paid" },
                { date: "Jul 1, 2026", plan: "Growth Plan", amount: "₹3,499", status: "Pending" },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F5F0E0" }}>
                  <td style={{ padding: "12px" }}>{r.date}</td>
                  <td style={{ padding: "12px" }}>{r.plan}</td>
                  <td style={{ padding: "12px" }}>{r.amount}</td>
                  <td style={{ padding: "12px" }}>{r.status}</td>
                  <td style={{ padding: "12px", color: "#C41E1E" }}>Download PDF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CARD MODAL */}
      {showAddCard && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(26,16,8,0.40)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowAddCard(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#FFFFFF", borderRadius: 12, padding: 32, maxWidth: 420, width: "100%",
            boxShadow: "0 24px 64px rgba(26,16,8,0.15)", maxHeight: "90vh", overflowY: "auto",
            fontFamily: "'Inter', sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: "#1A1008" }}>Add payment method</h3>
              <button onClick={() => setShowAddCard(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(26,16,8,0.30)" }}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #E0D9C8", marginBottom: 20 }}>
              {(["card", "upi", "netbanking"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} style={{
                  background: "transparent", border: "none", padding: "10px 16px", cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
                  color: tab === t ? "#C41E1E" : "rgba(26,16,8,0.50)",
                  borderBottom: tab === t ? "2px solid #C41E1E" : "2px solid transparent",
                }}>{t === "card" ? "Card" : t === "upi" ? "UPI" : "Net Banking"}</button>
              ))}
            </div>

            {tab === "card" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" style={inputStyle} />
                <div style={{ display: "flex", gap: 12 }}>
                  <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY" style={{ ...inputStyle, width: 120 }} />
                  <input value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="CVV" type="password" style={{ ...inputStyle, width: 100 }} />
                </div>
                <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="As printed on card" style={inputStyle} />
                <p style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(26,16,8,0.45)", marginTop: 4 }}>
                  <Shield size={14} />Card details encrypted by Razorpay. FynHelp never stores your card number.
                </p>
                {/* BACKEND: POST /api/payments/add-card · Razorpay createCustomer + addCard */}
                <button style={{
                  height: 42, borderRadius: 6, background: "#C41E1E", border: "none", color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 4,
                }}>Add Card</button>
              </div>
            )}

            {tab === "upi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" style={inputStyle} />
                {/* BACKEND: Razorpay UPI verify API */}
                <button style={{
                  height: 42, borderRadius: 6, background: "transparent", border: "1px solid #D4C9A8",
                  color: "#1A1008", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}>Verify UPI</button>
              </div>
            )}

            {tab === "netbanking" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <select style={inputStyle}>
                  <option>HDFC Bank</option><option>ICICI Bank</option><option>SBI</option>
                  <option>Axis Bank</option><option>Kotak Mahindra</option><option>Yes Bank</option>
                </select>
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)" }}>You will be redirected to your bank</p>
                {/* BACKEND: Razorpay payment link with netbanking method */}
                <button style={{
                  height: 42, borderRadius: 6, background: "#C41E1E", border: "none", color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}>Continue →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
