import { useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Droplet, TrendingUp, Receipt, ShieldCheck, Users, ArrowRight, Check } from "lucide-react";

const MODULES = [
  {
    Icon: Droplet,
    name: "Liquidity Intelligence",
    tagline: "Always know your cash position.",
    features: ["Live cash balance across banks", "13-week runway forecast", "Burn-rate alerts", "What-if scenarios"],
  },
  {
    Icon: TrendingUp,
    name: "Revenue Intelligence",
    tagline: "Turn invoices into cash, faster.",
    features: ["Receivables ageing", "Auto-chase reminders", "Customer concentration risk", "Revenue cohort trends"],
  },
  {
    Icon: Receipt,
    name: "Cost Intelligence",
    tagline: "Cut waste, protect margin.",
    features: ["Vendor spend analytics", "Recurring cost detection", "Approval workflows", "Margin breakdowns"],
  },
  {
    Icon: ShieldCheck,
    name: "Governance Intelligence (GST/TDS)",
    tagline: "Never miss a filing.",
    features: ["GSTR-1/3B/9 calendar", "TDS tracking", "ITC reconciliation", "Notice risk scoring"],
  },
  {
    Icon: Users,
    name: "Workforce Intelligence",
    tagline: "Payroll & people, simplified.",
    features: ["Payroll planner", "Statutory dues tracking", "Headcount forecasting", "Employee cost analytics"],
  },
];

const ProductsPage = () => {
  useEffect(() => {
    document.title = "Product - Financial Intelligence Platform | FYNHelp";
  }, []);

  return (
    <Layout>
      <section className="bg-fyn-ink text-white py-20">
        <div className="fyn-container text-center max-w-3xl">
          <span className="inline-block text-xs uppercase tracking-widest text-fyn-gold font-semibold mb-5">
            The Platform
          </span>
          <h1 className="font-serif text-4xl md:text-5xl mb-5">Five intelligence modules. One CFO-grade workspace.</h1>
          <p className="text-white/70 text-lg">
            Everything Indian SMEs need to run finance, compliance, and people — without hiring a full finance team.
          </p>
        </div>
      </section>

      <section className="bg-fyn-beige py-20">
        <div className="fyn-container space-y-6 max-w-5xl">
          {MODULES.map(({ Icon, name, tagline, features }) => (
            <div key={name} className="bg-white border border-fyn-ink/10 rounded-xl p-8 grid md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 rounded-lg bg-fyn-red/10 flex items-center justify-center text-fyn-red mb-4">
                  <Icon size={24} />
                </div>
                <h2 className="font-serif text-2xl text-fyn-ink mb-2">{name}</h2>
                <p className="text-fyn-ink/65 text-sm">{tagline}</p>
              </div>
              <ul className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-fyn-ink/80">
                    <Check size={16} className="text-fyn-red mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="fyn-container text-center max-w-2xl">
          <h2 className="font-serif text-3xl md:text-4xl text-fyn-ink mb-4">Ready to see it in action?</h2>
          <p className="text-fyn-ink/65 mb-8">Get early access and shape the platform with us.</p>
          <Link
            to="/early-access"
            className="bg-fyn-red text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Get Early Access <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default ProductsPage;
