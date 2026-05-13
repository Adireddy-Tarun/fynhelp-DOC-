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
              First 100 users get FYNHelp free for 6 months.
            </p>
          </header>

          <div className="bg-white rounded-2xl border border-fyn-ink/10 shadow-sm p-6 md:p-8">
            <WaitlistForm />
          </div>
        </div>

        {/* Two-path choice section */}
        <section
          className="mx-auto px-6"
          style={{ maxWidth: 900, margin: "80px auto 0" }}
        >
          {/* OR divider */}
          <div className="relative" style={{ margin: "60px 0 40px" }}>
            <div
              style={{
                height: 1,
                background: "rgba(0,0,0,0.1)",
                width: "100%",
              }}
            />
            <span
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#F5F5F5",
                padding: "8px 24px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 20,
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                color: "rgba(0,0,0,0.6)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              OR
            </span>
          </div>

          <div className="text-center">
            <h2
              className="font-serif"
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                color: "#000",
                marginBottom: 12,
              }}
            >
              Want Priority Access?
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(15px, 1.6vw, 17px)",
                color: "rgba(0,0,0,0.6)",
                maxWidth: 600,
                margin: "0 auto 48px",
                lineHeight: 1.6,
              }}
            >
              Skip the waitlist. Book a 30-minute call with our founders and get early access if you're a good fit.
            </p>
          </div>

          <div
            className="grid gap-6 md:grid-cols-2"
            style={{ marginBottom: 80 }}
          >
            {/* LEFT - Waitlist */}
            <article
              className="reveal-up"
              style={{
                background: "rgba(196, 30, 30, 0.03)",
                border: "2px solid rgba(196, 30, 30, 0.15)",
                borderRadius: 16,
                padding: "40px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(196, 30, 30, 0.1)",
                  border: "1px solid #C41E1E",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 11,
                  color: "#C41E1E",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Selected
              </span>

              <Clock size={48} color="#C41E1E" style={{ marginBottom: 20 }} />

              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                Join Waitlist
              </h3>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  color: "rgba(0,0,0,0.6)",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                You're in! We'll email you when your spot opens. Expected launch: 60 days.
              </p>

              <ul
                style={{
                  width: "100%",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  textAlign: "left",
                }}
              >
                {[
                  "6 months free access",
                  "Email updates on progress",
                  "No commitment required",
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "rgba(0,0,0,0.7)",
                    }}
                  >
                    <Check size={18} color="#10B981" />
                    {f}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginTop: 24,
                  width: "100%",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <CheckCircle2 size={20} />
                You're in position #234
              </div>
            </article>

            {/* RIGHT - Calendly */}
            <article
              className="reveal-up"
              style={{
                background:
                  "linear-gradient(135deg, rgba(196,30,30,0.08), rgba(229,93,93,0.05))",
                border: "2px solid rgba(196, 30, 30, 0.3)",
                borderRadius: 16,
                padding: "40px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 8px 24px rgba(196, 30, 30, 0.12)",
              }}
            >
              <span
                className="animate-pulse"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "#C41E1E",
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 12px rgba(196, 30, 30, 0.3)",
                }}
              >
                Faster
              </span>

              <Zap size={48} color="#C41E1E" style={{ marginBottom: 20 }} />

              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#000",
                  marginBottom: 12,
                }}
              >
                Book a Demo Call
              </h3>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 15,
                  color: "rgba(0,0,0,0.6)",
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Talk to our founders. Get early access if you're a great fit for FynHelp.
              </p>

              <ul
                style={{
                  width: "100%",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  textAlign: "left",
                }}
              >
                {[
                  "Skip the queue entirely",
                  "Instant onboarding if qualified",
                  "Custom setup guidance",
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "rgba(0,0,0,0.7)",
                    }}
                  >
                    <Star size={18} color="#C41E1E" />
                    {f}
                  </li>
                ))}
              </ul>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  padding: 16,
                  borderRadius: 10,
                  marginTop: 16,
                  marginBottom: 24,
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {[
                  { Icon: Calendar, label: "Duration", value: "30 minutes" },
                  { Icon: Video, label: "Platform", value: "Google Meet" },
                  { Icon: Users, label: "With", value: "Founders" },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon size={16} color="rgba(0,0,0,0.5)" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 12,
                        color: "rgba(0,0,0,0.5)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#000",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={openCalendly}
                aria-label="Schedule demo call with FynHelp founders"
                className="calendly-cta"
                style={{
                  background: "#C41E1E",
                  border: "2px solid #C41E1E",
                  color: "white",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "16px 32px",
                  borderRadius: 12,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow:
                    "0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.4)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  cursor: "pointer",
                  minHeight: 56,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 0 rgba(160,25,25,1), 0 12px 32px rgba(196,30,30,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow =
                    "0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.4)";
                }}
              >
                Schedule Your Call Now
                <ArrowRight size={20} />
              </button>

              <div
                style={{
                  marginTop: 16,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  color: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Shield size={16} />
                No commitment • Free consultation
              </div>
            </article>
          </div>
        </section>
      </main>
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
        <Link
          to="/admin/login"
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            background: "hsl(var(--fyn-ink))",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          Admin Access →
        </Link>
      </div>
    </Layout>
  );
}
