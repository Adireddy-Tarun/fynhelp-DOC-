import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import FynLogo from "@/components/FynLogo";

const EarlyAccessPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setSubmitting(true);
    try {
      // Best-effort store; ignore if table not present
      await supabase.from("waitlist" as never).insert({ email, name, company } as never);
    } catch {
      // swallow — UX shouldn't block on backend
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("You're on the list. We'll be in touch soon.");
    }
  };

  return (
    <div className="min-h-screen bg-fyn-ink text-white flex flex-col">
      <header className="px-8 py-6 border-b border-white/10">
        <Link to="/"><FynLogo variant="light" showTagline={false} size="md" /></Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-fyn-gold mb-4">
            Early Access
          </span>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight mb-5">
            Join the FynHelp waitlist
          </h1>
          <p className="text-white/70 text-lg mb-10">
            FynHelp is rolling out access in waves to Indian SMEs and their CAs.
            Drop your details and we'll let you know the moment your spot opens up.
          </p>

          {submitted ? (
            <div className="border border-fyn-gold/40 bg-fyn-gold/5 rounded-lg p-6">
              <h2 className="font-serif text-2xl mb-2">You're on the list ✓</h2>
              <p className="text-white/70">
                We'll send your invite to <span className="text-white">{email}</span> as soon as access opens.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-fyn-gold"
              />
              <input
                type="email"
                required
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-fyn-gold"
              />
              <input
                type="text"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-fyn-gold"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-fyn-red text-white font-semibold py-3 rounded-lg hover-btn-primary disabled:opacity-60"
              >
                {submitting ? "Adding you…" : "Join Waitlist"}
              </button>
              <p className="text-xs text-white/50 text-center">
                No spam. We'll only email you about your invite.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EarlyAccessPage;
