import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import WaitlistForm from "@/components/WaitlistForm";
import { Rocket } from "lucide-react";

export default function WaitlistPage() {
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
