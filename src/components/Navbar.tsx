import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import FynLogo from "./FynLogo";
import ProductsNav from "./products/ProductsNav";
import FYNIcon, { type FYNIconName } from "./FYNIcon";

import { Menu, X, Shield, ChevronDown } from "lucide-react";

const navLinks = [
  { label: "Use Cases", href: "/use-cases" },
  { label: "CA Partners", href: "/ca-firms" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

const resourceItems: { icon: FYNIconName; label: string; desc: string; tab: string }[] = [
  { icon: "getting-started", label: "Getting Started", desc: "Day 1 to mastery", tab: "getting-started" },
  { icon: "templates", label: "Templates & Downloads", desc: "Excel, guides, tools", tab: "templates" },
  { icon: "glossary", label: "Financial Glossary", desc: "A–Z definitions", tab: "glossary" },
  { icon: "blog", label: "Blog", desc: "Insights & updates", tab: "blog" },
  { icon: "community", label: "Community", desc: "Q&A & discussions", tab: "community" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const resourcesCloseTimer = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  const openResources = () => {
    clearTimeout(resourcesCloseTimer.current);
    setResourcesOpen(true);
  };
  const scheduleCloseResources = () => {
    clearTimeout(resourcesCloseTimer.current);
    resourcesCloseTimer.current = setTimeout(() => setResourcesOpen(false), 600);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setResourcesOpen(false);
  }, [location.pathname, location.search]);

  // Close resources dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHome = location.pathname === "/";
  const navBg = isHome && !scrolled
    ? "bg-transparent"
    : "bg-fyn-ink border-b border-white/10 backdrop-blur-xl";

  const isResourcesActive = location.pathname === "/resources";

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

            {/* Pricing, Security */}
            {navLinks.slice(0, 4).map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`nav-link-underline text-sm font-medium transition-colors py-6 ${
                  location.pathname === l.href ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}

            {/* Resources dropdown */}
            <div
              ref={resourcesRef}
              className="relative py-6"
              onMouseEnter={openResources}
              onMouseLeave={scheduleCloseResources}
            >
              <button
                onClick={() => setResourcesOpen((v) => !v)}
                className={`nav-link-underline text-sm font-medium transition-colors flex items-center gap-1 ${
                  isResourcesActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
                aria-haspopup="true"
                aria-expanded={resourcesOpen}
              >
                Resources
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {resourcesOpen && (
                <div
                  className="absolute right-0 top-full"
                  style={{
                    width: 320,
                    marginTop: 12,
                    background: "rgba(255,255,255,0.98)",
                    backdropFilter: "blur(20px) saturate(110%)",
                    WebkitBackdropFilter: "blur(20px) saturate(110%)",
                    borderRadius: 20,
                    border: "1px solid rgba(139,105,20,0.25)",
                    boxShadow: "0 16px 48px rgba(26,16,8,0.18), 0 0 1px rgba(139,105,20,0.3)",
                    padding: "16px 0",
                    zIndex: 1000,
                    animation: "fade-in 200ms ease-out",
                  }}
                  role="menu"
                >
                  {resourceItems.map((item, i) => {
                    const isActive =
                      isResourcesActive &&
                      new URLSearchParams(location.search).get("tab") === item.tab;
                    return (
                      <div key={item.tab}>
                        {i === 3 && (
                          <div
                            style={{
                              borderTop: "1px solid rgba(26,16,8,0.08)",
                              margin: "8px 24px",
                            }}
                          />
                        )}
                        <Link
                          to={`/resources?tab=${item.tab}`}
                          role="menuitem"
                          className="group flex items-center gap-[14px] transition-colors"
                          style={{
                            padding: isActive ? "14px 24px 14px 20px" : "14px 24px",
                            background: isActive ? "rgba(139,105,20,0.12)" : "transparent",
                            borderLeft: isActive ? "4px solid #8B6914" : "4px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.background =
                                "rgba(139,105,20,0.08)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                          }}
                        >
                          <span
                            className="transition-transform duration-200 group-hover:scale-110"
                            style={{ display: "inline-flex" }}
                          >
                            <FYNIcon name={item.icon} size={32} animated={false} />
                          </span>
                          <span className="flex flex-col">
                            <span
                              style={{
                                fontFamily: "Raleway, sans-serif",
                                fontWeight: 600,
                                fontSize: 16,
                                color: isActive ? "#8B6914" : "#1A1008",
                              }}
                              className="group-hover:text-fyn-gold"
                            >
                              {item.label}
                            </span>
                            <span
                              style={{
                                fontFamily: "Roboto, sans-serif",
                                fontWeight: 400,
                                fontSize: 13,
                                color: "rgba(26,16,8,0.6)",
                                marginTop: 2,
                              }}
                            >
                              {item.desc}
                            </span>
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* About */}
            {navLinks.slice(4).map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className={`nav-link-underline text-sm font-medium transition-colors py-6 ${
                  location.pathname === l.href ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="text-white/80 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/demo/login"
              className="text-white/80 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-lg border border-white/20 hover:border-white/40 transition-colors"
            >
              Demo Login
            </Link>
            <Link
              to="/ca/register"
              className="bg-fyn-red text-white hover:bg-[#9E2A30] text-sm font-semibold px-4 py-2.5 rounded-lg border border-fyn-red transition-colors"
            >
              Register as CA
            </Link>
            <Link
              to="/waitlist"
              className="bg-fyn-red text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover-btn-primary"
            >
              Join Waitlist
            </Link>
          </div>

          {/* Mobile toggle */}
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
          className={`absolute right-0 top-0 bottom-0 w-[300px] bg-fyn-ink transition-transform duration-400 overflow-y-auto ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ transitionTimingFunction: "var(--ease-spring)" }}
        >
          <div className="flex flex-col gap-2 pt-20 px-6 pb-8">
            <ProductsNav
              variant="mobile"
              mobileMenuOpen={mobileOpen}
              onCloseMobileMenu={() => setMobileOpen(false)}
            />

            {/* Pricing, Security */}
            {navLinks.slice(0, 4).map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 hover:text-white text-base font-medium py-3 border-b border-white/5 flex items-center gap-2"
              >
                {l.href === "/security" && <Shield size={18} className="text-fyn-gold" />}
                {l.label}
              </Link>
            ))}

            {/* Mobile Resources accordion */}
            <button
              onClick={() => setMobileResourcesOpen((v) => !v)}
              className="text-white/80 hover:text-white text-base font-medium py-3 border-b border-white/5 flex items-center justify-between w-full"
              aria-expanded={mobileResourcesOpen}
            >
              <span>Resources</span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  mobileResourcesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileResourcesOpen && (
              <div className="flex flex-col pl-4 border-b border-white/5">
                {resourceItems.map((item) => (
                  <Link
                    key={item.tab}
                    to={`/resources?tab=${item.tab}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-white/70 hover:text-white text-sm py-2.5 flex items-center gap-3"
                  >
                    <FYNIcon name={item.icon} size={24} animated={false} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* About */}
            {navLinks.slice(4).map((l) => (
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
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-white text-center py-3 rounded-lg font-semibold border border-white/20"
              >
                Sign In
              </Link>
              <Link
                to="/ca/register"
                onClick={() => setMobileOpen(false)}
                className="block bg-fyn-red text-white text-center py-3 rounded-lg font-semibold border border-fyn-red"
              >
                Register as CA
              </Link>
              <Link
                to="/demo/login"
                onClick={() => setMobileOpen(false)}
                className="block text-white text-center py-3 rounded-lg font-semibold border border-white/20"
              >
                Demo Login
              </Link>
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
