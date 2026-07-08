import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowRight, Linkedin, Twitter, Youtube, MessageCircle } from "lucide-react";
import iconCreamAsset from "@/assets/brand/fynhelp-icon-cream-new.png";

type DropdownItem = { label: string; href: string; accent?: boolean; divider?: boolean };

const productItems: DropdownItem[] = [
  { label: "Liquidity Intelligence", href: "/#product-ecosystem" },
  { label: "Revenue Intelligence", href: "/#product-ecosystem" },
  { label: "Cost Intelligence", href: "/#product-ecosystem" },
  { label: "GST & Tax Intelligence", href: "/#product-ecosystem" },
  { label: "Governance Intelligence", href: "/#product-ecosystem" },
  { label: "HR & Workforce Intelligence", href: "/#product-ecosystem" },
  { label: "divider", href: "", divider: true },
  { label: "View All Products", href: "/#product-ecosystem", accent: true },
];

const companyItems: DropdownItem[] = [
  { label: "About FynHelp", href: "/about" },
  { label: "Our Mission", href: "/about" },
  { label: "Founders", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "Contact Us", href: "/about" },
];

const legalItems: DropdownItem[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "DPDP Act Compliance", href: "/dpdp-compliance" },
];

const caItems: DropdownItem[] = [
  { label: "CA Partner Portal", href: "/ca/login" },
  { label: "Register as CA", href: "/ca/register" },
  { label: "CA Pricing", href: "/pricing" },
  { label: "CA Login", href: "/ca/login" },
];

type DropdownKey = "product" | "company" | "legal" | null;

const NavDropdown = ({
  label,
  items,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  items: DropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => !isOpen && onToggle()}
      onMouseLeave={onClose}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-[15px] font-semibold text-white/80 hover:text-[#C41E1E] hover:underline underline-offset-4 transition-colors duration-300"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        role="menu"
        className={`absolute top-full right-0 mt-4 min-w-[220px] p-5 rounded-xl border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 z-50 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2.5 pointer-events-none"
        }`}
        style={{ background: "rgba(26, 20, 18, 0.95)" }}
      >
        {items.map((item, idx) =>
          item.divider ? (
            <div key={`d-${idx}`} className="h-px bg-white/10 my-2" />
          ) : (
            <Link
              key={item.label}
              to={item.href}
              role="menuitem"
              onClick={onClose}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                item.accent
                  ? "text-[#C41E1E] hover:bg-[#C41E1E]/10"
                  : "text-white/75 hover:bg-[#C41E1E]/10 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              {item.accent && <ArrowRight size={14} />}
            </Link>
          )
        )}
      </div>
    </div>
  );
};

