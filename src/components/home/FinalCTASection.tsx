import { useState, FormEvent } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const WAITLIST_FN_URL =
  "https://wiknwxniwqvsxgyzqqxu.supabase.co/functions/v1/waitlist-signup";

export default function FinalCTASection() {
  const ref = useScrollReveal();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleWaitlistSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(WAITLIST_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.success) {
        setSuccess(true);
        setMessage("✅ Success! Check your email for confirmation.");
        setEmail("");
        setName("");
      } else {
        setSuccess(false);
        setMessage(`❌ ${data?.error || "Something went wrong"}`);
      }
    } catch {
      setSuccess(false);
      setMessage("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      ref={ref}
      className="bg-fyn-red py-16 md:py-24 px-5 text-center"
    >
      <div className="max-w-[640px] mx-auto reveal-up">
        <h2
          className="font-display font-black text-white leading-[1.1] text-[32px] md:text-5xl lg:text-[56px]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Join the Waitlist Now
        </h2>

        <p className="text-white/90 text-lg md:text-xl mt-4 leading-relaxed">
          Be among the first 100 businesses to get 6 months FREE access to CFO Fynny
        </p>

        <form
          onSubmit={handleWaitlistSignup}
          className="mt-8 space-y-3 text-left"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white text-fyn-ink placeholder-fyn-ink/50 focus:outline-none focus:ring-4 focus:ring-white/40 disabled:opacity-60"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg border border-white/30 bg-white text-fyn-ink placeholder-fyn-ink/50 focus:outline-none focus:ring-4 focus:ring-white/40 disabled:opacity-60"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-fyn-ink font-bold text-base md:text-lg px-10 py-4 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "56px" }}
          >
            {loading ? "Joining..." : <>Join Waitlist <span aria-hidden>→</span></>}
          </button>

          {message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm font-medium text-center pt-1 ${
                success ? "text-white" : "text-white"
              }`}
              style={{
                background: success ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)",
                padding: "10px 14px",
                borderRadius: 8,
              }}
            >
              {message}
            </p>
          )}
        </form>

        <p className="text-white font-medium text-base mt-5">
          (First 100 users get Pro Plan FREE for 6 months — Worth ₹45,000)
        </p>

        <p className="text-white/70 text-sm mt-2">
          No credit card required • Launch access May 2026
        </p>
      </div>
    </section>
  );
}
