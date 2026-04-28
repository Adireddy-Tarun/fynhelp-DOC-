import { useState, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";

const EarlyAccessPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: "", business_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Early Access — Join the Waitlist | FYNHelp";
  }, []);

  const update = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist_signups").insert({
        email: form.email.trim().toLowerCase(),
        full_name: form.full_name.trim() || null,
        business_name: form.business_name.trim() || null,
        source: "early-access",
      });
      if (error && !/duplicate|unique/i.test(error.message)) throw error;
      setSubmitted(true);
      toast({ title: "You're on the list!", description: "We'll email you the moment early access opens." });
    } catch (err: any) {
      toast({ title: "Couldn't join waitlist", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-fyn-beige min-h-[80vh] py-20">
        <div className="fyn-container max-w-3xl">
          <div className="text-center mb-10">
            <span className="inline-block text-xs uppercase tracking-widest text-fyn-red font-semibold mb-4">
              Early Access
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-fyn-ink mb-4">
              Join 1,000+ founders on the waitlist
            </h1>
            <p className="text-fyn-ink/70 text-lg">
              Be first in line when FYNHelp opens to Indian SMEs. Free for the first 1,000 users.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-fyn-ink/10 rounded-xl p-10 text-center">
              <CheckCircle2 className="mx-auto text-fyn-red mb-4" size={48} />
              <h2 className="font-serif text-2xl text-fyn-ink mb-2">You're on the list</h2>
              <p className="text-fyn-ink/70 mb-6">
                We'll email <strong>{form.email}</strong> as soon as early access is ready.
              </p>
              <Link to="/" className="text-fyn-red font-medium hover:underline">← Back to home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-fyn-ink/10 rounded-xl p-8 space-y-4">
              <div>
                <label className="block text-sm text-fyn-ink mb-1">Full name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="Rajesh Mehta"
                  className="w-full h-11 px-4 bg-fyn-beige border border-fyn-ink/15 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-fyn-ink"
                />
              </div>
              <div>
                <label className="block text-sm text-fyn-ink mb-1">Business name</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => update("business_name", e.target.value)}
                  placeholder="Mehta Textile Traders"
                  className="w-full h-11 px-4 bg-fyn-beige border border-fyn-ink/15 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-fyn-ink"
                />
              </div>
              <div>
                <label className="block text-sm text-fyn-ink mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@company.com"
                  className="w-full h-11 px-4 bg-fyn-beige border border-fyn-ink/15 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-fyn-ink"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-fyn-red text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {submitting ? "Joining…" : "Join Waitlist →"}
              </button>
              <p className="text-xs text-fyn-ink/50 text-center">
                No spam. We'll only email you about early access.
              </p>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EarlyAccessPage;
