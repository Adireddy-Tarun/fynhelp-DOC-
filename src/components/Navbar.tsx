import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Bell, Search, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const user = null;
  const hasNotifications = false;
  const hasAlerts = false;

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "Notifications", path: "/notifications" },
    { label: "Alerts", path: "/alerts" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <FynLogo className="h-8 w-8" />
          <span className="text-lg font-semibold">FynHelp</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-foreground/80 hover:text-foreground">Home</Link>
          <Link to="/explore" className="text-sm text-foreground/80 hover:text-foreground">Explore</Link>
          <Link to="/notifications" className="text-sm text-foreground/80 hover:text-foreground">Notifications</Link>
          <Link to="/alerts" className="text-sm text-foreground/80 hover:text-foreground">Alerts</Link>
          <Link to="/settings" className="text-sm text-foreground/80 hover:text-foreground">Settings</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button className="text-sm text-foreground/80 hover:text-foreground">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="text-sm text-foreground/80 hover:text-foreground">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
