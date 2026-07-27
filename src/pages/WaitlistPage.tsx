import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import WaitlistForm from "@/components/WaitlistForm";
import {
  Rocket,
  Clock,
  Zap,
  Check,
  CheckCircle2,
  Star,
  ArrowRight,
  Shield,
  Calendar,
  Video,
  Users,
  LogIn,
} from "lucide-react";

const CALENDLY_URL = "https://calendly.com/nidhi-fynhelp/30min";

export default function WaitlistPage() {
  const openCalendly = () =>
    window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");

  return (
    <Layout>
      <main
        className="min-h-screen py-16 px-6"
        style={{
          background:
            "linear-gradient(180deg, #F9F7F4 0%, #FFFFFF 60%, #F9F7F4 100%)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 600 }}>
          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-fyn-red/10 text-fyn-red mb-6">
              <Rocket className="w-8 h-8" />
            </div>
            <h1
              className="font-serif font-bold text-fyn-ink mb-3"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.15 }}
            >
              Be first in line when we launch
            </h1>
            <p className="text-fyn-ink/70 text-base md:text-lg">
              First 100 users get FYNHelp free for 30 days.
            </p>
          </header>

          <div className="bg-white rounded-2xl border border-fyn-ink/10 shadow-sm p-6 md:p-8">
            <WaitlistForm />
          </div>
        </div>

        {/* Two-path choice section */}
        <section className="max-w-5xl mx-auto px-6 mt-20">
          {/* OR divider */}
          <div className="relative my-10">
            <div className="h-px bg-black/10 w-full" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F5F5F5] px-6 py-2 border border-black/10 rounded-full font-sans font-semibold text-[13px] text-black/60 uppercase tracking-wider">
              OR
            </span>
          </div>

          <div className="text-center">
            <h2 className="font-serif font-bold text-2xl md:text-[32px] text-black mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Want Priority Access?
            </h2>
            <p className="font-sans text-base md:text-[17px] text-black/60 max-w-xl mx-auto mb-12 leading-relaxed">
              Skip the waitlist. Book a 30-minute call with our founders and get early access if you're a good fit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-20 items-stretch">
            {/* LEFT - Waitlist */}
            <article className="relative flex flex-col items-center text-center bg-[#C41E1E]/[0.03] border-2 border-[#C41E1E]/15 rounded-2xl p-8 md:p-10">
              <span className="absolute top-4 right-4 bg-[#C41E1E]/10 border border-[#C41E1E] px-3 py-1 rounded-xl font-sans font-semibold text-[11px] text-[#C41E1E] uppercase tracking-wider">
                Selected
              </span>

              <Clock size={48} className="text-[#C41E1E] mb-5" />

              <h3 className="font-serif font-bold text-[22px] text-black mb-3" style={{ fontFamily: "Georgia, serif" }}>
                Join Waitlist
              </h3>
              <p className="font-sans text-[15px] text-black/60 leading-relaxed mb-6">
                You're in! We'll email you when your spot opens. Expected launch: 60 days.
              </p>

              <ul className="w-full list-none p-0 m-0 text-left space-y-3 mb-6">
                {["30 days free access", "Email updates on progress", "No commitment required"].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-sans font-medium text-sm text-black/70">
                    <Check size={18} className="text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto w-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-lg font-sans font-semibold text-sm text-emerald-600 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                You're on the list — we'll be in touch.
              </div>
            </article>

            {/* RIGHT - Calendly */}
            <article
              className="relative flex flex-col items-center text-center border-2 border-[#C41E1E]/30 rounded-2xl p-8 md:p-10 shadow-[0_8px_24px_rgba(196,30,30,0.12)]"
              style={{ background: "linear-gradient(135deg, rgba(196,30,30,0.08), rgba(229,93,93,0.05))" }}
            >
              <span className="animate-pulse absolute top-4 right-4 bg-[#C41E1E] px-3 py-1 rounded-xl font-sans font-bold text-[11px] text-white uppercase tracking-wider shadow-[0_4px_12px_rgba(196,30,30,0.3)]">
                Faster
              </span>

              <Zap size={48} className="text-[#C41E1E] mb-5" />

              <h3 className="font-serif font-bold text-[22px] text-black mb-3" style={{ fontFamily: "Georgia, serif" }}>
                Book a Demo Call
              </h3>
              <p className="font-sans text-[15px] text-black/60 leading-relaxed mb-6">
                Talk to our founders. Get early access if you're a great fit for FynHelp.
              </p>

              <ul className="w-full list-none p-0 m-0 text-left space-y-3 mb-4">
                {["Skip the queue entirely", "Instant onboarding if qualified", "Custom setup guidance"].map((f) => (
                  <li key={f} className="flex items-center gap-2 font-sans font-medium text-sm text-black/70">
                    <Star size={18} className="text-[#C41E1E] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="w-full bg-white/60 border border-black/10 p-4 rounded-lg mb-6 grid grid-cols-3 gap-3">
                {[
                  { Icon: Calendar, label: "Duration", value: "30 min" },
                  { Icon: Video, label: "Platform", value: "Google Meet" },
                  { Icon: Users, label: "With", value: "Founders" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <Icon size={16} className="text-black/50" />
                    <span className="font-sans font-medium text-[11px] text-black/50">{label}</span>
                    <span className="font-sans font-semibold text-[13px] text-black text-center">{value}</span>
                  </div>
                ))}
              </div>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Schedule demo call with FynHelp founders"
                className="mt-auto w-full inline-flex items-center justify-center gap-2.5 bg-[#C41E1E] border-2 border-[#C41E1E] text-white font-sans font-bold text-base px-8 py-4 rounded-xl no-underline transition-all duration-300 hover:-translate-y-0.5 min-h-[56px]"
                style={{ boxShadow: "0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.4)" }}
              >
                Schedule Your Call Now
                <ArrowRight size={20} />
              </a>

              <div className="mt-4 font-sans text-[13px] text-black/50 flex items-center justify-center gap-1.5">
                <Shield size={16} />
                No commitment • Free consultation
              </div>
            </article>
          </div>
        </section>
      </main>
    </Layout>
  );
}
