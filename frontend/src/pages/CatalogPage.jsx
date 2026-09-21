import {
  useEffect,
  useState,
} from "react";
import {
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";

function CatalogPage() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Read initial values from URL query parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [color, setColor] = useState(searchParams.get("color") || "");
  const [size, setSize] = useState(searchParams.get("size") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "-created_at");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state when URL search params change
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchParams.get("search") || "");
      setCategory(searchParams.get("category") || "");
      setMinPrice(searchParams.get("min_price") || "");
      setMaxPrice(searchParams.get("max_price") || "");
      setColor(searchParams.get("color") || "");
      setSize(searchParams.get("size") || "");
      setOrdering(searchParams.get("ordering") || "-created_at");
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Load Categories once
  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories/", {
          params: { lang: language },
        });
        if (cancelled) return;
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setCategories(data);
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Load Products with filters
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          lang: language,
        };

        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (color.trim()) params.color = color.trim();
        if (size.trim()) params.size = size.trim();
        if (ordering) params.ordering = ordering;

        const response = await api.get("/products/", { params });
        if (cancelled) return;

        const data = response.data;
        if (Array.isArray(data)) {
          setProducts(data);
          setCount(data.length);
          setNextPage(null);
          setPreviousPage(null);
        } else {
          setProducts(data.results || []);
          setCount(data.count || 0);
          setNextPage(data.next);
          setPreviousPage(data.previous);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Products fetch error:", err);
          setError(
            language === "ru"
              ? "Не удалось загрузить товары. Пожалуйста, попробуйте снова."
              : "Mahsulotlarni yuklashda xatolik yuz berdi. Qaytadan urinib ko‘ring."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [page, search, category, minPrice, maxPrice, color, size, ordering, language]);

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setColor("");
    setSize("");
    setOrdering("-created_at");
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || category || minPrice || maxPrice || color || size
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-20 text-[#2d241e]">
      {/* ========================= */}
      {/* HERO / BREADCRUMB HEADER */}
      {/* ========================= */}
      <section className="border-b border-[#ebdcca] bg-gradient-to-b from-[#f5efe6] to-[#faf7f2] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d6c6b3] bg-white/90 px-3.5 py-1.5 backdrop-blur-xs shadow-xs mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[#8a735e]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#8a735e] uppercase">
                {language === "ru" ? "Коллекции текстиля" : "To‘qimachilik to‘plamlari"}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#3b2d24] sm:text-4xl lg:text-5xl">
              {language === "ru" ? "Каталог продукции" : "Mahsulotlar katalogi"}
            </h1>

            <p className="mt-2 text-base sm:text-lg leading-relaxed text-[#6b584a]">
              {language === "ru"
                ? "Комплекты постельного белья, одеяла, матрасы и наволочки из натуральных качественных тканей."
                : "Tabiiy matolardan tayyorlangan choyshab to‘plamlari, ko‘rpalar, matraslar hamda yostiq jildlari."}
            </p>
          </div>

          {/* TOP CATEGORY PILLS BAR */}
          <div className="mt-8 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setPage(1);
                setSearchParams((prev) => {
                  prev.delete("category");
                  return prev;
                });
              }}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wider transition-all ${
                category === ""
                  ? "bg-[#3b2d24] text-white shadow-sm"
                  : "border border-[#d6c6b3] bg-white text-[#5c4a3d] hover:border-[#8a735e] hover:text-[#8a735e]"
              }`}
            >
              {language === "ru" ? "Все товары" : "Barchasi"}
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.slug);
                  setPage(1);
                  setSearchParams((prev) => {
                    prev.set("category", cat.slug);
                    return prev;
                  });
                }}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wider transition-all ${
                  category === cat.slug
                    ? "bg-[#3b2d24] text-white shadow-sm"
                    : "border border-[#d6c6b3] bg-white text-[#5c4a3d] hover:border-[#8a735e] hover:text-[#8a735e]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= */}
      {/* MAIN CATALOG AREA */}
      {/* ========================= */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ========================= */}
          {/* SIDEBAR FILTERS (DESKTOP) */}
          {/* ========================= */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-3xl border border-[#ebdcca] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f4efe6] pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[#8a735e]" />
                  <h2 className="font-serif text-xl font-bold text-[#3b2d24]">
                    {language === "ru" ? "Фильтры" : "Filterlar"}
                  </h2>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs sm:text-sm font-bold text-rose-600 hover:underline"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>{language === "ru" ? "Сброс" : "Tozalash"}</span>
                  </button>
                )}
              </div>

              {/* SEARCH INPUT */}
              <div className="mt-5">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Поиск" : "Qidiruv"}
                </label>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder={
                      language === "ru" ? "Название товара..." : "Mahsulot nomi..."
                    }
                    className="w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 py-3 pr-9 pl-10 text-sm outline-none transition focus:border-[#3b2d24] focus:bg-white"
                  />
                  <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-[#8a735e]" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute top-3.5 right-3 text-stone-400 hover:text-stone-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* CATEGORY SELECTOR */}
              <div className="mt-6">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Категория" : "Kategoriya"}
                </label>
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setPage(1);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                      category === ""
                        ? "bg-[#8a735e]/15 font-bold text-[#3b2d24]"
                        : "text-[#5c4a3d] hover:bg-[#faf7f2]"
                    }`}
                  >
                    <span>{language === "ru" ? "Все категории" : "Barcha toifalar"}</span>
                    {category === "" && <Check className="h-4 w-4 text-[#8a735e]" />}
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.slug);
                        setPage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                        category === cat.slug
                          ? "bg-[#8a735e]/15 font-bold text-[#3b2d24]"
                          : "text-[#5c4a3d] hover:bg-[#faf7f2]"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {category === cat.slug && (
                        <Check className="h-4 w-4 text-[#8a735e]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE RANGE */}
              <div className="mt-6 border-t border-[#f4efe6] pt-5">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Цена (so‘m)" : "Narx oralig‘i (so‘m)"}
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder={language === "ru" ? "От" : "Dan"}
                    className="w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-2.5 text-sm outline-none focus:border-[#3b2d24] focus:bg-white"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder={language === "ru" ? "До" : "Gacha"}
                    className="w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-2.5 text-sm outline-none focus:border-[#3b2d24] focus:bg-white"
                  />
                </div>
              </div>

              {/* COLOR FILTER */}
              <div className="mt-5 border-t border-[#f4efe6] pt-5">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Цвет (Код)" : "Rang kodi"}
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setPage(1);
                  }}
                  placeholder="beige, white, krem..."
                  className="mt-2 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3 text-sm outline-none focus:border-[#3b2d24] focus:bg-white"
                />
              </div>

              {/* SIZE FILTER */}
              <div className="mt-5 border-t border-[#f4efe6] pt-5">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Размер" : "O‘lcham"}
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => {
                    setSize(e.target.value);
                    setPage(1);
                  }}
                  placeholder="200x220, 160x200, 50x70..."
                  className="mt-2 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3 text-sm outline-none focus:border-[#3b2d24] focus:bg-white"
                />
              </div>
            </div>
          </aside>

          {/* ========================= */}
          {/* MAIN PRODUCT GRID */}
          {/* ========================= */}
          <main className="lg:col-span-9">
            {/* TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ebdcca] bg-white px-5 py-3.5 shadow-xs">
              <div className="flex items-center gap-3">
                {/* MOBILE FILTER TOGGLE */}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d6c6b3] bg-[#faf7f2] px-4 py-2 text-xs sm:text-sm font-bold text-[#3b2d24] lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  <span>{language === "ru" ? "Фильтры" : "Filterlar"}</span>
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-[#8a735e]" />
                  )}
                </button>

                <p className="text-sm font-semibold text-[#5c4a3d]">
                  {language === "ru"
                    ? `Найдено: ${count} товаров`
                    : `Jami: ${count} ta mahsulot`}
                </p>
              </div>

              {/* SORT DROPDOWN */}
              <div className="flex items-center gap-2.5">
                <span className="hidden text-xs sm:text-sm text-[#7a6758] sm:inline">
                  {language === "ru" ? "Сортировка:" : "Saralash:"}
                </span>
                <div className="relative">
                  <select
                    value={ordering}
                    onChange={(e) => {
                      setOrdering(e.target.value);
                      setPage(1);
                    }}
                    className="cursor-pointer appearance-none rounded-full border border-[#d6c6b3] bg-[#faf7f2] py-2 pr-9 pl-4 text-xs sm:text-sm font-bold text-[#3b2d24] outline-none transition hover:bg-white focus:border-[#3b2d24]"
                  >
                    <option value="-created_at">
                      {language === "ru" ? "Сначала новые" : "Avval yangilari"}
                    </option>
                    <option value="created_at">
                      {language === "ru" ? "Сначала старые" : "Avval eskilari"}
                    </option>
                    <option value="min_price">
                      {language === "ru" ? "Цена: по возрастанию" : "Narx: arzonidan"}
                    </option>
                    <option value="-min_price">
                      {language === "ru" ? "Цена: по убыванию" : "Narx: qimmatidan"}
                    </option>
                  </select>
                  <ArrowUpDown className="pointer-events-none absolute top-3 right-3 h-3.5 w-3.5 text-[#8a735e]" />
                </div>
              </div>
            </div>

            {/* SKELETON LOADERS */}
            {loading && (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-3xl border border-[#ebdcca] bg-white p-4"
                  >
                    <div className="aspect-4/5 w-full rounded-2xl bg-[#f4efe6]" />
                    <div className="mt-4 space-y-2.5 p-2">
                      <div className="h-3 w-1/3 rounded bg-[#f4efe6]" />
                      <div className="h-5 w-3/4 rounded bg-[#f4efe6]" />
                      <div className="h-4 w-1/2 rounded bg-[#f4efe6]" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR VIEW */}
            {!loading && error && (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {/* EMPTY PRODUCTS VIEW */}
            {!loading && !error && products.length === 0 && (
              <div className="mt-6 rounded-3xl border border-[#ebdcca] bg-white p-12 text-center shadow-xs">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#faf7f2] text-[#8a735e] border border-[#d6c6b3]">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="mt-4 font-serif text-2xl font-bold text-[#3b2d24]">
                  {language === "ru" ? "Товары не найдены" : "Mahsulot topilmadi"}
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[#6b584a]">
                  {language === "ru"
                    ? "Попробуйте изменить параметры поиска или фильтров."
                    : "Filter parametrlarini yoki qidiruv so‘zini o‘zgartirib ko‘ring."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3b2d24] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#271f19]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{language === "ru" ? "Сбросить фильтры" : "Filterlarni tozalash"}</span>
                  </button>
                )}
              </div>
            )}

            {/* PRODUCTS GRID */}
            {!loading && !error && products.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {!loading && products.length > 0 && (previousPage || nextPage) && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={!previousPage}
                  onClick={() => setPage((curr) => Math.max(1, curr - 1))}
                  className="flex items-center gap-2 rounded-full border border-[#d6c6b3] bg-white px-5 py-2.5 text-sm font-semibold text-[#3b2d24] shadow-xs transition hover:border-[#3b2d24] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>{language === "ru" ? "Назад" : "Oldingi"}</span>
                </button>

                <span className="font-serif text-base font-bold text-[#3b2d24]">
                  {language === "ru" ? `Страница ${page}` : `${page}-sahifa`}
                </span>

                <button
                  type="button"
                  disabled={!nextPage}
                  onClick={() => setPage((curr) => curr + 1)}
                  className="flex items-center gap-2 rounded-full bg-[#3b2d24] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#271f19] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span>{language === "ru" ? "Вперед" : "Keyingi"}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================= */}
      {/* MOBILE FILTERS MODAL/DRAWER */}
      {/* ========================= */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs lg:hidden">
          <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl border-t border-[#ebdcca]">
            <div className="flex items-center justify-between border-b border-[#f4efe6] pb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-[#8a735e]" />
                <h3 className="font-serif text-xl font-bold text-[#3b2d24]">
                  {language === "ru" ? "Фильтры" : "Filterlar"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4efe6] text-[#3b2d24]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* SEARCH */}
              <div>
                <label className="text-sm font-bold text-[#3b2d24]">
                  {language === "ru" ? "Поиск" : "Qidiruv"}
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Mahsulot nomi..."
                  className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2] p-3 text-sm outline-none"
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="text-sm font-bold text-[#3b2d24]">
                  {language === "ru" ? "Цена (so‘m)" : "Narx oralig‘i (so‘m)"}
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Min"
                    className="rounded-xl border border-[#d6c6b3] bg-[#faf7f2] p-2.5 text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Max"
                    className="rounded-xl border border-[#d6c6b3] bg-[#faf7f2] p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#f4efe6]">
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setFiltersOpen(false);
                  }}
                  className="rounded-xl border border-[#d6c6b3] py-3 text-sm font-bold text-[#3b2d24]"
                >
                  {language === "ru" ? "Сбросить" : "Tozalash"}
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl bg-[#3b2d24] py-3 text-sm font-bold text-white shadow-xs"
                >
                  {language === "ru" ? "Применить" : "Qo‘llash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatalogPage;