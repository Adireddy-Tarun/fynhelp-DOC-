import { Link } from "react-router-dom";
import FynLogo from "./FynLogo";

const productLinks = [
  { label: "Liquidity Intelligence", href: "/#product-ecosystem" },
  { label: "Revenue Intelligence", href: "/#product-ecosystem" },
  { label: "GST & Tax", href: "/#product-ecosystem" },
  { label: "Governance Intelligence", href: "/#product-ecosystem" },
  { label: "HR & Workforce", href: "/#product-ecosystem" },
  { label: "Decision Simulator", href: "/#product-ecosystem" },
  { label: "Market Intelligence", href: "/#product-ecosystem" },
  { label: "Banking Intelligence", href: "/#product-ecosystem" },
  { label: "CA Partner Program", href: "/#product-ecosystem" },
  { label: "AI CFO Nidhi", href: "/dashboard/nidhi" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/dashboard/settings/integrations" },
];

const companyLinks = [
  { label: "About FynHelp", href: "/about" },
  { label: "Our Mission", href: "/about" },
  { label: "Founders", href: "/about" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "Contact Us", href: "/about" },
];

const legalLinks = [
  "Privacy Policy", "Terms of Service", "Refund Policy",
  "Cookie Policy", "DPDP Act Compliance",
];

const Footer = () => (
  <footer className="bg-fyn-ink pt-20 pb-12">
    <div className="fyn-container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div>
          <FynLogo variant="light" showTagline size="md" />
          <p className="text-white/55 text-sm leading-relaxed mt-5 mb-6">
            India's most intelligent Virtual CFO platform. Built for Indian SMEs — from textile traders in Surat to exporters in Tiruppur.
          </p>
          <p className="text-white/30 text-xs mb-3">Built for India:</p>
          <div className="flex flex-wrap gap-2 mb-6 text-xl font-bold font-sans">
            {["GSP Certified", "Account Aggregator Enabled", "ISO 27001 In Progress"].map((b) => (
              <span key={b} className="text-white/50 text-[10px] border border-white/15 px-2.5 py-1 rounded">{b}</span>
            ))}
          </div>
          <div className="flex gap-3">
            {["LinkedIn", "X", "YouTube", "WhatsApp"].map((s) => (
              <a key={s} href="#" className="text-white/40 hover:text-white/70 transition-opacity text-xs border border-white/10 rounded-full w-8 h-8 flex items-center justify-center" aria-label={s}>
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <p className="fyn-caption text-fyn-gold mb-5 text-lg">Product</p>
          <ul className="space-y-2">
            {productLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="text-white/60 text-sm hover:text-white nav-link-underline transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className="fyn-caption text-fyn-gold mb-5 text-base">Company</p>
          <ul className="space-y-2">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.href} className="text-white/60 text-sm hover:text-white nav-link-underline transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Legal */}
        <div>
          <p className="fyn-caption text-fyn-gold mb-5 text-sm">Support & Legal</p>
          <div className="mb-6">
            <a href="mailto:support@fynhelp.com" className="text-white/70 text-sm hover:text-fyn-gold transition-colors block mb-1">support@fynhelp.com</a>
            <p className="text-white/40 text-xs">Mon-Fri 9AM-7PM IST | Sat 10AM-2PM IST</p>
          </div>
          <ul className="space-y-2">
            {legalLinks.map((l) => (
              <li key={l}>
                <a href="#" className="text-white/50 text-sm hover:text-white/70 transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-white/30 text-xs">
        <span>© 2026 FynHelp Technologies. All rights reserved.</span>
        <span className="text-center">FynHelp Technologies, Bengaluru, Karnataka, India</span>
        <span>Made in India, for India 🇮🇳</span>
      </div>
    </div>
  </footer>
);

export default Footer;
