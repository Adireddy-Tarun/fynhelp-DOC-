import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown, Bell, Search, User, LogOut } from "lucide-react";
import FynLogo from "@/components/FynLogo";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <FynLogo className="h-8 w-8" />
          <span className="text-lg font-semibold text-foreground">FynHelp</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/resources" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            Resources
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
