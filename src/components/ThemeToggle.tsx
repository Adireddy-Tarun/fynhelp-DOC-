import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fyn-red focus:ring-offset-2"
      style={{
        background: theme === "dark" ? "hsl(24 53% 7% / 0.2)" : "hsl(0 73% 44% / 0.1)",
        border: theme === "dark" ? "1px solid hsl(40 52% 91% / 0.2)" : "1px solid hsl(0 73% 44% / 0.2)",
      }}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Sliding circle */}
      <div
        className="absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
        style={{
          left: theme === "dark" ? "calc(100% - 28px)" : "4px",
          top: "4px",
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #C41E1E 0%, #8B1515 100%)"
              : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        }}
      >
        {theme === "dark" ? (
          <Moon size={14} color="#FFF" strokeWidth={2.5} />
        ) : (
          <Sun size={14} color="#FFF" strokeWidth={2.5} />
        )}
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun
          size={14}
          className="transition-opacity duration-300"
          style={{
            opacity: theme === "light" ? 0.5 : 0.2,
            color: theme === "dark" ? "#F4EDDA" : "#1A1008",
          }}
          strokeWidth={2.5}
        />
        <Moon
          size={14}
          className="transition-opacity duration-300"
          style={{
            opacity: theme === "dark" ? 0.5 : 0.2,
            color: theme === "dark" ? "#F4EDDA" : "#1A1008",
          }}
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}
