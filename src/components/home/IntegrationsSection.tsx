import { useScrollReveal } from "@/hooks/useScrollReveal";

const rows = [
  {
    label: "Banking — Via RBI Account Aggregator",
    items: ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Yes Bank", "IndusInd Bank", "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank", "UCO Bank", "IDFC First Bank", "Federal Bank"],
    extra: "+ 15 more banks via Finvu and OneMoney Account Aggregator",
  },
  {
    label: "Accounting",
    items: [
      { name: "Tally Prime", badge: "ODBC" },
      { name: "Zoho Books", badge: "OAuth API" },
      { name: "QuickBooks India", badge: "OAuth API" },
      { name: "Busy Accounting", badge: "CSV Import" },
      { name: "Marg ERP", badge: "CSV Import" },
      { name: "SAP Business One", badge: "Enterprise" },
    ],
  },
  {
    label: "Payroll & HR",
    items: ["Keka HR", "GreytHR", "Razorpay Payroll", "Darwinbox", "EPFO Portal"],
  },
  {
    label: "Government Portals (Direct API Access)",
    items: [
      { name: "GST Portal (GSTN)", badge: "GSP Certified", featured: true },
      { name: "e-Invoice Portal" }, { name: "e-Way Bill Portal" },
      { name: "TRACES (TDS)" }, { name: "MCA21 (ROC)" }, { name: "EPFO" },
    ],
  },
  {
    label: "Communication & Delivery",
    items: ["WhatsApp Business", "Gmail", "Outlook", "SMS", "In-App"],
    extra: "Morning briefs · Payment reminders · Compliance alerts · Collection chases · Monthly reports",
  },
];

export default function IntegrationsSection() {
  const ref = useScrollReveal();

  return (
    <section className="bg-fyn-beige-dark py-20" ref={ref}>
      <div className="fyn-container">
        <span className="fyn-caption text-fyn-gold block mb-4 reveal-up">Works With What You Already Use</span>
        <h2 className="text-3xl lg:text-[44px] leading-[1.2] text-fyn-ink mb-12 reveal-up">
          Built for the Indian business technology stack
        </h2>

        <div className="space-y-8 stagger-children">
          {rows.map((row) => (
            <div key={row.label} className="bg-fyn-beige-card border border-fyn-ink/8 rounded-lg p-6">
              <p className="fyn-caption text-fyn-gold text-[11px] mb-4">{row.label}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                {row.items.map((item, i) => {
                  const name = typeof item === "string" ? item : item.name;
                  const badge = typeof item === "object" ? item.badge : undefined;
                  const featured = typeof item === "object" && "featured" in item && item.featured;
                  return (
                    <div key={i} className="flex items-center gap-2 hover-scale-icon cursor-default">
                      <span className="text-fyn-ink/60 text-sm font-medium">{name}</span>
                      {badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          featured ? "bg-fyn-gold text-white" : "bg-fyn-ink/8 text-fyn-ink/40"
                        }`}>{badge}</span>
                      )}
                      {i < row.items.length - 1 && <span className="text-fyn-ink/10 ml-2">|</span>}
                    </div>
                  );
                })}
              </div>
              {row.extra && <p className="text-fyn-ink/40 text-xs mt-3 italic">{row.extra}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
