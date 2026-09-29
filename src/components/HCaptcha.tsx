import HCaptchaLib from "@hcaptcha/react-hcaptcha";
import { forwardRef, useImperativeHandle, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark";
}

/** hCaptcha tokens are single use — call `resetCaptcha()` after every failed attempt. */
export type HCaptchaHandle = { resetCaptcha: () => void };

const HCaptcha = forwardRef<HCaptchaHandle, HCaptchaProps>(function HCaptcha(
  { onVerify, onExpire, onError, theme = "light" },
  ref,
) {
  const captchaRef = useRef<HCaptchaLib>(null);
  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      try { captchaRef.current?.resetCaptcha(); } catch { /* widget not mounted */ }
    },
  }));

  return (
    <div className="flex justify-center mt-2">
      <HCaptchaLib
        ref={captchaRef}
        sitekey={SITE_KEY}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
        theme={theme}
        size="normal"
      />
    </div>
  );
});

export default HCaptcha;

/** Map a sign-in failure to the message the user should see. */
export function signInFailureMessage(raw: string | undefined | null): string {
  const m = (raw ?? "").toLowerCase();
  if (m.includes("captcha")) return "The security check failed. Complete the check again and retry.";
  if (m.includes("too many") || m.includes("rate") || m.includes("locked") || m.includes("wait"))
    return "Too many attempts. Wait a minute and try again.";
  if (m.includes("invalid login") || m.includes("invalid credentials") || m.includes("invalid email or password"))
    return "Email or password is incorrect";
  return raw || "Could not sign in.";
}
