import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import WaitlistForm from "@/components/WaitlistForm";

const STORAGE_KEY = "fyn_waitlist_popup_dismissed";
const EXCLUDED_PREFIXES = ["/admin", "/dashboard", "/demo", "/ca", "/onboarding", "/reset-password"];

export default function WaitlistPopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);

  const excluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (excluded) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const openTimer = window.setTimeout(() => setOpen(true), 2000);
    return () => window.clearTimeout(openTimer);
  }, [excluded]);

  useEffect(() => {
    if (!open) return;
    setCanClose(false);
    const t = window.setTimeout(() => setCanClose(true), 3000);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => {
    if (!canClose) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, canClose]);

  if (excluded || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wl-popup-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-fyn-ink/70 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-fyn-beige-card border border-fyn-ink/10 rounded-2xl shadow-2xl animate-[scale-in_0.25s_ease-out]"
      >
        {canClose ? (
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-9 h-9 rounded-full bg-fyn-ink/5 hover:bg-fyn-ink/15 text-fyn-ink/70 hover:text-fyn-ink flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fyn-red"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span
            aria-hidden
            className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.15em] text-fyn-ink/40"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            • • •
          </span>
        )}

        <div className="px-5 pt-8 pb-3 md:px-10 md:pt-10 md:pb-4 text-center">
          <span
            className="inline-block text-[10px] uppercase tracking-[0.18em] text-fyn-red mb-3"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Limited early access
          </span>
          <h2
            id="wl-popup-title"
            className="text-fyn-ink leading-[1.1] text-[26px] md:text-[36px]"
            style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}
          >
            Be first in line when we launch
          </h2>
          <p className="mt-3 text-fyn-ink/65 text-sm md:text-base">
            First 100 users get FYNHelp <span className="text-fyn-red font-semibold">free for 6 months</span>.
          </p>
        </div>

        <div className="px-5 pb-7 md:px-10 md:pb-9">
          <WaitlistForm variant="detailed" theme="light" />
        </div>
      </div>
    </div>
  );
}
