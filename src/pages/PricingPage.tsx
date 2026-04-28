import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const features = [
  "Full access to all 5 Intelligence Suites",
  "AI CFO Nidhi (unlimited questions)",
  "Unlimited users",
  "Bank & Zoho integrations",
  "Email & Slack alerts",
  "CSV data import",
  "Priority support",
];

const faqs = [
  { q: "What happens after the free trial?", a: "Your card will be charged automatically. Cancel anytime before trial ends." },
  { q: "Can I switch plans later?", a: "Yes, upgrade or downgrade anytime from Settings." },
  { q: "What payment methods do you accept?", a: "Credit card, debit card, UPI, net banking via Razorpay." },
];

async function createRazorpayCheckout(plan: "monthly" | "annual") {
  // Placeholder: integrate Razorpay edge function here
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  // TODO: call edge function to create order, then open Razorpay modal
  console.log("Razorpay checkout for plan:", plan, "user:", user.id);
  return { ok: true };
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStartTrial = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    try {
      localStorage.setItem("selected_plan", plan);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`/early-access?plan=${plan}`);
        return;
      }
      await createRazorpayCheckout(plan);
      navigate("/dashboard/cockpit");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-fyn-beige py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-fyn-ink mb-4">Choose Your Plan</h1>
          <p className="text-lg text-fyn-ink/70">Start your 14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-fyn-beige-dark py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Monthly */}
          <div className="relative bg-white rounded-2xl border border-fyn-ink/10 shadow-sm p-8 flex flex-col">
            <span className="absolute -top-3 left-8 bg-fyn-ink text-white text-xs font-medium px-3 py-1 rounded-full">
              Most Flexible
            </span>
            <h3 className="font-serif font-bold text-2xl text-fyn-ink mb-2">Monthly</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-fyn-ink">₹4,999</span>
              <span className="text-fyn-ink/60 ml-1">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-fyn-ink/80">
                  <Check className="w-5 h-5 text-fyn-success shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleStartTrial("monthly")}
              disabled={loading === "monthly"}
              className="w-full bg-fyn-red text-white font-semibold py-3 rounded-lg hover:bg-fyn-red/90 transition-colors disabled:opacity-60"
            >
              {loading === "monthly" ? "Loading..." : "Start Free Trial"}
            </button>
          </div>

          {/* Annual */}
          <div className="relative bg-white rounded-2xl border-2 border-fyn-success shadow-lg shadow-fyn-success/10 p-8 flex flex-col">
            <span className="absolute -top-3 left-8 bg-fyn-success text-white text-xs font-medium px-3 py-1 rounded-full">
              Best Value — Save 17%
            </span>
            <h3 className="font-serif font-bold text-2xl text-fyn-ink mb-2">Annual</h3>
            <div className="mb-1">
              <span className="text-5xl font-bold text-fyn-ink">₹49,990</span>
              <span className="text-fyn-ink/60 ml-1">/year</span>
            </div>
            <p className="text-sm text-fyn-success font-medium mb-1">Save ₹9,898 vs monthly</p>
            <p className="text-sm text-fyn-ink/60 mb-6">(₹4,165/month)</p>
            <ul className="space-y-3 mb-8 flex-1">
              {features.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-fyn-ink/80">
                  <Check className="w-5 h-5 text-fyn-success shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleStartTrial("annual")}
              disabled={loading === "annual"}
              className="w-full bg-fyn-red text-white font-semibold py-3 rounded-lg hover:bg-fyn-red/90 transition-colors shadow-md disabled:opacity-60"
            >
              {loading === "annual" ? "Loading..." : "Start Free Trial"}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-fyn-beige py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif font-bold text-3xl text-fyn-ink mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-lg border border-fyn-ink/10 p-6">
                <h3 className="font-semibold text-fyn-ink mb-2">{f.q}</h3>
                <p className="text-fyn-ink/70 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
