import {
  useEffect,
  useState,
} from "react";

import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";


function CatalogPage() {
  const { language } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  const [page, setPage] = useState(1);

  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // CATEGORIES
  // =========================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get(
          "/categories/",
          {
            params: {
              lang: language,
            },
          }
        );

        const data =
          response.data.results ??
          response.data;

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {
        console.error(
          "Categories load error:",
          err
        );
      }
    };


    loadCategories();

  }, [language]);


  // =========================
  // PRODUCTS
  // =========================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/products/",
          {
            params: {
              lang: language,

              search:
                search || undefined,

              category:
                category || undefined,

              min_price:
                minPrice || undefined,

              max_price:
                maxPrice || undefined,

              color:
                color || undefined,

              size:
                size || undefined,

              ordering:
                ordering || undefined,

              page,
            },
          }
        );


        const data = response.data;


        if (Array.isArray(data)) {
          setProducts(data);
          setCount(data.length);

          setNextPage(null);
          setPreviousPage(null);

        } else {
          setProducts(
            data.results ?? []
          );

          setCount(
            data.count ?? 0
          );

          setNextPage(
            data.next
          );

          setPreviousPage(
            data.previous
          );
        }

      } catch (err) {
        console.error(
          "Products load error:",
          err
        );

        setError(
          language === "ru"
            ? "Не удалось загрузить товары."
            : "Mahsulotlarni yuklashda xatolik yuz berdi."
        );

      } finally {
        setLoading(false);
      }
    };


    loadProducts();

  }, [
    language,
    search,
    category,
    minPrice,
    maxPrice,
    color,
    size,
    ordering,
    page,
  ]);


  // =========================
  // RESET FILTERS
  // =========================

  const resetFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setColor("");
    setSize("");
    setOrdering("-created_at");
    setPage(1);
  };


  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
            Velmora
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-[#173f35]">
            {language === "ru"
              ? "Каталог"
              : "Katalog"}
          </h1>

          <p className="mt-3 leading-7 text-stone-600">
            {language === "ru"
              ? "Выберите подходящий товар из коллекции Velmora."
              : "Velmora kolleksiyasidan o‘zingizga mos mahsulotni tanlang."}
          </p>
        </div>


        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* ========================= */}
          {/* FILTERS */}
          {/* ========================= */}

          <aside className="h-fit rounded-[28px] bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <h2 className="text-xl font-semibold text-[#173f35]">
                {language === "ru"
                  ? "Фильтры"
                  : "Filterlar"}
              </h2>

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-[#52796f] hover:underline"
              >
                {language === "ru"
                  ? "Сбросить"
                  : "Tozalash"}
              </button>

            </div>


            {/* SEARCH */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Поиск"
                  : "Qidirish"}
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder={
                  language === "ru"
                    ? "Название товара..."
                    : "Mahsulot nomi..."
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#173f35]"
              />

            </div>


            {/* CATEGORY */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Категория"
                  : "Kategoriya"}
              </label>

              <select
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target.value
                  );

                  setPage(1);
                }}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#173f35]"
              >
                <option value="">
                  {language === "ru"
                    ? "Все категории"
                    : "Barcha kategoriyalar"}
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.slug}
                    >
                      {item.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* MIN PRICE */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Цена от"
                  : "Minimal narx"}
              </label>

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="0"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#173f35]"
              />

            </div>


            {/* MAX PRICE */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Цена до"
                  : "Maksimal narx"}
              </label>

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="1000000"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#173f35]"
              />

            </div>


            {/* COLOR */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Цвет"
                  : "Rang"}
              </label>

              <input
                type="text"
                value={color}
                onChange={(event) => {
                  setColor(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder={
                  language === "ru"
                    ? "Например: beige"
                    : "Masalan: beige"
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#173f35]"
              />

            </div>


            {/* SIZE */}
            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Размер"
                  : "O‘lcham"}
              </label>

              <input
                type="text"
                value={size}
                onChange={(event) => {
                  setSize(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder={
                  language === "ru"
                    ? "Например: 200x220"
                    : "Masalan: 200x220"
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-[#173f35]"
              />

            </div>

          </aside>


          {/* ========================= */}
          {/* PRODUCTS */}
          {/* ========================= */}

          <section>

            {/* TOP BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              <p className="text-sm text-stone-500">
                {language === "ru"
                  ? `Найдено товаров: ${count}`
                  : `Topilgan mahsulotlar: ${count}`}
              </p>


              <select
                value={ordering}
                onChange={(event) => {
                  setOrdering(
                    event.target.value
                  );

                  setPage(1);
                }}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#173f35]"
              >
                <option value="-created_at">
                  {language === "ru"
                    ? "Сначала новые"
                    : "Avval yangilari"}
                </option>

                <option value="created_at">
                  {language === "ru"
                    ? "Сначала старые"
                    : "Avval eskilari"}
                </option>

                <option value="min_price">
                  {language === "ru"
                    ? "Цена: по возрастанию"
                    : "Narx: arzonidan"}
                </option>

                <option value="-min_price">
                  {language === "ru"
                    ? "Цена: по убыванию"
                    : "Narx: qimmatidan"}
                </option>

              </select>

            </div>


            {/* LOADING */}
            {loading && (
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-stone-500">
                  {language === "ru"
                    ? "Загрузка..."
                    : "Yuklanmoqda..."}
                </p>
              </div>
            )}


            {/* ERROR */}
            {!loading && error && (
              <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">
                {error}
              </div>
            )}


            {/* EMPTY */}
            {!loading &&
              !error &&
              products.length === 0 && (
                <div className="mt-8 rounded-[28px] bg-white p-10 text-center shadow-sm">

                  <h2 className="text-2xl font-semibold text-[#173f35]">
                    {language === "ru"
                      ? "Товары не найдены"
                      : "Mahsulot topilmadi"}
                  </h2>

                  <p className="mt-3 text-stone-500">
                    {language === "ru"
                      ? "Попробуйте изменить параметры фильтра."
                      : "Filter parametrlarini o‘zgartirib ko‘ring."}
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-full bg-[#173f35] px-6 py-3 font-medium text-white"
                  >
                    {language === "ru"
                      ? "Сбросить фильтры"
                      : "Filterlarni tozalash"}
                  </button>

                </div>
              )}


            {/* PRODUCT GRID */}
            {!loading &&
              !error &&
              products.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    )
                  )}

                </div>
              )}


            {/* PAGINATION */}
            {!loading &&
              products.length > 0 &&
              (previousPage ||
                nextPage) && (

                <div className="mt-10 flex items-center justify-center gap-4">

                  <button
                    type="button"
                    disabled={
                      !previousPage
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                      )
                    }
                    className="rounded-full border border-[#173f35] px-5 py-2.5 text-sm font-medium text-[#173f35] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    ←{" "}
                    {language === "ru"
                      ? "Назад"
                      : "Oldingi"}
                  </button>


                  <span className="text-sm font-medium text-stone-600">
                    {language === "ru"
                      ? `Страница ${page}`
                      : `${page}-sahifa`}
                  </span>


                  <button
                    type="button"
                    disabled={
                      !nextPage
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                    className="rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {language === "ru"
                      ? "Далее"
                      : "Keyingi"}{" "}
                    →
                  </button>

                </div>
              )}

          </section>

        </div>

      </div>

    </div>
  );
}


export default CatalogPage;