const Footer = () => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const toggle = (key: Exclude<DropdownKey, null>) =>
    setOpenDropdown((prev) => (prev === key ? null : key));
  const close = () => setOpenDropdown(null);

  const socials = [
    { Icon: Linkedin, label: "Follow us on LinkedIn", href: "https://linkedin.com/company/fynhelp" },
    { Icon: Twitter, label: "Follow us on X", href: "https://twitter.com/fynhelp" },
    { Icon: Youtube, label: "Subscribe on YouTube", href: "https://youtube.com/@fynhelp" },
    { Icon: MessageCircle, label: "Chat on WhatsApp", href: "https://wa.me/919876543210" },
  ];

  return (
    <footer
      className="relative overflow-hidden animate-fade-in"
      style={{
        background: "linear-gradient(180deg, #1a1412 0%, #0a0a0a 100%)",
        padding: "80px 60px",
      }}
    >
      {/* Subtle bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 600,
          height: 300,
          background:
            "radial-gradient(circle, rgba(196, 30, 30, 0.03), transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Noise overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.005,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* SECTION 1: TOP ROW */}
        <div className="flex flex-wrap justify-between items-start gap-12 mb-[100px] max-md:mb-[60px] max-md:flex-col max-md:items-center max-md:text-center">
          {/* Brand */}
          <div className="max-md:flex max-md:flex-col max-md:items-center">
            <div className="flex items-center gap-3 mb-3">
              <img src={iconCreamAsset.url} alt="FYNHelp" style={{ height: 36, width: 36, objectFit: "contain", display: "block" }} />
            </div>
            <p
              className="text-white/40 uppercase"
              style={{ fontSize: 12, letterSpacing: "1.5px", fontWeight: 400 }}
            >
              Find Your Numbers
            </p>
            <p
              className="text-white/70 mt-4 leading-relaxed max-md:max-w-[320px]"
              style={{ fontSize: 16, maxWidth: 400 }}
            >
              India's Virtual CFO Platform
              <br />
              Built for SMEs, loved by founders
            </p>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center gap-8 max-md:hidden"
            aria-label="Footer navigation"
          >
            <NavDropdown
              label="Product"
              items={productItems}
              isOpen={openDropdown === "product"}
              onToggle={() => toggle("product")}
              onClose={close}
            />
            <NavDropdown
              label="Company"
              items={companyItems}
              isOpen={openDropdown === "company"}
              onToggle={() => toggle("company")}
              onClose={close}
            />
            <NavDropdown
              label="Legal"
              items={legalItems}
              isOpen={openDropdown === "legal"}
              onToggle={() => toggle("legal")}
              onClose={close}
            />
            <a
              href="mailto:support@fynhelp.com"
              className="text-[15px] font-semibold text-white/80 hover:text-[#C41E1E] hover:underline underline-offset-4 transition-colors duration-300"
            >
              Contact
            </a>
          </nav>

          {/* CA Firms column (desktop only) */}
          <div className="max-md:hidden flex flex-col gap-3 min-w-[160px]">
            <h4
              className="text-white/40 uppercase"
              style={{ fontSize: 11, letterSpacing: "1.5px", fontWeight: 600 }}
            >
              For CA firms
            </h4>
            <ul className="flex flex-col gap-2">
              {caItems.map((item) => {
                const isRegister = item.href === "/ca/register";
                return (
                  <li key={item.label}>
                    {isRegister ? (
                      <Link
                        to={item.href}
                        className="inline-block bg-[#C41E1E] hover:bg-[#9E2A30] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-sm text-white/70 hover:text-[#C41E1E] transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Mobile nav grid */}
          <div className="hidden max-md:grid grid-cols-2 gap-4 text-sm w-full max-w-[320px]">
            {[...productItems.slice(0, 4), ...companyItems.slice(0, 2), ...legalItems.slice(0, 2), ...caItems.slice(0, 2)].map(
              (item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-white/70 hover:text-[#C41E1E] transition-colors text-center"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* SECTION 2: WATERMARK */}
        <div
          className="relative flex items-center justify-center overflow-hidden mb-20 max-md:mb-[60px]"
          style={{ height: 220 }}
          aria-hidden
        >
          <span
            className="select-none whitespace-nowrap max-lg:!text-[100px] max-lg:!tracking-[15px] max-md:!text-[80px] max-md:!tracking-[10px]"
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 900,
              fontSize: 180,
              letterSpacing: "20px",
              color: "rgba(255, 255, 255, 0.03)",
              textTransform: "uppercase",
              lineHeight: 1,
              animation: "fyn-watermark-breath 8s ease-in-out infinite",
            }}
          >
            FYNHELP
          </span>
        </div>

        {/* SECTION 3: BOTTOM ROW */}
        <div className="flex flex-wrap justify-between items-end gap-8 max-md:flex-col max-md:items-center max-md:text-center">
          <div>
            <p
              className="text-white/50"
              style={{ fontSize: 14, lineHeight: 1.8 }}
            >
              © 2026 FynHelp Technologies
              <br />
              Bengaluru, Karnataka, India
              <br />
              <span className="inline-block mt-2">Made in India, for India 🇮🇳</span>
            </p>
            <a
              href="mailto:support@fynhelp.com"
              className="inline-block mt-3 text-white/60 hover:text-[#C41E1E] transition-colors"
              style={{ fontSize: 14, fontWeight: 600 }}
            >
              support@fynhelp.com
            </a>
          </div>

          <div className="flex items-center gap-3 max-md:justify-center max-md:mt-5">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group flex items-center justify-center rounded-full border w-10 h-10 max-md:w-9 max-md:h-9 active:scale-95"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#C41E1E";
                  e.currentTarget.style.borderColor = "#C41E1E";
                  e.currentTarget.style.transform = "scale(1.1) translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(196, 30, 30, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <Icon size={20} strokeWidth={2} color="white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fyn-watermark-breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.005); }
        }
        @media (max-width: 767px) {
          footer { padding: 48px 24px !important; }
        }
        @media (min-width: 768px) and (max-width: 1199px) {
          footer { padding: 60px 40px !important; }
        }
        footer a:focus-visible, footer button:focus-visible {
          outline: 2px solid #C41E1E;
          outline-offset: 2px;
          border-radius: 4px;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
