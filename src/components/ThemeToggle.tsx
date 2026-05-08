import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative inline-flex items-center w-16 h-8 rounded-full border border-fyn-ink/20 bg-fyn-beige dark:bg-fyn-ink dark:border-fyn-beige/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-fyn-red/40"
    >
      {/* Background icons */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun size={14} className="text-fyn-gold" />
        <Moon size={14} className="text-fyn-beige" />
      </span>

      {/* Sliding circle */}
      <span
        className={`relative z-10 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-fyn-beige shadow-md transform transition-transform duration-300 ${
          isDark ? 'translate-x-9' : 'translate-x-1'
        }`}
      >
        {isDark ? (
          <Moon size={14} className="text-fyn-ink" />
        ) : (
          <Sun size={14} className="text-fyn-gold" />
        )}
      </span>
    </button>
  );
}
