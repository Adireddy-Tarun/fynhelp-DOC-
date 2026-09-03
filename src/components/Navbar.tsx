import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Store,
  Briefcase,
  PlayCircle,
  FileSearch,
  GitCompareArrows,
  PenLine,
  Send,
  Rocket,
  ShoppingBag,
  Factory,
  ShieldCheck,
  LayoutDashboard,
  FileStack,
  MessageSquare,
  Tag,
} from "lucide-react";
import FynLogo from "@/components/FynLogo";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/adminEmails";

const NAV_HEIGHT = 76;

const CREAM = "#EFE8D8";
const CARD = "#FFFFFF";
const DARK = "#171208";
const RED = "#A93838";
const RED_TINT = "#A9383814";
const SOFT = "#F5EFE2";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const NAV_HEIGHT_PX = 76;

const CREAM2 = "#EFE8D8";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Notifications", href: "/notifications" },
  { label: "Alerts", href: "/alerts" },
  { label: "Settings", href: "/settings" },
];

const PRODUCT_MODULES = [
  { key: "extract", icon: FileSearch, label: "Extract", desc: "Documents to structured lines" },
  { key: "recon", icon: GitCompareArrows, label: "Recon", desc: "Bank matched to ledger" },
  { key: "narrate", icon: PenLine, label: "Narrate", desc: "Drafts with sources attached" },
  { key: "chaser", icon: Send, label: "Chaser", desc: "Polite follow-ups that send themselves" },
];

const CA_PRACTICE = [
  { icon: FileSearch, label: "Extract", desc: "Documents to structured lines" },
  { icon: GitCompareArrows, label: "Recon", desc: "Bank matched to ledger" },
  { icon: PenLine, label: "Narrate", desc: "Drafts with sources attached" },
  { icon: Send, label: "Chaser", desc: "Polite follow-ups that send themselves" },
];

const PRODUCT_USECASES = [
  { icon: Rocket, label: "Startups", desc: "Fast setup for growing teams" },
  { icon: ShoppingBag, label: "D2C", desc: "Track revenue and cash flow" },
  { icon: Factory, label: "Manufacturing", desc: "Monitor production costs" },
  { icon: ShieldCheck, label: "Compliance", desc: "GST and TDS tracking" },
];

const TOP_LINKS = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NAV_BAR_HEIGHT = 76;

const NAV_ITEMS_FALLBACK = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Notifications", href: "/notifications" },
  { label: "Alerts", href: "/alerts" },
  { label: "Settings", href: "/settings" },
];

const CREAM3 = "#EFE8D8";

const PRODUCT_MODULES_FALLBACK = [
  { key: "extract", icon: FileSearch, label: "Extract", desc: "Documents to structured lines" },
  { key: "recon", icon: GitCompareArrows, label: "Recon", desc: "Bank matched to ledger" },
  { key: "narrate", icon: PenLine, label: "Narrate", desc: "Drafts with sources attached" },
  { key: "chaser", icon: Send, label: "Chaser", desc: "Polite follow-ups that send themselves" },
];

const CREAM4 = "#EFE8D8";

const CA_PRACTICE_FALLBACK = [
  { icon: FileSearch, label: "Extract", desc: "Documents to structured lines" },
  { icon: GitCompareArrows, label: "Recon", desc: "Bank matched to ledger" },
  { icon: PenLine, label: "Narrate", desc: "Drafts with sources attached" },
  { icon: Send, label: "Chaser", desc: "Polite follow-ups that send themselves" },
];

const CA_PRACTICE_ITEMS = [
  { icon: FileSearch, label: "Extract", desc: "Documents to structured lines" },
  { icon: GitCompareArrows, label: "Recon", desc: "Bank matched to ledger" },
  { icon: PenLine, label: "Narrate", desc: "Drafts with sources attached" },
  { icon: Send, label: "Chaser", desc: "Polite follow-ups that send themselves" },
];

const TOP_LINKS_LIST = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function CA_PRACTICE_MENU() {
  return null;
}
