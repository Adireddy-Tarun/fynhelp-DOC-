import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stats = [
  { num: "₹0", title: "Average financial intelligence budget for Indian SMEs", desc: "No CFO. No analyst. No financial model. Just a gut feeling and a prayer that the bank balance holds.", bg: "bg-fyn-ink", text: "text-white" },
  { num: "42%", title: "of Indian SMEs cite cash flow as their #1 challenge", desc: "Most business owners discover a cash crisis 14 days before it happens — not 60 days out when something can still be done about it.", bg: "bg-fyn-red", text: "text-white" },
  { num: "₹3.2L", title: "Average ITC lost per SME annually to GST mismatches", desc: "Vendor non-compliance, missed reconciliations, and unclaimed credit silently drain lakhs from Indian businesses that can least afford it.", bg: "bg-fyn-gold", text: "text-white" },
];

export default function ProblemSection() {
  const ref = useScrollReveal();

  return (
    <section className="bg-fyn-beige py-24" ref={ref}>
      <div className="fyn-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <span className="fyn-caption text-fyn-gold block mb-4 reveal-up text-base">The Problem</span>
            <h2 className="text-3xl md:text-4xl leading-[1.2] text-fyn-ink mb-6 reveal-left font-sans font-semibold lg:text-3xl">
              India's 63 million businesses are making ₹Crore decisions with zero financial intelligence.
            </h2>
            <p className="text-fyn-ink/70 text-lg leading-relaxed mb-4 reveal-left" style={{ transitionDelay: "100ms" }}>
              Less than 2% of Indian SMEs can afford a CFO. The remaining 98% — manufacturers in Ludhiana,
              traders in Surat, clinics in Chennai, exporters in Tiruppur — make critical decisions about
              hiring, credit, inventory, and compliance purely on gut feel and a bank balance check.
            </p>
            <p className="text-fyn-ink/60 text-base leading-relaxed mb-8 reveal-left" style={{ transitionDelay: "200ms" }}>
              — 50% of Indian businesses fail within 5 years.<br />
              — Most failures are not caused by bad products or poor sales.<br />
              — They are caused by cash flow mismanagement and compliance surprises.
            </p>
            <Link to="/solutions" className="text-fyn-red font-medium hover:underline reveal-left" style={{ transitionDelay: "300ms" }}>
              See how FynHelp fixes this →
            </Link>
          </div>

          <div className="stagger-children space-y-6">
            {stats.map((s) => (
              <div key={s.num} className={`${s.bg} ${s.text} rounded-lg p-7 hover-card`}>
                <div className="h-1 w-10 bg-fyn-red rounded mb-4" />
                <p className="text-4xl font-bold mb-2 font-sans">{s.num}</p>
                <p className="font-semibold text-sm mb-2 opacity-90">{s.title}</p>
                <p className="text-sm leading-relaxed opacity-70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
