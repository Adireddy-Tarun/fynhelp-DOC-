import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FynLogo from "./FynLogo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "About", href: "/about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-fyn-ink sticky top-0 z-50" style={{ height: 72 }}>
      <div className="fyn-container h-full flex items-center justify-between">
        <Link to="/">
          <FynLogo variant="light" showTagline={false} />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === l.href ? "text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/signin" className="text-sm font-medium text-white/80 hover:text-white px-4 py-2">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-fyn-red text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-fyn-ink absolute inset-x-0 top-[72px] z-50 border-t border-white/10 pb-6">
          <div className="fyn-container flex flex-col gap-4 pt-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="text-white/80 hover:text-white text-base font-medium py-2"
              >
                {l.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            <Link to="/signin" onClick={() => setMobileOpen(false)} className="text-white/80 py-2">Sign In</Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="bg-fyn-red text-white text-center py-3 rounded-lg font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
