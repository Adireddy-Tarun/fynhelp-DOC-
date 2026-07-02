import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash,
    });
  }, [location.pathname, location.search]);
}
