import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    hcaptcha: {
      render: (el: HTMLElement, opts: object) => string;
      reset: (id: string) => void;
      getResponse: (id: string) => string;
      execute: (id: string, opts?: { async: boolean }) => Promise<string>;
      remove: (id: string) => void;
    };
    hcaptchaLoaded: boolean;
  }
}

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark";
}

export default function HCaptcha({ onVerify, onExpire, onError, theme = "light" }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.hcaptcha || widgetIdRef.current !== null) return;
    try {
      widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: onVerify,
        "expired-callback": onExpire,
        "error-callback": onError,
        theme,
        size: "normal",
      });
    } catch (e) {
      console.error("hCaptcha render error:", e);
    }
  }, [onVerify, onExpire, onError, theme]);

  useEffect(() => {
    if (window.hcaptcha) { renderWidget(); return; }
    const existing = document.getElementById("hcaptcha-script");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "hcaptcha-script";
      script.src = "https://js.hcaptcha.com/1/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.hcaptcha) { clearInterval(interval); renderWidget(); }
      }, 100);
    }
    return () => {
      if (widgetIdRef.current !== null && window.hcaptcha) {
        try { window.hcaptcha.remove(widgetIdRef.current); } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return <div ref={containerRef} className="flex justify-center mt-2" />;
}
