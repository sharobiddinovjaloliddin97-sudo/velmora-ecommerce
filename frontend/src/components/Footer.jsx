import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Banknote, Sparkles, Phone, Send } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function Footer() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#241b15] text-[#eee5d8]">
      {/* TRUST VALUES BANNER */}
      <div className="border-b border-[#3d2f24] bg-[#33271f]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#c1a27c]">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {language === "ru" ? "Доставка по Ташкенту 0 сум" : "Toshkent bo‘ylab 0 so‘m"}
              </h4>
              <p className="text-sm text-[#d1c3b2]">
                {language === "ru" ? "Быстро прямо до вашей двери" : "Eshikkacha tezkor va bepul yetkazish"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#c1a27c]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {language === "ru" ? "100% Натуральные ткани" : "100% Tabiiy matolar"}
              </h4>
              <p className="text-sm text-[#d1c3b2]">
                {language === "ru" ? "Собственное производство и пошив" : "O‘zimiz ishlab chiqaramiz va tikamiz"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#c1a27c]">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                {language === "ru" ? "Оплата при получении" : "Ko‘rib, qabul qilganda to‘lov"}
              </h4>
              <p className="text-sm text-[#d1c3b2]">
                {language === "ru" ? "Наличными после проверки товара" : "Tovarni tekshirib kuryerga to‘lash"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER LINKS */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:gap-14">
        {/* BRAND & LOGO */}
        <div>
          <Link to="/" className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white p-1 border border-[#dfd2c0]/80 shadow-sm flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Velmora Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-[0.16em] text-white">
                VELMORA
              </span>
              <span className="-mt-1 text-[11px] tracking-[0.28em] text-[#c1a27c] uppercase font-bold">
                Uy Tekstili
              </span>
            </div>
          </Link>

          <p className="mt-4 max-w-sm text-sm sm:text-base leading-relaxed text-[#d1c3b2]">
            {language === "ru"
              ? "Velmora — производство комплектов постельного белья, одеял, матрасов и наволочек из натуральных тканей для истинного уюта."
              : "Velmora — tabiiy va sifatli matolardan tayyorlangan choyshab to‘plamlari, ko‘rpalar, matraslar hamda yostiq jildlari ishlab chiqaruvchisi."}
          </p>
        </div>

        {/* NAVIGATION LINKS */}
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold tracking-wider text-white uppercase">
            {language === "ru" ? "Навигация" : "Bo‘limlar"}
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm sm:text-base text-[#d1c3b2]">
            <Link to="/" className="transition-colors hover:text-white">
              {language === "ru" ? "Главная" : "Bosh sahifa"}
            </Link>
            <Link to="/catalog" className="transition-colors hover:text-white">
              {language === "ru" ? "Каталог продукции" : "Mahsulotlar katalogi"}
            </Link>
            <Link to="/about" className="transition-colors hover:text-white">
              {language === "ru" ? "О бренде Velmora" : "Biz haqimizda"}
            </Link>
            <Link to="/contact" className="transition-colors hover:text-white">
              {language === "ru" ? "Контакты и заказ" : "Bog‘lanish"}
            </Link>
          </div>
        </div>

        {/* CONTACT & ORDER CHANNELS (NO PHYSICAL LOCATION) */}
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold tracking-wider text-white uppercase">
            {language === "ru" ? "Контакты и заказ" : "Bog‘lanish va buyurtma"}
          </h3>

          <div className="mt-4 space-y-3 text-sm sm:text-base text-[#d1c3b2]">
            <a
              href="tel:+998930791734"
              className="flex items-center gap-2.5 font-bold text-white hover:text-[#c1a27c] transition-colors"
            >
              <Phone className="h-4 w-4 text-[#c1a27c]" />
              <span>+998 93 079 17 34</span>
            </a>

            <a
              href="https://t.me/velmoramahsulotlari"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 font-bold text-[#54b3e8] hover:underline"
            >
              <Send className="h-4 w-4" />
              <span>t.me/velmoramahsulotlari</span>
            </a>

            <p className="text-xs sm:text-sm text-[#b5a391] pt-1">
              {language === "ru"
                ? "Формат: Только бесплатная курьерская доставка по Ташкенту"
                : "Xizmat: Do‘konsiz, Toshkent bo‘ylab to‘g‘ridan-to‘g‘ri bepul yetkazib berish"}
            </p>

            <p className="text-xs sm:text-sm text-[#b5a391]">
              {language === "ru"
                ? "Приём звонков: Ежедневно с 09:00 до 21:00"
                : "Qo‘ng‘iroqlar: Har kuni 09:00 dan 21:00 gacha"}
            </p>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-[#3d2f24]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs sm:text-sm text-[#a89887] sm:flex-row sm:px-6">
          <p>
            © {year} Velmora Home Textile.{" "}
            {language === "ru"
              ? "Все права защищены."
              : "Barcha huquqlar himoyalangan."}
          </p>

          <p className="text-xs text-[#8a7a6c]">
            Tabiiy matolar • Shinamlik va sifat
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;