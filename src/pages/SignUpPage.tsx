import { Link } from "react-router-dom";
import FynLogo from "@/components/FynLogo";

const SignUpPage = () => (
  <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    {/* Left */}
    <div className="bg-fyn-ink p-12 flex flex-col justify-center">
      <FynLogo variant="light" />
      <h2 className="text-white font-serif text-3xl mt-8 mb-4">Your 15-day free trial starts now.</h2>
      <p className="text-white/60 mb-8">No credit card. Setup in 10 minutes. Cancel anytime.</p>
      <ul className="space-y-3 text-white/70 text-sm">
        <li>✓ Nidhi starts monitoring your cash from day one</li>
        <li>✓ Connect your bank via RBI Account Aggregator — no credentials shared</li>
        <li>✓ Trusted by 10,000+ Indian businesses</li>
      </ul>
    </div>

    {/* Right */}
    <div className="bg-fyn-beige p-12 flex flex-col justify-center">
      <h2 className="text-fyn-ink font-serif text-2xl mb-6">Create your account</h2>
      <form className="space-y-4 max-w-md">
        {[
          { label: "Full name", type: "text", placeholder: "Rajesh Mehta" },
          { label: "Business name", type: "text", placeholder: "Mehta Textile Traders" },
          { label: "Mobile number", type: "tel", placeholder: "+91 98XXX XXXXX" },
          { label: "Email address", type: "email", placeholder: "rajesh@example.com" },
          { label: "Password", type: "password", placeholder: "Create a strong password" },
          { label: "GSTIN (optional)", type: "text", placeholder: "Enter for instant GST setup" },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-fyn-ink/70 text-sm mb-1 block">{f.label}</label>
            <input
              type={f.type}
              placeholder={f.placeholder}
              className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-fyn-ink text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red"
            />
          </div>
        ))}

        <div>
          <label className="text-fyn-ink/70 text-sm mb-2 block">Plan</label>
          <div className="flex gap-3">
            {["Starter ₹1,999/mo", "Growth ₹4,999/mo", "Pro ₹12,999/mo"].map((p, i) => (
              <label key={p} className="flex items-center gap-2 text-fyn-ink text-sm cursor-pointer">
                <input type="radio" name="plan" defaultChecked={i === 1} className="accent-[#C41E1E]" />
                {p}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-2 text-fyn-ink/60 text-xs">
          <input type="checkbox" className="mt-0.5 accent-[#C41E1E]" />
          I agree to FynHelp's Terms of Service and Privacy Policy. I understand my financial data is encrypted and stored in India.
        </label>

        <button type="submit" className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity">
          Start My 15-Day Free Trial
        </button>

        <p className="text-fyn-ink/50 text-sm text-center">
          Already have an account? <Link to="/signin" className="text-fyn-red hover:underline">Sign in →</Link>
        </p>
      </form>
    </div>
  </div>
);

export default SignUpPage;
