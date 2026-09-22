import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Truck,
  Phone,
  Send,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sun,
  Snowflake,
  BedDouble,
  Smile,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function AboutPage() {
  const { language } = useLanguage();

  const productsList = [
    {
      icon: BedDouble,
      title:
        language === "ru"
          ? "Комплекты постельного белья"
          : "Choyshab to‘plamlari",
      desc:
        language === "ru"
          ? "Односпальные и двуспальные комплекты из высококачественных натуральных тканей"
          : "Bir kishilik va ikki kishilik tabiiy sifatli matolardan tikilgan to‘plamlar",
      badge: language === "ru" ? "1 va 2 kishilik" : "1 va 2 kishilik",
    },
    {
      icon: Sun,
      title:
        language === "ru"
          ? "Летние комплекты одеял"
          : "Yozgi ko‘rpa to‘plamlari",
      desc:
        language === "ru"
          ? "Легкие, дышащие и приятные к телу одеяла для комфортного сна в теплое время года"
          : "Yoz faslida qulay orom olish uchun engil, havo o‘tkazuvchan va shinam ko‘rpalar",
      badge: language === "ru" ? "Летняя серия" : "Yozgi mavsum",
    },
    {
      icon: Snowflake,
      title:
        language === "ru"
          ? "Зимние комплекты одеял"
          : "Qishgi ko‘rpa to‘plamlari",
      desc:
        language === "ru"
          ? "Мягкие, теплые и долговечные комплекты, дарящие уют и тепло в холодные ночи"
          : "Sovuq kunlarda iliq harorat va quchoq ochuvchi shinamlik beruvchi issiq to‘plamlar",
      badge: language === "ru" ? "Зимняя серия" : "Qishgi mavsum",
    },
    {
      icon: Layers,
      title:
        language === "ru"
          ? "Матрасы одно- и двуспальные"
          : "Bir va ikki kishilik matraslar",
      desc:
        language === "ru"
          ? "Ортопедическая поддержка позвоночника, надежные наполнители и долгий срок службы"
          : "Qulay qomat tayanchi, yuqori sifatli to‘ldiruvchilar va uzoq yillik xizmat muddati",
      badge: language === "ru" ? "Анатомические" : "Ortopedik",
    },
    {
      icon: Smile,
      title:
        language === "ru"
          ? "Наволочки для подушек"
          : "Yostiq jildlari (50×70 va 70×70)",
      desc:
        language === "ru"
          ? "Стандартные размеры 50×70 и 70×70 см из прочной ткани, сохраняющей форму после стирок"
          : "50×70 va 70×70 o‘lchamdagi yuvishga chidamli va shaklini yo‘qotmaydigan jildlar",
      badge: "50×70 • 70×70",
    },
  ];

  return (
    <div className="bg-[#faf7f2] dark:bg-[#141210] min-h-screen text-[#2d241e] dark:text-[#ede4d8] transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#ebdcca] dark:border-[#2d241c]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Story */}
            <div className="lg:col-span-7">
              {/* Brand Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#f4efe6] dark:bg-[#241e19] border border-[#dfd2c0] dark:border-[#383028] text-[#8a735e] dark:text-[#d1bfa9] text-sm font-semibold tracking-wider uppercase mb-6">
                <Sparkles className="w-4 h-4 text-[#8a735e] dark:text-[#d1bfa9]" />
                <span>Velmora Home Textile</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3b2d24] dark:text-[#f3ede4] leading-[1.2] tracking-tight">
                {language === "ru" ? (
                  <>
                    Уют и качество в{" "}
                    <span className="italic font-normal text-[#8a735e] dark:text-[#c4a98e]">каждый дом</span>
                  </>
                ) : (
                  <>
                    Har bir xonadonga{" "}
                    <span className="italic font-normal text-[#8a735e] dark:text-[#c4a98e]">shinamlik va sifat</span>
                  </>
                )}
              </h1>

              {/* Main text as specified by user */}
              <div className="mt-6 space-y-4 text-[#4a3b32] dark:text-[#cfc2b4] text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                <p>
                  {language === "ru"
                    ? "Velmora — мы производим для наших клиентов комплекты постельного белья, летние и зимние одеяла, матрасы, а также наволочки из натуральных и качественных тканей."
                    : "Velmora — Biz mijozlarimiz uchun tabiiy va sifatli matolardan tayyorlangan choyshab to‘plamlari, yozgi va qishgi ko‘rpa to‘plamlari, matraslar hamda yostiq jildlarini ishlab chiqaramiz."}
                </p>
                <p>
                  {language === "ru"
                    ? "Каждое наше изделие отличается исключительной прочностью, комфортом и долгим сроком службы. Velmora ставит своей целью принести настоящий уют и безупречное качество в каждый дом."
                    : "Har bir mahsulotimiz mustahkamligi, qulayligi va uzoq muddat xizmat qilishi bilan ajralib turadi. Velmora har bir xonadonga shinamlik va sifat olib kirishni o‘z oldiga maqsad qilgan."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] text-white dark:text-[#1e1915] font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#271f19] dark:hover:bg-[#d6ba94] hover:shadow-lg"
                >
                  <span>{language === "ru" ? "Смотреть каталог" : "Mahsulotlar katalogi"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://t.me/velmoramahsulotlari"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full border border-[#d6c6b3] dark:border-[#3d3228] bg-white dark:bg-[#1e1915] text-[#3b2d24] dark:text-[#ede4d8] font-medium text-base transition hover:bg-[#f4efe6] dark:hover:bg-[#29221c]"
                >
                  <Send className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
                  <span>Telegram: @velmoramahsulotlari</span>
                </a>
              </div>
            </div>

            {/* Right Column: Luxury Card with Real Logo */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl bg-white dark:bg-[#1e1915] p-8 sm:p-10 text-center shadow-[0_15px_45px_-15px_rgba(59,45,36,0.1)] dark:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.5)] border border-[#ebdcca] dark:border-[#2d241c]">
                  {/* Real Logo */}
                  <div className="mx-auto w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white dark:bg-[#221c17] p-3 flex items-center justify-center border border-[#dfd2c0] dark:border-[#383028] shadow-inner mb-6">
                    <img
                      src="/logo.png"
                      alt="Velmora Logo"
                      className="w-full h-full object-contain dark:brightness-125"
                    />
                  </div>

                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
                    VELMORA ATELIER
                  </p>

                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "Собственное производство" : "O‘zimiz ishlab chiqaramiz"}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] leading-relaxed">
                    {language === "ru"
                      ? "100% натуральные экологически чистые ткани, строгий контроль качества и забота о вашем глубоком сне."
                      : "100% tabiiy va ekologik toza matolar, qat’iy sifat nazorati hamda sog‘lom uyqungiz garovi."}
                  </p>

                  <div className="mt-6 pt-6 border-t border-[#ebdcca] dark:border-[#2d241c] flex items-center justify-center gap-6 text-xs sm:text-sm text-[#8a735e] dark:text-[#c4a98e] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
                      <span>{language === "ru" ? "100% Гарантия" : "100% Kafolat"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
                      <span>{language === "ru" ? "Бесплатная доставка" : "Bepul yetkazish"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAHSULOTLARIMIZ (PRODUCTS GRID) */}
      <section className="py-16 sm:py-24 bg-[#f4efe6]/50 dark:bg-[#181411]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-center mx-auto mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
              {language === "ru" ? "НАШ АССОРТИМЕНТ" : "MAHSULOTLARIMIZ"}
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
              {language === "ru"
                ? "Всё для идеального отдыха и уюта"
                : "Uyingiz uchun sifatli va qulay to‘plamlar"}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#6b584a] dark:text-[#b8a99a]">
              {language === "ru"
                ? "Мы создаем продукцию, которая дарит мягкость, комфорт и долгие годы безупречной службы"
                : "Biz uzoq yillar xizmat qiladigan, tanaga yoqimli va xonadonga ko‘rk bag‘ishlovchi mahsulotlarni taqdim etamiz"}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {productsList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1e1915] rounded-3xl p-7 sm:p-8 border border-[#ebdcca] dark:border-[#2d241c] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#faf7f2] dark:bg-[#261f1a] text-[#8a735e] dark:text-[#c4a98e] border border-[#dfd2c0]/60 dark:border-[#383028] flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f4efe6] dark:bg-[#261f1a] text-[#8a735e] dark:text-[#c4a98e] border border-[#dfd2c0]/60 dark:border-[#383028]">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8a735e] dark:text-[#c4a98e]">
                    <CheckCircle2 className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
                    <span>{language === "ru" ? "Премиум качество" : "Oliy toifali sifat"}</span>
                  </div>
                </div>
              );
            })}

            {/* Special Delivery Only Card */}
            <div className="bg-[#3b2d24] dark:bg-[#292019] text-white rounded-3xl p-7 sm:p-8 shadow-xl border border-white/5 dark:border-[#3d3025] flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-[#c1a27c] flex items-center justify-center mb-5">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  {language === "ru"
                    ? "Только доставка по городу"
                    : "Faqat yetkazib berish xizmati"}
                </h3>
                <p className="mt-3 text-sm sm:text-base text-stone-200 dark:text-stone-300 leading-relaxed font-light">
                  {language === "ru"
                    ? "Мы работаем исключительно в формате онлайн-заказа с быстрой курьерской доставкой. Стоимость доставки по Ташкенту — 0 сум!"
                    : "Biz do‘konga borish ovoragarchiligisiz, to‘g‘ridan-to‘g‘ri uyingizgacha bepul yetkazib beramiz. Toshkent bo‘ylab yetkazish narxi — 0 so‘m!"}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-[#c1a27c] font-semibold">
                <span>{language === "ru" ? "Оплата при получении" : "Ko‘rib, naqd to‘lov qilish"}</span>
                <span>0 UZS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECT CONTACT & TELEGRAM BANNER */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#141210] border-t border-[#ebdcca] dark:border-[#2d241c]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
            {language === "ru" ? "СВЯЖИТЕСЬ С НАМИ" : "BIZ BILAN BOG‘LANING"}
          </p>

          <h2 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
            {language === "ru"
              ? "Остались вопросы или хотите сделать заказ?"
              : "Savollaringiz bormi yoki buyurtma bermoqchimisiz?"}
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#6b584a] dark:text-[#b8a99a] max-w-xl mx-auto">
            {language === "ru"
              ? "Напишите нам в Telegram или позвоните по телефону. Мы с радостью подберём идеальный комплект для вашей спальни."
              : "Telegram orqali yozing yoki qo‘ng‘iroq qiling. Xodimlaringiz sizga mos o‘lcham va matoni tanlashda ko‘maklashadi."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {/* Telegram Button */}
            <a
              href="https://t.me/velmoramahsulotlari"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#3b2d24] dark:bg-[#261f1a] text-white dark:text-[#f2e6d6] border border-[#524134] dark:border-[#3d3228] font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:bg-[#271f19] dark:hover:bg-[#322923] hover:shadow-lg"
            >
              <Send className="w-5 h-5 text-[#c1a27c]" />
              <span>t.me/velmoramahsulotlari</span>
            </a>

            {/* Primary Phone */}
            <a
              href="tel:+998911652211"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#3b2d24] dark:bg-[#261f1a] text-white dark:text-[#f2e6d6] border border-[#524134] dark:border-[#3d3228] font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:bg-[#271f19] dark:hover:bg-[#322923] hover:shadow-lg"
            >
              <Phone className="w-5 h-5 text-[#c1a27c]" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] uppercase tracking-wider text-[#c1a27c] font-bold">{language === "ru" ? "Основной" : "Asosiy"}</span>
                <span>+998 91 165 22 11</span>
              </div>
            </a>

            {/* Secondary Phone */}
            <a
              href="tel:+998930791734"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#3b2d24] dark:bg-[#261f1a] text-white dark:text-[#f2e6d6] border border-[#524134] dark:border-[#3d3228] font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:bg-[#271f19] dark:hover:bg-[#322923] hover:shadow-lg"
            >
              <Phone className="w-5 h-5 text-[#c1a27c]" />
              <div className="text-left leading-tight">
                <span className="block text-[11px] uppercase tracking-wider text-[#b3a191] font-medium">{language === "ru" ? "Дополнительный" : "Qo‘shimcha"}</span>
                <span>+998 93 079 17 34</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;