import { Sparkles, MessageCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AIChatFloatingButton() {
  const { language } = useLanguage();

  const handleOpenChat = () => {
    window.dispatchEvent(
      new CustomEvent("velmora:open-ai-hub", { detail: { tab: "chat" } })
    );
  };

  return (
    <aside
      aria-label={language === "ru" ? "AI Консультант" : "AI Maslahatchi"}
      className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 animate-fade-in"
    >
      <button
        type="button"
        onClick={handleOpenChat}
        className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#3b2d24] via-[#5c4a3d] to-[#3b2d24] dark:from-[#c1a27c] dark:via-[#dfcaa9] dark:to-[#c1a27c] p-3 sm:px-4 sm:py-3 text-white dark:text-[#181411] shadow-2xl hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-[#c1a27c]/60 dark:border-[#382f27]"
      >
        {/* Pulsating glow */}
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#c1a27c] to-[#8a735e] opacity-40 blur-xs group-hover:opacity-80 transition duration-500 animate-pulse pointer-events-none" />

        <div className="relative flex h-6 w-6 items-center justify-center">
          <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <Sparkles className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-[#e5b378] dark:text-[#3b2d24] animate-spin [animation-duration:4s]" />
        </div>

        <div className="relative hidden sm:flex flex-col text-left leading-tight pr-1">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#c1a27c] dark:text-[#5c4a3d]">
            AI Assistant
          </span>
          <span className="text-xs font-bold">
            {language === "ru" ? "AI Консультант" : "AI Maslahatchi"}
          </span>
        </div>

        {/* Online badge */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </button>
    </aside>
  );
}
