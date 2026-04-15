import { Star, Check } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    original: "₹1,999",
    discounted: "₹1,399",
    features: ["5 intelligence modules", "Nidhi basic", "2 bank connections", "Email support"],
  },
  {
    name: "Growth",
    original: "₹4,999",
    discounted: "₹3,499",
    features: ["25 intelligence modules", "Nidhi full AI CFO", "10 bank connections", "Priority support", "WhatsApp alerts"],
  },
  {
    name: "Pro",
    original: "₹12,999",
    discounted: "₹9,099",
    features: ["All 50+ modules", "Nidhi full + API access", "Unlimited connections", "Dedicated CSM", "Custom reports", "Multi-entity"],
  },
];

const PlanPage = () => {
  const [notifyPlan, setNotifyPlan] = useState(true);

  return (
    <div>
      {/* Hero */}
      <div className="rounded-xl p-8 lg:p-12 mb-8 flex flex-col lg:flex-row gap-8" style={{ background: "#1A1008" }}>
        <div className="flex-1">
          <p className="text-[10px] font-semibold tracking-[0.10em] mb-2" style={{ color: "#8B6914" }}>YOUR CURRENT PLAN</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">Early Access</h2>
          <p className="text-[16px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.75)" }}>
            You're part of FynHelp's founding cohort. During the Early Access period, you have full access to all features at no cost. When we launch paid plans, Early Access members receive a permanent 30% discount.
          </p>
          <div className="space-y-2 mb-6">
            {[
              "All 50+ intelligence modules unlocked",
              "Nidhi AI CFO — full functionality",
              "Unlimited bank connections",
              "All 5 Indian languages",
              "Priority support",
              "30% founding member discount when paid plans launch",
            ].map(b => (
              <div key={b} className="flex items-center gap-2">
                <Check size={14} style={{ color: "#4ADE80" }} />
                <span className="text-[14px]" style={{ color: "rgba(255,255,255,0.80)" }}>{b}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ADE80" }} />
            <span className="text-[13px] font-medium" style={{ color: "#4ADE80" }}>Active · No payment required</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center lg:w-[200px]">
          <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center mb-3" style={{ borderColor: "#8B6914" }}>
            <Star size={40} style={{ color: "#8B6914" }} />
          </div>
          <p className="text-[14px] font-semibold text-white">Founding Member</p>
          <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>Member since April 2026</p>
        </div>
      </div>

      {/* Coming Soon Plans */}
      <div className="mb-8">
        <h3 className="font-serif text-3xl font-bold mb-2" style={{ color: "#1A1008" }}>Paid plans launching soon</h3>
        <p className="text-[14px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>When we launch, Early Access members pay 30% less — forever.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className="relative bg-white border rounded-xl p-6 opacity-70 hover:opacity-100 hover:-translate-y-1 transition-all duration-250" style={{ borderColor: "#E0D9C8" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-widest px-3 py-1 rounded-full"
                style={{ background: "rgba(139,105,20,0.20)", border: "1px solid rgba(139,105,20,0.40)", color: "#8B6914" }}>COMING SOON</span>
              <h4 className="font-semibold text-[16px] mt-3 mb-3" style={{ color: "#1A1008" }}>{plan.name}</h4>
              <div className="mb-4">
                <span className="text-[14px] line-through" style={{ color: "rgba(26,16,8,0.40)" }}>{plan.original}</span>
                <span className="text-[24px] font-bold ml-2" style={{ color: "#16A34A" }}>{plan.discounted}</span>
                <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.50)" }}>/mo for you</span>
              </div>
              <div className="space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check size={12} style={{ color: "#16A34A" }} />
                    <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.70)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[14px] italic mt-6" style={{ color: "rgba(26,16,8,0.60)" }}>
          We'll notify you before billing begins. You'll always have 30 days to choose your plan.
        </p>
      </div>

      {/* Stay informed */}
      <div className="bg-white border rounded-lg p-6 mb-6" style={{ borderColor: "#E0D9C8" }}>
        <h4 className="font-semibold text-[15px] mb-2" style={{ color: "#1A1008" }}>Get notified when paid plans launch</h4>
        <div className="flex items-center gap-3 mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={notifyPlan} onChange={e => setNotifyPlan(e.target.checked)} className="accent-[#C41E1E]" />
            <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>Notify me about plan launch</span>
          </label>
        </div>
      </div>

      {/* Leave */}
      <div className="text-center">
        <p className="text-[13px]" style={{ color: "rgba(26,16,8,0.40)" }}>Want to leave early access?</p>
        <button className="text-[13px] mt-1" style={{ color: "rgba(26,16,8,0.40)" }}>Account closure · Data export</button>
      </div>
    </div>
  );
};

export default PlanPage;
