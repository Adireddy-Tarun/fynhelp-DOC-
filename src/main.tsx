import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { initMobileApp } from "@/lib/capacitor";
import { initAnalytics } from "@/lib/analytics";
import { initMonitoring } from "@/lib/monitoring";
import { captureUtm } from "@/lib/utm";

import "./index.css";
import "./styles/typography.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource-variable/plus-jakarta-sans/index.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";

// Force light theme app-wide (dark mode toggle removed)
document.documentElement.classList.remove("dark");
document.documentElement.classList.add("light");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

initMobileApp();
captureUtm();
initAnalytics();
initMonitoring();


createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
