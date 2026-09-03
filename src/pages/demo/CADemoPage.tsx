import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { track } from "@/lib/analytics";

const DEMO_CA_FIRM_ID = "a0000000-ca00-de00-0000-000000000001";

export default function CADemoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    track("demo_started", { demo_type: "ca" });
    sessionStorage.setItem("fynhelp_ca_demo", "true");
    sessionStorage.setItem("fynhelp_ca_demo_firm_id", DEMO_CA_FIRM_ID);
    const t = setTimeout(() => navigate("/ca/dashboard", { replace: true }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#171208", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 28, color: "#F4EDDA" }}>FYNHelp</div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: "#8B6914", textTransform: "uppercase", letterSpacing: "0.1em" }}>CA Partner Portal</div>
      <div style={{ width: 200, height: 2, background: "rgba(244,237,218,0.12)", borderRadius: 1, marginTop: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#C41E1E", borderRadius: 1, animation: "progressbar 1.6s ease-in-out forwards" }} />
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(244,237,218,0.4)" }}>Loading demo environment...</div>
      <style>{`@keyframes progressbar { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
}
