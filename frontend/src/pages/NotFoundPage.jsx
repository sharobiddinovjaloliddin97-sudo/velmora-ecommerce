import { Link } from "react-router-dom";
import { Home, Compass, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function NotFoundPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-[80vh] bg-[#faf7f2] flex items-center justify-center px-4 py-16 relative overflow-hidden text-[#2d241e]">
      <div className="w-full max-w-xl text-center relative z-10">
        {/* Real Logo */}
        <div className="mx-auto w-20 h-20 rounded-3xl overflow-hidden bg-white p-1 border border-[#dfd2c0] shadow-xs flex items-center justify-center mb-6">
          <img
            src="/logo.png"
            alt="Velmora Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 404 Number */}
        <p className="font-serif text-8xl sm:text-9xl font-bold text-[#8a735e]/30 tracking-tight select-none">
          404
        </p>

        <h1 className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-[#3b2d24]">
          {language === "ru" ? "Страница не найдена" : "Sahifa topilmadi"}
        </h1>

        <p className="mt-3 text-[#6b584a] text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          {language === "ru"
            ? "Возможно, адрес страницы изменился или она была перемещена. Перейдите в каталог, чтобы продолжить покупки."
            : "Siz qidirayotgan sahifa ko‘chirilgan, o‘chirilgan yoki manzil noto‘g‘ri kiritilgan bo‘lishi mumkin."}
        </p>

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#3b2d24] text-white font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#271f19] hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>{language === "ru" ? "На главную" : "Bosh sahifaga"}</span>
          </Link>

          <Link
            to="/catalog"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full border border-[#d6c6b3] bg-white text-[#3b2d24] font-semibold text-base transition hover:bg-[#f4efe6]"
          >
            <Compass className="w-5 h-5 text-[#8a735e]" />
            <span>{language === "ru" ? "Открыть каталог" : "Katalogga o‘tish"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;