import { Link } from "react-router-dom";
import FynLogo from "./FynLogo";

const links = [
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Early Access", href: "/early-access" },
];

const Footer = () => (
  <footer className="bg-fyn-ink pt-16 pb-10">
    <div className="fyn-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div>
          <FynLogo variant="light" showTagline size="md" />
          <p className="text-white/55 text-sm leading-relaxed mt-5 max-w-xs">
            AI-powered financial intelligence for Indian SMEs.
          </p>
        </div>

        <div>
          <p className="fyn-caption text-fyn-gold mb-4 text-sm uppercase tracking-wider">Company</p>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="mailto:hello@fynhelp.com"
                className="text-white/60 text-sm hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="fyn-caption text-fyn-gold mb-4 text-sm uppercase tracking-wider">Connect</p>
          <div className="flex gap-3">
            {[
              { label: "LinkedIn", href: "#" },
              { label: "Twitter", href: "#" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-white/40 hover:text-white/80 transition-opacity text-xs border border-white/15 rounded-full px-4 h-8 inline-flex items-center"
                aria-label={s.label}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6 text-white/40 text-xs text-center">
        © 2026 FYNHelp. Built for Indian SMEs.
      </div>
    </div>
  </footer>
);

export default Footer;
