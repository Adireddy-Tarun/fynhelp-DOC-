import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Blocks access to /dashboard/* during the pre-launch period.
 * Redirects any dashboard navigation to the early-access waitlist.
 */
const DashboardGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      navigate("/early-access", { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default DashboardGuard;
