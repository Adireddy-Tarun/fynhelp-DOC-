import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import FynLogo from "./FynLogo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products", hasMega: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const megaSuites = [
  { name: "Liquidity Intelligence", desc: "Cash, runway, burn rate", color: "#C41E1E" },
  { name: "Revenue Intelligence", desc: "Receivables, collections", color: "#1A4A8B" },
  { name: "Cost Intelligence", desc: "Spend control, payables", color: "#1A6B3C" },
  { name: "GST & Tax Intelligence", desc: "ITC, notice risk, filing", color: "#8B5A00" },
  { name: "Governance Intelligence", desc: "ROC, compliance, audit", color: "#8B6914" },
  { name: "HR & Workforce", desc: "Hiring, payroll, attrition", color: "#0F766E" },
  { name: "Decision Simulator", desc: "What-if scenarios", color: "#C41E1E" },
  { name: "Market & Growth", desc: "Benchmarks, credit rating", color: "#DC6B19" },
  { name: "Banking & Fintech", desc: "Multi-bank, AA, UPI", color: "#1A4A8B" },
  { name: "CA Partner Ecosystem", desc: "White-label for CAs", color: "#8B6914" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const handleMegaEnter = () => {
    clearTimeout(megaTimeout.current);
    megaTimeout.current = setTimeout(() => setMegaOpen(true), 200);
  };
  const handleMegaLeave = () => {
    clearTimeout(megaTimeout.current);
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 300);
  };

  const isHome = location.pathname === "/";
  const navBg = isHome && !scrolled
    ? "bg-transparent"
    : "bg-fyn-ink border-b border-white/10 backdrop-blur-xl";

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}
        style={{ height: 72 }}
      >
        <div className="fyn-container h-full flex items-center justify-between">
          <Link to="/" className="hover:opacity-85 transition-opacity">
            <FynLogo variant="light" showTagline={false} size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={l.hasMega ? handleMegaEnter : undefined}
                onMouseLeave={l.hasMega ? handleMegaLeave : undefined}
              >
                <Link
                  to={l.href}
                  className={`nav-link-underline text-sm font-medium transition-colors py-6 ${
                    location.pathname === l.href
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/signin"
              className="nav-link-underline text-sm font-medium text-white/80 hover:text-white px-3 py-2"
            >
              Sign In
            </Link>
            <div className="w-px h-5 bg-white/20" />
            <Link
              to="/signup"
              className="bg-fyn-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover-btn-primary"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mega Menu */}
        <div
          className={`hidden lg:block absolute inset-x-0 top-[72px] bg-fyn-ink border-b border-white/10 transition-all duration-300 overflow-hidden ${
            megaOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
        >
          <div className="fyn-container py-8">
            <div className="grid grid-cols-3 gap-12">
              {/* Suites */}
              <div className="col-span-1">
                <p className="fyn-caption text-fyn-gold mb-4">Intelligence Suites</p>
                <div className="space-y-1">
                  {megaSuites.map((s) => (
                    <Link
                      key={s.name}
                      to="/products"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div>
                        <p className="text-white text-sm font-medium">{s.name}</p>
                        <p className="text-white/40 text-xs">{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <p className="fyn-caption text-fyn-gold mb-4">Key Features</p>
                <div className="space-y-1">
                  {[
                    { name: "Nidhi AI CFO", desc: "Your AI-powered financial advisor", featured: true },
                    { name: "Decision Simulator", desc: "Model any business scenario" },
                    { name: "GST Intelligence", desc: "ITC protection and compliance" },
                    { name: "CA Partner Program", desc: "White-label for accountants" },
                    { name: "Working Capital Marketplace", desc: "Access financing options" },
                  ].map((f) => (
                    <Link
                      key={f.name}
                      to="/products"
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      {f.featured && <div className="w-1.5 h-1.5 rounded-full bg-fyn-red" />}
                      <div>
                        <p className={`text-sm font-medium ${f.featured ? "text-fyn-red" : "text-white"}`}>{f.name}</p>
                        <p className="text-white/40 text-xs">{f.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* By Industry / Size */}
              <div>
                <p className="fyn-caption text-fyn-gold mb-4">By Industry</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {["Textiles", "Manufacturing", "IT & Services", "Healthcare", "Exports"].map((i) => (
                    <Link key={i} to="/solutions" className="text-white/60 text-xs px-3 py-1.5 rounded border border-white/10 hover:border-white/30 hover:text-white transition-colors">{i}</Link>
                  ))}
                </div>
                <p className="fyn-caption text-fyn-gold mb-4">By Business Size</p>
                <div className="flex flex-wrap gap-2">
                  {["Under ₹5Cr", "₹5-50Cr", "₹50-200Cr", "₹200Cr+"].map((s) => (
                    <Link key={s} to="/pricing" className="text-white/60 text-xs px-3 py-1.5 rounded border border-white/10 hover:border-white/30 hover:text-white transition-colors">{s}</Link>
                  ))}
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 flex gap-6">
                  <Link to="/products" className="text-fyn-red text-sm font-medium hover:underline">All 50+ modules →</Link>
                  <Link to="/pricing" className="text-white/60 text-sm hover:text-white">See pricing →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: 72, background: "#1A1008" }} />

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[300px] bg-fyn-ink transition-transform duration-400 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ transitionTimingFunction: "var(--ease-spring)" }}
        >
          <div className="flex flex-col gap-2 pt-20 px-6">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 hover:text-white text-base font-medium py-3 border-b border-white/5"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 space-y-3">
              <Link to="/signin" onClick={() => setMobileOpen(false)} className="block text-white/80 py-2 text-center">Sign In</Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="block bg-fyn-red text-white text-center py-3 rounded-lg font-semibold"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
