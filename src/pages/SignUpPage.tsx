import { useState, useEffect, FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import FynLogo from "@/components/FynLogo";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { evaluatePasswordPolicy } from "@/lib/passwordPolicy";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PLAN_DETAILS: Record<string, { name: string; price: string; period: string }> = {
  monthly: { name: "Monthly Plan", price: "₹4,999", period: "/month" },
  annual: { name: "Annual Plan", price: "₹49,990", period: "/year" },
};

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const planParam = searchParams.get("plan");
  const selectedPlan = planParam && PLAN_DETAILS[planParam] ? planParam : null;
  const planInfo = selectedPlan ? PLAN_DETAILS[selectedPlan] : null;

  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    mobile: "",
    email: "",
    password: "",
    gstin: "",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);

  const passwordPolicy = evaluatePasswordPolicy(form.password);

  useEffect(() => {
    if (selectedPlan) localStorage.setItem("selected_plan", selectedPlan);
  }, [selectedPlan]);

  const update = (k: string, v: string | boolean) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.agree) {
      toast({ title: "Please accept the terms to continue", variant: "destructive" });
      return;
    }
    setPwTouched(true);
    if (passwordPolicy.isCommonWeak) {
      toast({
        title: "Choose a stronger password",
        description: "This password is too common — please pick something less guessable.",
        variant: "destructive",
      });
      return;
    }
    if (!passwordPolicy.allRulesPassed) {
      const failed = passwordPolicy.rules.find((r) => !r.passed);
      toast({
        title: "Password doesn't meet all requirements",
        description: failed ? `Missing: ${failed.label.toLowerCase()}.` : undefined,
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: form.full_name,
            business_name: form.business_name,
            mobile: form.mobile,
            gstin: form.gstin,
            selected_plan: selectedPlan ?? null,
          },
        },
      });
      if (error) throw error;

      toast({ title: "Account created", description: "Check your inbox to verify your email." });

      if (selectedPlan) {
        navigate(`/payment/checkout?plan=${selectedPlan}`);
      } else {
        navigate("/dashboard/cockpit");
      }
    } catch (err: any) {
      toast({ title: "Signup failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="bg-fyn-ink p-12 flex flex-col justify-center">
        <FynLogo variant="light" />
        <h2 className="text-white font-serif text-3xl mt-8 mb-4">Your 14-day free trial starts now.</h2>
        <p className="text-white/60 mb-8">No credit card. Setup in 10 minutes. Cancel anytime.</p>
        <ul className="space-y-3 text-white/70 text-sm">
          <li>✓ AI CFO Nidhi starts monitoring your cash from day one</li>
          <li>✓ Connect your bank via RBI Account Aggregator — no credentials shared</li>
          <li>✓ Trusted by 10,000+ Indian businesses</li>
        </ul>
      </div>

      {/* Right */}
      <div className="bg-fyn-beige p-12 flex flex-col justify-center">
        <h2 className="text-fyn-ink font-serif text-2xl mb-6">Create your account</h2>

        {planInfo && (
          <div className="max-w-md mb-6 bg-white border-2 border-fyn-red/20 rounded-lg p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-fyn-ink/60 mb-1">You're signing up for</p>
              <p className="font-semibold text-fyn-ink">
                {planInfo.name} —{" "}
                <span className="text-fyn-red">
                  {planInfo.price}
                  <span className="text-sm font-normal text-fyn-ink/60">{planInfo.period}</span>
                </span>
              </p>
            </div>
            <Link to="/pricing" className="text-sm text-fyn-red hover:underline whitespace-nowrap">
              Change Plan
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {[
            { key: "full_name", label: "Full name", type: "text", placeholder: "Rajesh Mehta", required: true },
            { key: "business_name", label: "Business name", type: "text", placeholder: "Mehta Textile Traders", required: true },
            { key: "mobile", label: "Mobile number", type: "tel", placeholder: "+91 98XXX XXXXX", required: true },
            { key: "email", label: "Email address", type: "email", placeholder: "rajesh@example.com", required: true },
            { key: "password", label: "Password", type: "password", placeholder: "Create a strong password", required: true },
            { key: "gstin", label: "GSTIN (optional)", type: "text", placeholder: "Enter for instant GST setup", required: false },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-secondary-foreground text-base">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={(form as any)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
              />
            </div>
          ))}

          <label className="flex items-start gap-2 text-xs text-secondary-foreground">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(e) => update("agree", e.target.checked)}
              className="mt-0.5 accent-[#C41E1E]"
            />
            I agree to FynHelp's Terms of Service and Privacy Policy. I understand my financial data is encrypted and stored in India.
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Creating account..." : selectedPlan ? `Continue to Payment` : "Start My 14-Day Free Trial"}
          </button>

          <p className="text-sm text-center text-secondary-foreground">
            Already have an account? <Link to="/signin" className="text-fyn-red hover:underline">Sign in →</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
