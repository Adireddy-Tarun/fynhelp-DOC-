import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import FynLogo from "./FynLogo";
import ProductsNav from "./products/ProductsNav";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const navBg = isHome && !scrolled
    ? "bg-transparent"
    : "bg-fyn-ink border-b border-white/10 backdrop-blur-xl";

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}
        style={{ height: 72 }}
      >
        <div className="fyn-container h-full flex items-center justify-between">
          <Link to="/" className="hover:opacity-85 transition-opacity">
            <FynLogo variant="light" showTagline={false} size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <ProductsNav variant="desktop" />
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`nav-link-underline text-sm font-medium transition-colors py-6 ${
                  location.pathname === l.href
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/waitlist"
              className="bg-fyn-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover-btn-primary"
            >
              Join Waitlist
            </Link>
          </div>

          {/* Mobile toggle — animated hamburger */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
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
            <ProductsNav
              variant="mobile"
              mobileMenuOpen={mobileOpen}
              onCloseMobileMenu={() => setMobileOpen(false)}
            />
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
              <Link
                to="/waitlist"
                onClick={() => setMobileOpen(false)}
                className="block bg-fyn-red text-white text-center py-3 rounded-lg font-semibold"
              >
                Join Waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
