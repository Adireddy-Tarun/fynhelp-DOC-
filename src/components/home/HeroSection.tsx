import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const ease = [0.25, 0.1, 0.25, 1];

export default function HeroSection() {
  const [email, setEmail] = useState("");

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100vh", width: "100%" }}
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleY(-1)", zIndex: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(244,237,218,0) 26%, rgba(244,237,218,1) 67%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col"
        style={{
          zIndex: 2,
          maxWidth: 1200,
          margin: "0 auto",
          paddingTop: 200,
          paddingLeft: 48,
          paddingRight: 48,
          paddingBottom: 80,
          gap: 32,
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              border: "1px solid rgba(139,105,20,0.4)",
              padding: "6px 16px",
              background: "rgba(139,105,20,0.08)",
            }}
          >
            <span
              className="rounded-full pulse-ring"
              style={{ width: 6, height: 6, background: "#22C55E" }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                letterSpacing: "0.10em",
                color: "#8B6914",
                textTransform: "uppercase",
              }}
            >
              INDIA'S VIRTUAL CFO PLATFORM
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: "clamp(48px, 6vw, 80px)",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          <motion.span
            style={{ display: "block", color: "#1A1008" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.12 }}
          >
            Every Indian SME
          </motion.span>
          <motion.span
            style={{ display: "block", color: "#C41E1E" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.24 }}
          >
            deserves a CFO.
          </motion.span>
          <motion.span
            style={{ display: "block", color: "#1A1008" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.36 }}
          >
            Now they have one.
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.4 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 18,
            color: "rgba(26,16,8,0.75)",
            maxWidth: 520,
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          Meet Nidhi, your AI CFO. She monitors your cash, protects your GST,
          and tells you exactly what to do in your language, every morning.
        </motion.p>

        {/* Email input bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.55 }}
          className="hero-email-bar"
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 40,
            background: "#FFFFFF",
            border: "1px solid #D4C9A8",
            boxShadow: "0px 10px 40px 5px rgba(139,105,20,0.12)",
            padding: "6px 6px 6px 20px",
            gap: 8,
            maxWidth: 480,
            width: "100%",
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your business email"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: 15,
              color: "#1A1008",
              minWidth: 0,
            }}
            className="placeholder:text-[rgba(26,16,8,0.35)]"
          />
          <Link
            to={`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            style={{
              borderRadius: 34,
              padding: "12px 24px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#FFFFFF",
              background: "linear-gradient(135deg, #C41E1E 0%, #8B0000 100%)",
              boxShadow:
                "inset -4px -6px 25px 0px rgba(201,201,201,0.08), inset 4px 4px 10px 0px rgba(29,29,29,0.24)",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              textDecoration: "none",
              display: "inline-block",
              transition: "all 200ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #9E1818 0%, #6B0000 100%)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #C41E1E 0%, #8B0000 100%)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Start Free Trial
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.7 }}
          className="flex items-center gap-3 flex-wrap"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {[
              { bg: "#C41E1E", initial: "R" },
              { bg: "#8B6914", initial: "P" },
              { bg: "#1A1008", initial: "K" },
            ].map((a) => (
              <div
                key={a.initial}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 28,
                  height: 28,
                  background: a.bg,
                  border: "2px solid white",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 10,
                  color: "white",
                }}
              >
                {a.initial}
              </div>
            ))}
          </div>

          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 13,
              color: "rgba(26,16,8,0.60)",
            }}
          >
            10,000+ Indian businesses trust FynHelp
          </span>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="#8B6914"
              >
                <path d="M6 0l1.76 3.57 3.94.57-2.85 2.78.67 3.93L6 9.02 2.48 10.85l.67-3.93L.3 4.14l3.94-.57z" />
              </svg>
            ))}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: 12,
                color: "rgba(26,16,8,0.50)",
                marginLeft: 4,
              }}
            >
              4.8/5 rating
            </span>
          </div>
        </motion.div>
      </div>

      {/* Mobile responsive overrides via CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hero-email-bar {
            flex-direction: column !important;
            border-radius: 16px !important;
            padding: 12px !important;
          }
          .hero-email-bar input {
            width: 100% !important;
            padding: 8px 0 !important;
          }
          .hero-email-bar a {
            width: 100% !important;
            text-align: center !important;
          }
        }
        @media (max-width: 768px) {
          section > div:nth-child(3) {
            padding-top: 120px !important;
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}
