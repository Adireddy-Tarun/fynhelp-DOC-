import { useEffect, useState } from "react";
import { Lock, Clock } from "lucide-react";

/**
 * Small status chip indicating whether the current sign-in is persistent
 * (Remember me ON — survives browser close) or session-only (signed out
 * automatically when the browser is closed).
 *
 * Reads the same `fyn.sessionOnly` flag that AuthContext + SignInPage write.
 * Listens for cross-tab `storage` events so the indicator stays in sync if
 * the preference changes elsewhere (e.g. another tab signs in/out).
 */
const readSessionOnly = (): boolean => {
  try {
    return localStorage.getItem("fyn.sessionOnly") === "1";
  } catch {
    return false;
  }
};

const SessionPersistenceBadge = () => {
  const [sessionOnly, setSessionOnly] = useState<boolean>(readSessionOnly);

  useEffect(() => {
    const refresh = () => setSessionOnly(readSessionOnly());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "fyn.sessionOnly" || e.key === null) refresh();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const label = sessionOnly ? "Session only" : "Stays signed in";
  const tooltip = sessionOnly
    ? "You'll be signed out automatically when you close this browser. Tick “Remember me” at sign-in to stay logged in."
    : "“Remember me” is on — your session will persist after closing the browser.";
  const Icon = sessionOnly ? Clock : Lock;

  return (
    <span
      role="status"
      aria-label={`Session status: ${label}. ${tooltip}`}
      title={tooltip}
      className={`hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded fyn-metric border ${
        sessionOnly
          ? "bg-fyn-warning-bg text-fyn-warning border-fyn-warning/20"
          : "bg-fyn-success-bg text-fyn-success border-fyn-success/20"
      }`}
      style={{ fontSize: "var(--fyn-type-tiny)" }}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
};

export default SessionPersistenceBadge;
