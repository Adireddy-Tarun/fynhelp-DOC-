import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import ProductsDropdown from "./ProductsDropdown";
import ProductsMobilePanel, { type MobileIcon } from "./ProductsMobilePanel";
import ProductWidgetModal, { type ModalProduct } from "./ProductWidgetModal";
import {
  PRODUCT_ITEMS,
  PLATFORM_FEATURES,
  BUSINESS_TYPES,
} from "./productMeta";
import { FYN } from "./widgets/Shared";

interface Props {
  /** Render a mobile-only trigger row inside the mobile drawer */
  variant?: "desktop" | "mobile";
  /** Mobile drawer open state — used to render the floating icon panel only when relevant */
  mobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

/**
 * ProductsNav — orchestrates the Products dropdown trigger, dropdown UI,
 * mobile floating icon panel, and the per-product widget modal.
 */
export default function ProductsNav({
  variant = "desktop",
  mobileMenuOpen = false,
  onCloseMobileMenu,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ModalProduct | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openProduct = (p: ModalProduct) => {
    setOpen(false);
    onCloseMobileMenu?.();
    setActive(p);
  };

  const handleIntelligence = (id: string) => {
    const item = PRODUCT_ITEMS.find((p) => p.id === id);
    if (!item) return;
    openProduct({
      name: item.name,
      description: item.longDescription,
      widget: item.widget,
      href: item.href,
      status: item.status,
    });
  };

  const handleBusiness = (idx: number) => {
    const b = BUSINESS_TYPES[idx];
    if (!b) return;
    openProduct({
      name: `${b.name} — Built for you`,
      description: `See how FYNHelp tailors financial intelligence for ${b.name.toLowerCase()} businesses.`,
      widget: b.widget,
      href: "/dashboard/cockpit",
      status: "live",
    });
  };

  const handlePlatform = (id: string) => {
    const f = PLATFORM_FEATURES.find((x) => x.id === id);
    if (!f) return;
    openProduct({
      name: f.name,
      description: f.longDescription,
      widget: f.widget,
      href: f.href,
      status: f.status,
    });
  };

  const intelligenceItems = PRODUCT_ITEMS.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
  }));
  const platformItems = PLATFORM_FEATURES.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    status: f.status,
  }));

  // Build mobile icon set (Intelligence Suites first, then platform features)
  const mobileIcons: MobileIcon[] = [
    ...PRODUCT_ITEMS.map((p) => ({
      id: p.id,
      name: p.shortLabel,
      Icon: p.Icon,
      status: p.status,
      onClick: () => handleIntelligence(p.id),
    })),
  ];

  if (variant === "mobile") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between text-white/80 hover:text-white text-base font-medium py-3 border-b border-white/5"
          aria-expanded={open}
        >
          <span>Products</span>
          <ChevronDown
            size={18}
            style={{
              transition: "transform 0.3s",
              transform: open ? "rotate(180deg)" : "rotate(0)",
            }}
          />
        </button>
        <ProductsMobilePanel open={mobileMenuOpen && open} icons={mobileIcons} />
        <ProductWidgetModal product={active} onClose={() => setActive(null)} />
      </>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="fyn-products-trigger nav-link-underline text-sm font-medium py-6 inline-flex items-center gap-1"
        style={{
          color: open ? FYN.red : undefined,
          fontFamily: "'Raleway', sans-serif",
          fontWeight: 600,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        Products
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.3s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      <ProductsDropdown
        open={open}
        intelligenceItems={intelligenceItems}
        businessItems={BUSINESS_TYPES.map((b) => ({ name: b.name, status: b.status }))}
        platformItems={platformItems}
        onSelectIntelligence={handleIntelligence}
        onSelectBusiness={handleBusiness}
        onSelectPlatform={handlePlatform}
        onClose={() => setOpen(false)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      />

      <ProductWidgetModal product={active} onClose={() => setActive(null)} />
    </div>
  );
}
