import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/typography.css";

// Force light theme app-wide (dark mode toggle removed)
document.documentElement.classList.remove("dark");
document.documentElement.classList.add("light");

createRoot(document.getElementById("root")!).render(<App />);
