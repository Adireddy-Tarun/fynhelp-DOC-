import { Link } from "react-router-dom";
import FynLogo from "./FynLogo";

const suites = [
  "Liquidity Intelligence", "Revenue Intelligence", "Cost Intelligence",
  "GST & Tax Intelligence", "Governance Intelligence", "HR & Workforce Intelligence",
  "Decision Simulator", "Market & Growth Intelligence", "Banking & Fintech Intelligence",
  "CA & Partner Ecosystem",
];

const company = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/about" },
  { label: "Partners", href: "/about" },
  { label: "Contact", href: "/about" },
];

const Footer = () => (
  <footer className="bg-fyn-ink text-white">
    <div className="fyn-container py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Col 1 */}
        <div>
          <FynLogo variant="light" />
          <p className="mt-4 text-white/60 text-sm leading-relaxed">
            India's most intelligent Virtual CFO platform. Trusted by 10,000+ SMEs.
          </p>
          <div className="flex gap-4 mt-4">
            {["LinkedIn", "X", "YouTube"].map((s) => (
              <span key={s} className="text-white/40 text-xs hover:text-white cursor-pointer">{s}</span>
            ))}
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-white/40 fyn-label text-xs mb-4">Product</h4>
          <ul className="space-y-2">
            {suites.map((s) => (
              <li key={s}>
                <Link to="/products" className="text-white/60 text-sm hover:text-white">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-white/40 fyn-label text-xs mb-4">Company</h4>
          <ul className="space-y-2">
            {company.map((c) => (
              <li key={c.label}>
                <Link to={c.href} className="text-white/60 text-sm hover:text-white">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-white/40 fyn-label text-xs mb-4">Legal & Contact</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li>support@fynhelp.com</li>
            <li>Bengaluru, Karnataka, India</li>
            <li className="pt-2">
              <Link to="/pricing" className="hover:text-white">Privacy Policy</Link>
              {" | "}
              <Link to="/pricing" className="hover:text-white">Terms of Service</Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-white">Refund Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div className="border-t border-white/10 py-4">
      <p className="text-center text-white/30 text-xs">
        © 2025 FynHelp Technologies Pvt Ltd. All rights reserved. CIN: UXXXXX | GST: XXXXXXXXXXXX
      </p>
    </div>
  </footer>
);

export default Footer;
