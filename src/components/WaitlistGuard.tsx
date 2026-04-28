import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Pre-launch guard: redirects /dashboard/*, /onboarding, /signin, /signup
 * to /early-access with a toast explaining why.
 */
const BLOCKED_PREFIXES = ["/dashboard", "/onboarding", "/signin", "/signup"];

const WaitlistGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (BLOCKED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
      toast({
        title: "Early access only",
        description: "Dashboard access is available to early access users only. Join the waitlist to get notified.",
      });
      navigate("/early-access", { replace: true });
    }
  }, [location.pathname, navigate, toast]);

  return <>{children}</>;
};

export default WaitlistGuard;
