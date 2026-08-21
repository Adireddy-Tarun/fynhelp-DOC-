import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";

const categories = [
  "Cash Flow & Liquidity", "GST & Tax Questions", "Tally Integration Help",
  "CFO Fynny, Tips & Tricks", "Industry Discussions", "Success Stories", "Feature Requests",
];

const threads = [
  {
    title: "How I reduced my GST notice risk from 74 to 19",
    preview: "PSharma_Pune writes: We had 4 vendor mismatches going back 6 months. FynHelp flagged them all on the 14th and I chased all 4 vendors. Three filed within the week. One required a formal demand. Three months later, score is 19...",
    tag: "GST & Tax", replies: 28,
  },
  {
    title: "Best time of day to chase overdue payments, what's working?",
    preview: "Various members share: Tuesday 10AM calls work best in manufacturing, WhatsApp on Saturday mornings works for traders, formal emails followed by calls for corporate buyers...",
    tag: "Collections", replies: 41,
  },
  {
    title: "Tally ODBC sync not reflecting weekend entries, SOLVED",
    preview: "Issue: entries made Saturday/Sunday not appearing in FynHelp dashboard. Root cause: Tally agent scheduled for weekday sync only. Fix: change agent sync schedule to include weekends. Step-by-step in replies...",
    tag: "Technical Help", replies: 15,
  },
];

const CommunityPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [eventEmail1, setEventEmail1] = useState("");
  const [eventEmail2, setEventEmail2] = useState("");
  const [event1Submitted, setEvent1Submitted] = useState(false);
  const [event2Submitted, setEvent2Submitted] = useState(false);

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await (supabase.from("early_access_requests") as any)
      .insert({ email, module: "community", user_id: null });
    if (error) toast.error(error.message);
    else { setSubmitted(true); toast.success("You're on the community waitlist"); }
  };

  const registerEvent = async (eventEmail: string, module: "office_hours" | "gst_clinic", setDone: (v: boolean) => void) => {
    const { error } = await (supabase.from("early_access_requests") as any)
      .insert({ email: eventEmail, module, user_id: null });
    if (error) toast.error(error.message);
    else { setDone(true); toast.success("Registered — check your inbox"); }
  };


  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <h1 className="text-3xl md:text-[48px] leading-tight text-white mb-4">The FynHelp Community</h1>
          <p className="text-white/60 text-lg">Indian business owners helping each other grow, stay compliant, and make better financial decisions.</p>
        </div>
      </section>

      {/* Goals bar */}
      <section className="bg-fyn-red py-8">
        <div className="fyn-container text-center">
          <p className="text-white/70 text-sm mb-4">Our target community size, these are our goals for the first year.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { v: "5,000", l: "Members by Dec 2026" },
              { v: "Join as a", l: "Founding Member" },
              { v: "Weekly", l: "Expert Office Hours" },
              { v: "Free", l: "For All FynHelp Users" },
            ].map((m) => (
              <div key={m.l}>
                <p className="text-white text-2xl fyn-metric font-bold">{m.v}</p>
                <p className="text-white/70 text-sm">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          {/* Community Forum, Coming Soon */}
          <h2 className="text-3xl text-fyn-ink mb-4">Community Forum, Coming April 2026</h2>
          <p className="text-fyn-ink/60 text-base mb-6">Discussion categories being prepared:</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <span key={c} className="text-sm px-4 py-2 rounded-full bg-fyn-beige-dark border border-fyn-ink-10 text-secondary-foreground">{c}</span>
            ))}
          </div>

          <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-8 mb-16 max-w-xl">
            <h3 className="font-serif text-xl text-fyn-ink mb-2">Join the waitlist and be among the first 100 members.</h3>
            {submitted ? (
              <p className="text-fyn-success text-sm">You're on the list. We'll email you when the forum opens. ✓</p>
            ) : (
              <form onSubmit={handleWaitlist} className="flex gap-2 mt-4">
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-fyn-ink-10 bg-fyn-beige text-fyn-ink placeholder:text-fyn-ink/40 focus:outline-hidden focus:border-fyn-red text-sm"
                  aria-label="Email for community waitlist"
                />
                <button type="submit" className="px-6 py-2.5 bg-fyn-red text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                  Join waitlist
                </button>
              </form>
            )}
          </div>

          {/* Example threads */}
          <h2 className="text-3xl text-fyn-ink mb-2">Preview: What the Community Will Look Like</h2>
          <p className="fyn-caption text-[11px] italic mb-6 text-[#6b4400]">Example discussions, the kind of conversations happening when you join:</p>
          <div className="space-y-4 mb-16">
            {threads.map((t) => (
              <div key={t.title} className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-fyn-beige-dark fyn-label text-secondary-foreground">{t.tag}</span>
                  <span className="text-fyn-ink/30 text-xs">{t.replies} replies</span>
                </div>
                <h3 className="text-fyn-ink font-serif text-lg mb-2">{t.title}</h3>
                <p className="text-fyn-ink/60 text-sm leading-relaxed">{t.preview}</p>
              </div>
            ))}
          </div>
          <p className="text-sm mb-16 text-secondary-foreground">Join the community to participate → <a href="#waitlist" className="text-fyn-red hover:underline">Sign up above</a></p>

          {/* Expert Office Hours */}
          <h2 className="text-3xl text-fyn-ink mb-2">Expert Office Hours</h2>
          <p className="text-fyn-ink/60 text-base mb-6">Starting May 2026, register for early access:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="font-serif text-lg text-fyn-ink mb-2">FynHelp CFO Office Hours</h3>
              <p className="text-fyn-ink/60 text-sm mb-2">Every Tuesday, 4PM IST, Adireddy Tarun answers your financial intelligence questions live. Any FynHelp module, any business problem.</p>
              <p className="text-fyn-ink/80 text-sm font-medium mb-4">Next session: Tuesday, 5 August 2026, 4:00 PM IST</p>
              {event1Submitted ? (
                <p className="text-fyn-success text-sm">Registered! We'll send you the link. ✓</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); registerEvent(eventEmail1, "office_hours", setEvent1Submitted); }} className="flex gap-2">
                  <input type="email" required value={eventEmail1} onChange={(e) => setEventEmail1(e.target.value)}
                    placeholder="your@email.com" aria-label="Register for CFO Office Hours"
                    className="flex-1 px-3 py-2 rounded-lg border border-fyn-ink-10 bg-fyn-beige text-fyn-ink placeholder:text-fyn-ink/40 focus:outline-hidden focus:border-fyn-red text-sm" />
                  <button type="submit" className="px-4 py-2 bg-fyn-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Register →</button>
                </form>
              )}
            </div>
            <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-6">
              <h3 className="font-serif text-lg text-fyn-ink mb-2">GST & Compliance Clinic</h3>
              <p className="text-fyn-ink/60 text-sm mb-2">Every Thursday, 11AM IST, Our CA partner network answers your GST, TDS, and compliance questions.</p>
              <p className="text-fyn-ink/80 text-sm font-medium mb-4">Next session: Thursday, 7 August 2026, 11:00 AM IST</p>
              {event2Submitted ? (
                <p className="text-fyn-success text-sm">Registered! We'll send you the link. ✓</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); registerEvent(eventEmail2, "gst_clinic", setEvent2Submitted); }} className="flex gap-2">
                  <input type="email" required value={eventEmail2} onChange={(e) => setEventEmail2(e.target.value)}
                    placeholder="your@email.com" aria-label="Register for GST Clinic"
                    className="flex-1 px-3 py-2 rounded-lg border border-fyn-ink-10 bg-fyn-beige text-fyn-ink placeholder:text-fyn-ink/40 focus:outline-hidden focus:border-fyn-red text-sm" />
                  <button type="submit" className="px-4 py-2 bg-fyn-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Register →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CommunityPage;
