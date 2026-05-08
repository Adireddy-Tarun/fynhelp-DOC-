import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage
    const saved = localStorage.getItem("fynhelp-theme");
    if (saved === "light" || saved === "dark") return saved;

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }

    // Default to light (FYNHelp brand)
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes
    root.classList.remove("light", "dark");

    // Add current theme
    root.classList.add(theme);

    // Save preference
    localStorage.setItem("fynhelp-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return { theme, toggleTheme, setTheme };
}
