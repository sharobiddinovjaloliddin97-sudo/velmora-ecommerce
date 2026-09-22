import {
  useEffect,
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  Feather,
  Gift,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";

function HomePage() {
  const { language } = useLanguage();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleOpenAiTab = (tab = "interior") => {
    window.dispatchEvent(
      new CustomEvent("velmora:open-ai-hub", { detail: { tab } })
    );
  };

  // =========================
  // LOAD HOME DATA
  // =========================
  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsRes, categoriesRes] = await Promise.allSettled([
          api.get("/products/", {
            params: {
              featured: true,
              lang: language,
            },
          }),
          api.get("/categories/", {
            params: {
              lang: language,
            },
          }),
        ]);

        if (cancelled) return;

        if (productsRes.status === "fulfilled") {
          const prodData = productsRes.value.data;
          setProducts(
            Array.isArray(prodData)
              ? prodData
              : prodData.results || []
          );
        }

        if (categoriesRes.status === "fulfilled") {
          const catData = categoriesRes.value.data;
          setCategories(
            Array.isArray(catData)
              ? catData
              : catData.results || []
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Home data load error:", err);
          setError(
            language === "ru"
              ? "Не удалось загрузить данные. Пожалуйста, обновите страницу."
              : "Ma’lumotlarni yuklab bo‘lmadi. Iltimos, sahifani yangilang."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, [language]);

  // Lead product for hero banner
  const heroProduct = products[0] || null;
  const heroImage =
    heroProduct?.images?.find((img) => img.is_primary)?.image ||
    heroProduct?.images?.[0]?.image ||
    null;

  return (
    <div className="space-y-16 pb-16 sm:space-y-24 sm:pb-24 text-[#2d241e] dark:text-[#ede4d8] transition-colors duration-300">
      {/* ========================= */}
      {/* 1. HERO SECTION */}
      {/* ========================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5efe6] via-[#faf7f2] to-[#faf7f2] dark:from-[#1c1713] dark:via-[#141210] dark:to-[#141210] pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-[#ebdcca] dark:border-[#2d241c]">
        {/* Subtle decorative background circle */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#8a735e]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-[#c1a27c]/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14">
          {/* LEFT CONTENT */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6c6b3] dark:border-[#383028] bg-white/90 dark:bg-[#1e1915]/90 px-4 py-2 backdrop-blur-xs shadow-xs">
              <Sparkles className="h-4 w-4 text-[#8a735e] dark:text-[#c4a98e]" />
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8a735e] dark:text-[#c4a98e] uppercase">
                {language === "ru" ? "Премиум текстиль для дома" : "Tabiiy va sifatli uy tekstili"}
              </span>
            </div>

            <h1 className="font-serif text-4xl font-bold leading-[1.18] tracking-tight text-[#3b2d24] dark:text-[#f3ede4] sm:text-5xl md:text-6xl lg:text-[64px]">
              {language === "ru" ? (
                <>
                  Уют начинается <br className="hidden sm:inline" />
                  <span className="italic font-normal text-[#8a735e] dark:text-[#c4a98e]">с вашего дома</span>
                </>
              ) : (
                <>
                  Qulaylik va shinamlik <br className="hidden sm:inline" />
                  <span className="italic font-normal text-[#8a735e] dark:text-[#c4a98e]">uyingizdan boshlanadi</span>
                </>
              )}
            </h1>

            <p className="max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-[#5c4a3d] dark:text-[#b8a99a] font-normal">
              {language === "ru"
                ? "Комплекты постельного белья, летние и зимние одеяла, матрасы и наволочки из 100% натуральных качественных тканей."
                : "Tabiiy va sifatli matolardan tayyorlangan choyshab to‘plamlari, yozgi va qishgi ko‘rpalar, matraslar hamda yostiq jildlari."}
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/catalog"
                className="group flex items-center justify-center gap-2 rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] px-8 py-4 text-base font-semibold tracking-wide text-white dark:text-[#1e1915] shadow-lg transition-all duration-300 hover:bg-[#271f19] dark:hover:bg-[#d6ba94] hover:shadow-xl"
              >
                <span>{language === "ru" ? "Смотреть каталог" : "Katalogni ko‘rish"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/about"
                className="flex items-center justify-center rounded-full border border-[#d6c6b3] dark:border-[#383028] bg-white dark:bg-[#1e1915] px-7 py-4 text-base font-semibold tracking-wide text-[#3b2d24] dark:text-[#ede4d8] transition hover:bg-[#f4efe6] dark:hover:bg-[#28211a]"
              >
                {language === "ru" ? "О бренде Velmora" : "Biz haqimizda"}
              </Link>
            </div>

            {/* HIGHLIGHT VALUES CHIPS */}
            <div className="grid grid-cols-3 gap-4 border-t border-[#ebdcca] dark:border-[#2d241c] pt-6">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">100%</p>
                <p className="text-xs sm:text-sm font-medium text-[#7a6758] dark:text-stone-400 mt-1">
                  {language === "ru" ? "Натуральный хлопок" : "Tabiiy paxta matolari"}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">0 so‘m</p>
                <p className="text-xs sm:text-sm font-medium text-[#7a6758] dark:text-stone-400 mt-1">
                  {language === "ru" ? "Доставка по Ташкенту" : "Toshkentda bepul yetkazish"}
                </p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">Naqd</p>
                <p className="text-xs sm:text-sm font-medium text-[#7a6758] dark:text-stone-400 mt-1">
                  {language === "ru" ? "Оплата при получении" : "Eshik oldida tekshirib to‘lov"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL CARD */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-[#f4efe6] dark:bg-[#1e1915] shadow-2xl sm:rounded-[36px]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={heroProduct?.name || "Velmora Textile"}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#261f1a] p-2 border border-[#dfd2c0] dark:border-[#383028] flex items-center justify-center mb-4">
                      <img src="/logo.png" alt="Velmora" className="w-full h-full object-contain" />
                    </div>
                    <p className="font-serif text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                      VELMORA
                    </p>
                    <p className="text-sm text-[#7a6758] dark:text-stone-400 mt-1">Home Textile Collection</p>
                  </div>
                )}

                {/* Floating bottom badge */}
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/60 dark:border-white/10 bg-white/95 dark:bg-[#1e1915]/95 p-4 shadow-lg backdrop-blur-md sm:bottom-6 sm:inset-x-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                        {language === "ru" ? "Выбор недели" : "Hafta tanlovi"}
                      </p>
                      <p className="truncate font-serif text-base font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                        {heroProduct ? heroProduct.name : "Velmora Premium Bedding"}
                      </p>
                    </div>

                    {heroProduct && (
                      <Link
                        to={`/products/${heroProduct.slug}`}
                        className="shrink-0 rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] px-4 py-2 text-xs sm:text-sm font-semibold text-white dark:text-[#1e1915] transition hover:bg-[#271f19] dark:hover:bg-[#d6ba94]"
                      >
                        {language === "ru" ? "Смотреть" : "Ko‘rish"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* AI INTERIOR CONSULTANT BANNER */}
      {/* ========================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[36px] border border-[#d8c8b4] dark:border-[#382f27] bg-gradient-to-br from-[#f5ede3] via-[#faf7f2] to-[#ebdcca] dark:from-[#1e1915] dark:via-[#191512] dark:to-[#26201a] p-6 sm:p-10 shadow-lg">
          {/* Decorative background glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#c1a27c]/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#8a735e]/15 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c1a27c]/40 bg-[#c1a27c]/15 px-3 py-1 text-xs font-bold text-[#8a735e] dark:text-[#e5b378]">
                <Sparkles className="h-3.5 w-3.5 text-[#c1a27c] animate-pulse" />
                <span>{language === "ru" ? "Инновация в Velmora" : "Velmora innovatsiyasi"}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#3b2d24] dark:text-[#f2e6d6]">
                {language === "ru"
                  ? "AI Интерьер-Консультант и Синтез Цветов"
                  : "AI Interyer Maslahatchisi va Ranglar Sintezi"}
              </h2>

              <p className="text-sm sm:text-base text-[#6b584a] dark:text-[#c4b6a8] max-w-2xl leading-relaxed">
                {language === "ru"
                  ? "Сомневаетесь, подойдёт ли комплект к обоям, шторам или мебели? Загрузите фото вашей комнаты — искусственный интеллект определит палитру, стиль и порекомендует идеальный текстиль с комментариями дизайнера."
                  : "Ushbu ko‘rpa-to‘shak xonangiz mebeli, devorlari yoki pardalariga mos kelarmikan deb o‘ylanyapsizmi? Yotoqxonangiz rasmini yuklang — AI ranglar va uslubni tahlil qilib, katalogimizdagi eng ideal to‘plamlarni tanlab beradi."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("velmora:open-ai-interior"))}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#3b2d24] via-[#5c4a3d] to-[#3b2d24] dark:from-[#c1a27c] dark:via-[#e5b378] dark:to-[#c1a27c] px-6 py-3.5 text-sm sm:text-base font-bold text-white dark:text-[#1c1917] shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span>{language === "ru" ? "Подобрать под мою комнату" : "Xonamga mosini AI bilan topish"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="https://t.me/velmora_silkbot"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-[#d8c8b4] dark:border-[#3d342c] bg-white/80 dark:bg-[#25201c] px-5 py-3.5 text-sm font-semibold text-[#5c4a3d] dark:text-[#c4b6a8] hover:bg-white dark:hover:bg-[#2d2621] transition"
                >
                  <span>{language === "ru" ? "В Telegram боте" : "Telegram botda sinash"}</span>
                </a>
              </div>
            </div>

            {/* Visual preview card on right */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div
                onClick={() => window.dispatchEvent(new CustomEvent("velmora:open-ai-interior"))}
                className="w-full max-w-xs rounded-2xl border border-[#ebdcca] dark:border-[#382f27] bg-white/90 dark:bg-[#211c18] p-4 shadow-md hover:scale-102 transition-transform cursor-pointer group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#ebdcca] dark:border-[#2e261f]">
                  <span className="text-xs font-bold text-[#8a735e] dark:text-[#c1a27c]">
                    {language === "ru" ? "Анализ стиля и цвета" : "Uslub va rang tahlili"}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="my-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Palitra:</span>
                    <div className="flex gap-1">
                      <span className="h-3 w-3 rounded-full bg-[#E5DEC9] border border-black/10" />
                      <span className="h-3 w-3 rounded-full bg-[#5C4A3D] border border-black/10" />
                      <span className="h-3 w-3 rounded-full bg-[#C1A27C] border border-black/10" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Uslub:</span>
                    <span className="font-semibold text-[#3b2d24] dark:text-[#e8ded4]">Skandinaviya</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Tavsiya:</span>
                    <span className="font-semibold text-[#8a735e] dark:text-[#e5b378]">3 ta to‘plam</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#faf7f2] dark:bg-[#191512] py-2 text-center text-xs font-bold text-[#8a735e] dark:text-[#c1a27c] group-hover:bg-[#8a735e] group-hover:text-white dark:group-hover:bg-[#c1a27c] dark:group-hover:text-[#1c1917] transition-colors">
                  {language === "ru" ? "Нажмите для анализа 📸" : "Rasm yuklash 📸"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* 2. CATEGORIES OVERVIEW */}
      {/* ========================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8a735e] dark:text-[#c4a98e] uppercase">
              {language === "ru" ? "Коллекции" : "To‘plamlarimiz"}
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#3b2d24] dark:text-[#f3ede4] sm:text-3xl lg:text-4xl">
              {language === "ru" ? "Категории домашнего текстиля" : "Uyingiz uchun asosiy toifalar"}
            </h2>
          </div>

          <Link
            to="/catalog"
            className="group flex items-center gap-1.5 text-base font-bold text-[#3b2d24] dark:text-[#ede4d8] hover:text-[#8a735e] dark:hover:text-[#c1a27c]"
          >
            <span>{language === "ru" ? "Весь каталог" : "Barcha toifalar"}</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* CATEGORIES GRID */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 ? (
            categories.slice(0, 3).map((cat, idx) => {
              const bgTones = [
                "from-[#f4efe6] to-[#eae0d1] dark:from-[#261f1a] dark:to-[#1a1512]",
                "from-[#ede6db] to-[#dfd3c2] dark:from-[#2a221d] dark:to-[#1e1814]",
                "from-[#f5eee4] to-[#e8ddcd] dark:from-[#271f1a] dark:to-[#191411]",
              ];
              return (
                <Link
                  key={cat.id || idx}
                  to={`/catalog?category=${cat.slug}`}
                  className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:min-h-[280px]"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      bgTones[idx % bgTones.length]
                    } opacity-90 transition-transform duration-500 group-hover:scale-105`}
                  />

                  <div className="relative z-10">
                    <span className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                      Velmora
                    </span>
                    <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[#6b584a] dark:text-[#b8a99a] leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-[#d8c8b4]/50 dark:border-[#383028] pt-4">
                    <span className="text-sm font-semibold text-[#3b2d24] dark:text-[#ede4d8]">
                      {language === "ru" ? "Перейти к товарам" : "Mahsulotlarni ko‘rish"}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-[#1e1915] text-[#3b2d24] dark:text-[#ede4d8] shadow-xs transition-transform group-hover:translate-x-1">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            // Curated Fallbacks
            <>
              <Link
                to="/catalog"
                className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#f4efe6] to-[#eae0d1] dark:from-[#261f1a] dark:to-[#1a1512] p-8 border border-[#ebdcca] dark:border-[#2d241c] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                    Velmora
                  </span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "Постельное бельё" : "Choyshab to‘plamlari"}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b584a] dark:text-[#b8a99a]">
                    {language === "ru" ? "Односпальные и двуспальные комплекты" : "1 va 2 kishilik tabiiy matoli to‘plamlar"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-[#3b2d24] dark:text-[#ede4d8]">
                  <span>{language === "ru" ? "Смотреть" : "Ko‘rish"}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>

              <Link
                to="/catalog"
                className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#ede6db] to-[#dfd3c2] dark:from-[#2a221d] dark:to-[#1e1814] p-8 border border-[#ebdcca] dark:border-[#2d241c] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                    Velmora
                  </span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "Одеяла и пледы" : "Yozgi va qishgi ko‘rpalar"}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b584a] dark:text-[#b8a99a]">
                    {language === "ru" ? "Легкость и тепло для спокойного сна" : "Yengillik, shinamlik va iliq harorat"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-[#3b2d24] dark:text-[#ede4d8]">
                  <span>{language === "ru" ? "Смотреть" : "Ko‘rish"}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>

              <Link
                to="/catalog"
                className="group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5eee4] to-[#e8ddcd] dark:from-[#271f1a] dark:to-[#191411] p-8 border border-[#ebdcca] dark:border-[#2d241c] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <span className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                    Velmora
                  </span>
                  <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "Матрасы и наволочки" : "Matraslar va yostiq jildlari"}
                  </h3>
                  <p className="mt-2 text-sm text-[#6b584a] dark:text-[#b8a99a]">
                    {language === "ru" ? "50×70, 70×70 наволочки и ортопедические матрасы" : "50×70 va 70×70 o‘lchamdagi jildlar va matraslar"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-[#3b2d24] dark:text-[#ede4d8]">
                  <span>{language === "ru" ? "Смотреть" : "Ko‘rish"}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ========================= */}
      {/* 2.5. VELMORA AI HUB (3-IN-1) BANNER */}
      {/* ========================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] border border-[#ebdcca] dark:border-[#382f27] bg-gradient-to-br from-[#faf7f2] via-[#f7f2ea] to-[#ebdcca]/50 dark:from-[#1b1612] dark:via-[#191512] dark:to-[#251f1a] p-6 sm:p-10 lg:p-12 shadow-xl">
          {/* Subtle gold glow effects */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#c1a27c]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#8a735e]/15 blur-3xl" />

          {/* SECTION HEADER */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c1a27c]/60 bg-white/80 dark:bg-[#251f1a]/80 px-3.5 py-1 text-xs font-bold text-[#8a735e] dark:text-[#e5b378] shadow-2xs backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#c1a27c] animate-pulse" />
                <span>{language === "ru" ? "Искусственный интеллект Velmora" : "Sun'iy Intellekt Texnologiyasi"}</span>
                <span className="rounded-full bg-[#c1a27c] px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                  3 in 1
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#3b2d24] dark:text-[#f3ede4]">
                {language === "ru"
                  ? "Velmora AI Hub — Умный подбор уюта для вашего дома"
                  : "Velmora AI Hub — Shinamlik uchun aqlli yordamchingiz"}
              </h2>

              <p className="text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] leading-relaxed">
                {language === "ru"
                  ? "Три мощных инструмента: визуальный анализ комнаты, персонализированный подбор подарка с открыткой и экспертный гид по тканям для здорового сна."
                  : "Interyeringizga mos ranglar, yaqinlaringiz uchun tabriknomali sovg‘a va sog‘lom uyqu uchun tabiiy matoni tanlashda sun'iy intellekt yordam beradi."}
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => handleOpenAiTab("interior")}
                className="inline-flex items-center gap-2 rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] px-6 py-3.5 text-xs sm:text-sm font-bold text-white dark:text-[#181411] hover:bg-[#5c4a3d] dark:hover:bg-[#d4b58e] transition shadow-md group cursor-pointer"
              >
                <span>{language === "ru" ? "Открыть AI Hub" : "AI Markazini ochish"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* 3 INTERACTIVE FEATURE CARDS */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* CARD 1: INTERIOR VISION */}
            <div
              onClick={() => handleOpenAiTab("interior")}
              className="group flex flex-col justify-between rounded-3xl border border-[#ebdcca] dark:border-[#382f27] bg-white/80 dark:bg-[#1f1915]/80 p-5 sm:p-6 hover:border-[#8a735e] dark:hover:border-[#c1a27c] hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#8a735e] to-[#c1a27c] text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                    Vision AI
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "1. Интерьер по фото" : "1. Interyer Maslahatchisi"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6b584a] dark:text-[#a69688] leading-relaxed">
                  {language === "ru"
                    ? "Загрузите фото спальни — AI определит стиль, освещение и палитру, подобрав гармоничный комплект."
                    : "Xonangiz rasmini yuklang — AI ranglar va yorug‘likni tahlil qilib, eng uyg‘un to‘plamlarni saralaydi."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ebdcca]/80 dark:border-[#2e261f] flex items-center justify-between text-xs font-bold text-[#8a735e] dark:text-[#e5b378]">
                <span>{language === "ru" ? "Анализ комнаты →" : "Xonani tahlil qilish →"}</span>
                <span className="rounded-full bg-[#8a735e]/15 px-2 py-0.5 text-[10px]">Foto</span>
              </div>
            </div>

            {/* CARD 2: GIFT FINDER */}
            <div
              onClick={() => handleOpenAiTab("gift")}
              className="group flex flex-col justify-between rounded-3xl border border-[#ebdcca] dark:border-[#382f27] bg-white/80 dark:bg-[#1f1915]/80 p-5 sm:p-6 hover:border-[#8a735e] dark:hover:border-[#c1a27c] hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#c1a27c] to-[#e5b378] text-[#181411] shadow-xs group-hover:scale-105 transition-transform">
                  <Gift className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                    Personalized AI
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "2. Подарок & Открытка" : "2. Sovg‘a & Tabriknoma"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6b584a] dark:text-[#a69688] leading-relaxed">
                  {language === "ru"
                    ? "Укажите получателя и повод — AI подберет премиум комплект и напишет персональную открытку в коробку."
                    : "Kim uchun va qanday sabab ekanini tanlang — AI to‘plam tanlaydi va qutiga solish uchun samimiy tabriknoma yozadi."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ebdcca]/80 dark:border-[#2e261f] flex items-center justify-between text-xs font-bold text-[#8a735e] dark:text-[#e5b378]">
                <span>{language === "ru" ? "Подобрать подарок →" : "Sovg‘a tanlash →"}</span>
                <span className="rounded-full bg-[#c1a27c]/20 px-2 py-0.5 text-[10px]">Open card</span>
              </div>
            </div>

            {/* CARD 3: FABRIC EXPERT */}
            <div
              onClick={() => handleOpenAiTab("fabric")}
              className="group flex flex-col justify-between rounded-3xl border border-[#ebdcca] dark:border-[#382f27] bg-white/80 dark:bg-[#1f1915]/80 p-5 sm:p-6 hover:border-[#8a735e] dark:hover:border-[#c1a27c] hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5c4a3d] to-[#8a735e] text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Feather className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                    Fabric Science
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                    {language === "ru" ? "3. Гид по тканям и сну" : "3. Mato va Uyqu Eksperti"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#6b584a] dark:text-[#a69688] leading-relaxed">
                  {language === "ru"
                    ? "Прохлада летом, чувствительная кожа или уход без глажки — узнайте свойства тканей и советы для здорового сна."
                    : "Yozgi salqinlik, nozik teri yoki dazmolsiz qulaylik — matolar sirlarini o‘rganing va sog‘lom uyquga erishing."}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#ebdcca]/80 dark:border-[#2e261f] flex items-center justify-between text-xs font-bold text-[#8a735e] dark:text-[#e5b378]">
                <span>{language === "ru" ? "Гид по материалам →" : "Mato gidini ko‘rish →"}</span>
                <span className="rounded-full bg-[#5c4a3d]/15 px-2 py-0.5 text-[10px]">Sleep care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* 3. FEATURED PRODUCTS */}
      {/* ========================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8a735e] dark:text-[#c4a98e] uppercase">
              <Sparkles className="h-4 w-4 text-[#c1a27c]" />
              <span>{language === "ru" ? "Рекомендуем" : "Velmora Tanlovi"}</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#3b2d24] dark:text-[#f3ede4] sm:text-3xl lg:text-4xl">
              {language === "ru" ? "Избранные изделия" : "Saralangan mahsulotlar"}
            </h2>
          </div>

          <Link
            to="/catalog"
            className="group flex items-center gap-1.5 text-base font-bold text-[#3b2d24] dark:text-[#ede4d8] hover:text-[#8a735e] dark:hover:text-[#c1a27c]"
          >
            <span>{language === "ru" ? "Вся коллекция" : "Barcha to‘plam"}</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* LOADING SKELETONS */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-4"
              >
                <div className="aspect-4/5 w-full rounded-2xl bg-[#f4efe6] dark:bg-[#261f1a]" />
                <div className="mt-4 space-y-2.5 p-2">
                  <div className="h-3 w-1/3 rounded bg-[#f4efe6] dark:bg-[#261f1a]" />
                  <div className="h-5 w-3/4 rounded bg-[#f4efe6] dark:bg-[#261f1a]" />
                  <div className="h-4 w-1/2 rounded bg-[#f4efe6] dark:bg-[#261f1a]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-6 text-center text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && products.length === 0 && (
          <div className="mt-8 rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-12 text-center">
            <h3 className="font-serif text-2xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
              {language === "ru" ? "Избранные товары пока не добавлены" : "Hozircha mahsulotlar kutilmoqda"}
            </h3>
            <p className="mt-2 text-base text-[#6b584a] dark:text-[#b8a99a]">
              {language === "ru"
                ? "В каталоге представлен полный ассортимент товаров."
                : "Katalogimizda barcha toifalar bilan tanishishingiz mumkin."}
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-block rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] px-8 py-3.5 text-sm font-semibold text-white dark:text-[#1e1915] transition hover:bg-[#271f19] dark:hover:bg-[#d6ba94]"
            >
              {language === "ru" ? "Перейти в каталог" : "Katalogga o‘tish"}
            </Link>
          </div>
        )}

        {/* PRODUCTS GRID */}
        {!loading && !error && products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ========================= */}
      {/* 4. BRAND PHILOSOPHY BANNER */}
      {/* ========================= */}
      <section className="relative overflow-hidden bg-[#241b15] py-16 text-[#eee5d8] sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-5 lg:col-span-7">
            <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#c1a27c] uppercase">
              {language === "ru" ? "Философия Velmora" : "Velmora falsafasi"}
            </span>

            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl text-white">
              {language === "ru"
                ? "Уют и качество в каждый дом — с любовью от Velmora"
                : "Har bir xonadonga shinamlik va oliy sifat olib kirish"}
            </h2>

            <p className="text-base sm:text-lg leading-relaxed text-[#d1c3b2]">
              {language === "ru"
                ? "Мы производим для наших клиентов комплекты постельного белья, летние и зимние одеяла, матрасы и наволочки из натуральных и качественных тканей. Каждое изделие отличается долговечностью, комфортом и безупречным стилем."
                : "Biz mijozlarimiz uchun tabiiy va sifatli matolardan tayyorlangan choyshab to‘plamlari, yozgi va qishgi ko‘rpalar, matraslar hamda yostiq jildlarini ishlab chiqaramiz. Har bir mahsulotimiz uzoq muddat xizmat qiladi."}
            </p>

            <div className="pt-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-[#c1a27c] px-8 py-4 text-sm font-bold tracking-wider text-stone-900 uppercase transition hover:bg-[#d8be98]"
              >
                <span>{language === "ru" ? "Узнать больше о нас" : "Biz haqimizda to‘liq"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#c1a27c]">100%</p>
              <h4 className="mt-2 text-base font-bold text-white">
                {language === "ru" ? "Эко-стандарт" : "Tabiiy matolar"}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-[#b5a391]">
                {language === "ru" ? "Безопасно для кожи и детей" : "Teri uchun qulay va xavfsiz"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <p className="font-serif text-3xl sm:text-4xl font-bold text-[#c1a27c]">0 UZS</p>
              <h4 className="mt-2 text-base font-bold text-white">
                {language === "ru" ? "Доставка" : "Yetkazib berish"}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-[#b5a391]">
                {language === "ru" ? "Бесплатно по Ташкенту" : "Toshkent bo‘ylab bepul"}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xs">
              <div className="flex items-center gap-3.5">
                <HeartHandshake className="h-8 w-8 text-[#c1a27c]" />
                <div>
                  <h4 className="text-base font-bold text-white">
                    {language === "ru" ? "Собственное производство" : "O‘zimiz ishlab chiqaramiz"}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#b5a391]">
                    {language === "ru" ? "Контроль качества каждого изделия" : "Har bir buyum qat’iy sifat nazoratidan o‘tadi"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* 5. SHOPPING BENEFITS (CARDS) */}
      {/* ========================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-4 rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-7 shadow-xs transition hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f4efe6] dark:bg-[#28211a] text-[#8a735e] dark:text-[#c4a98e]">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                {language === "ru" ? "Бесплатная доставка" : "Bepul yetkazib berish"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b584a] dark:text-[#b8a99a]">
                {language === "ru"
                  ? "Бесплатная курьерская доставка во все 12 районов города Ташкент прямо до вашей двери."
                  : "Toshkent shahrining barcha 12 ta tumaniga eshikkacha mutlaqo bepul yetkazamiz."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-7 shadow-xs transition hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f4efe6] dark:bg-[#28211a] text-[#8a735e] dark:text-[#c4a98e]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                {language === "ru" ? "Оплата при получении" : "Eshik oldida to‘lov"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b584a] dark:text-[#b8a99a]">
                {language === "ru"
                  ? "Никаких предоплат. Вы лично проверяете ткань и качество, затем оплачиваете курьеру."
                  : "Oldindan to‘lovsiz. To‘plamni ochib, tekshirib, kuryerga naqd to‘lov qilasiz."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-7 shadow-xs transition hover:shadow-md">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f4efe6] dark:bg-[#28211a] text-[#8a735e] dark:text-[#c4a98e]">
              <Feather className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                {language === "ru" ? "Натуральные ткани" : "Tabiiy va sifatli"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6b584a] dark:text-[#b8a99a]">
                {language === "ru"
                  ? "Дышащие, гипоаллергенные ткани высшего сорта, сохраняющие форму и цвет после стирок."
                  : "Nafas oluvchi, yuvishga chidamli va sog‘lom uyqu uchun 100% qulay tabiiy matolar."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;