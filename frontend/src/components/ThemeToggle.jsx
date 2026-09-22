import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

function ThemeToggle({ className = "", showLabel = false }) {
  const { toggleTheme, isDark } = useTheme();
  const { language } = useLanguage();

  const label = isDark
    ? language === "ru"
      ? "Светлая тема"
      : "Yorug‘ rejim"
    : language === "ru"
      ? "Темная тема"
      : "Qorong‘i rejim";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`group relative flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white p-2.5 text-[#3b2d24] shadow-xs transition-all hover:border-[#8a735e] hover:bg-[#faf7f2] dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4] dark:hover:border-[#c1a27c] dark:hover:bg-[#27221d] ${className}`}
    >
      <div className="relative flex h-5 w-5 items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-[#e5b378] transition-all" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-[#5e4b3c] transition-all" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide text-[#5e4b3c] dark:text-[#d4c8bc]">
          {isDark
            ? language === "ru"
              ? "Светлый"
              : "Yorug‘"
            : language === "ru"
              ? "Темный"
              : "Qorong‘i"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
