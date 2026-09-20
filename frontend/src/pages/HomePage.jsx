import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/client";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";


function HomePage() {
  const { language } = useLanguage();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // FEATURED PRODUCTS
  // =========================

  useEffect(() => {
    const loadFeaturedProducts =
      async () => {

        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/products/",
              {
                params: {
                  featured: true,
                  lang: language,
                },
              }
            );


          const data =
            response.data.results ??
            response.data;


          setProducts(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (err) {
          console.error(
            "Featured products error:",
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


    loadFeaturedProducts();

  }, [language]);


  return (
    <div>

      {/* ========================= */}
      {/* HERO */}
      {/* ========================= */}

      <section className="bg-[#eee7da]">

        <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 md:gap-10 lg:min-h-[620px] lg:grid-cols-2">

          {/* LEFT */}
          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#52796f] sm:text-sm">
              Velmora Home
            </p>

            <h1 className="mt-3 max-w-xl text-3xl font-semibold leading-tight text-[#173f35] break-words sm:mt-5 sm:text-5xl md:text-6xl">

              {language === "ru"
                ? "Уют начинается с вашего дома"
                : "Qulaylik sizning uyingizdan boshlanadi"}

            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">

              {language === "ru"
                ? "Красивый и комфортный домашний текстиль для спокойной и уютной атмосферы."
                : "Sokin va shinam muhit uchun chiroyli hamda qulay uy tekstili."}

            </p>


            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">

              <Link
                to="/catalog"
                className="w-full rounded-full bg-[#173f35] px-6 py-3.5 text-center font-medium text-white transition hover:bg-[#245448] sm:w-auto sm:px-7 sm:py-4"
              >
                {language === "ru"
                  ? "Смотреть каталог"
                  : "Katalogni ko‘rish"}
              </Link>

              <Link
                to="/about"
                className="w-full rounded-full border border-[#173f35] px-6 py-3.5 text-center font-medium text-[#173f35] transition hover:bg-white sm:w-auto sm:px-7 sm:py-4"
              >
                {language === "ru"
                  ? "О бренде"
                  : "Biz haqimizda"}
              </Link>

            </div>

          </div>


          {/* RIGHT */}
          <div className="relative">

            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-gradient-to-br from-[#d9cfbd] via-[#f4eee3] to-[#a8b7aa] sm:aspect-[4/5] sm:rounded-[42px]">

              <div className="flex h-full items-end p-4 sm:p-8">

                <div className="w-full max-w-sm rounded-2xl bg-white/85 p-4 shadow-sm backdrop-blur sm:rounded-[28px] sm:p-6">

                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
                    Velmora
                  </p>

                  <p className="mt-2 text-xl font-semibold leading-snug text-[#173f35] sm:mt-3 sm:text-2xl">

                    {language === "ru"
                      ? "Комфорт в каждой детали"
                      : "Har bir detalda qulaylik"}

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ========================= */}
      {/* CATEGORIES */}
      {/* ========================= */}

      <section className="bg-[#fffdf8]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
                {language === "ru"
                  ? "Коллекции"
                  : "Kolleksiyalar"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-4xl">
                {language === "ru"
                  ? "Выберите для своего дома"
                  : "Uyingiz uchun tanlang"}
              </h2>

            </div>


            <Link
              to="/catalog"
              className="text-sm font-medium text-[#173f35] hover:underline sm:text-base"
            >
              {language === "ru"
                ? "Все товары →"
                : "Barcha mahsulotlar →"}
            </Link>

          </div>


          <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">

            {/* CATEGORY 1 */}
            <Link
              to="/catalog"
              className="group min-h-[220px] overflow-hidden rounded-2xl bg-[#e5ddd0] p-5 transition hover:-translate-y-1 sm:min-h-[280px] sm:rounded-[30px] sm:p-7"
            >

              <div className="flex h-full flex-col justify-end">

                <p className="text-sm text-stone-500">
                  Velmora
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#173f35]">
                  {language === "ru"
                    ? "Постельные комплекты"
                    : "Yotoq to‘plamlari"}
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {language === "ru"
                    ? "Комфорт для спокойного сна."
                    : "Sokin uyqu uchun qulaylik."}
                </p>

              </div>

            </Link>


            {/* CATEGORY 2 */}
            <Link
              to="/catalog"
              className="group min-h-[220px] overflow-hidden rounded-2xl bg-[#d5dfd7] p-5 transition hover:-translate-y-1 sm:min-h-[280px] sm:rounded-[30px] sm:p-7"
            >

              <div className="flex h-full flex-col justify-end">

                <p className="text-sm text-stone-500">
                  Velmora
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#173f35]">
                  {language === "ru"
                    ? "Одеяла"
                    : "Ko‘rpalar"}
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {language === "ru"
                    ? "Мягкость и тепло для вашего дома."
                    : "Uyingiz uchun yumshoqlik va iliqlik."}
                </p>

              </div>

            </Link>


            {/* CATEGORY 3 */}
            <Link
              to="/catalog"
              className="group min-h-[220px] overflow-hidden rounded-2xl bg-[#eee3d9] p-5 transition hover:-translate-y-1 sm:min-h-[280px] sm:rounded-[30px] sm:p-7"
            >

              <div className="flex h-full flex-col justify-end">

                <p className="text-sm text-stone-500">
                  Velmora
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-[#173f35]">
                  {language === "ru"
                    ? "Домашний текстиль"
                    : "Uy tekstili"}
                </h3>

                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {language === "ru"
                    ? "Детали, создающие уют."
                    : "Shinamlik yaratadigan detallar."}
                </p>

              </div>

            </Link>

          </div>

        </div>

      </section>


      {/* ========================= */}
      {/* FEATURED PRODUCTS */}
      {/* ========================= */}

      <section className="bg-[#f8f5ef]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">

          <div className="flex flex-wrap items-end justify-between gap-4">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
                {language === "ru"
                  ? "Velmora рекомендует"
                  : "Velmora tavsiya qiladi"}
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-4xl">
                {language === "ru"
                  ? "Избранные товары"
                  : "Tanlangan mahsulotlar"}
              </h2>

            </div>


            <Link
              to="/catalog"
              className="text-sm font-medium text-[#173f35] hover:underline sm:text-base"
            >
              {language === "ru"
                ? "Перейти в каталог →"
                : "Katalogga o‘tish →"}
            </Link>

          </div>


          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-stone-500">
                {language === "ru"
                  ? "Загрузка..."
                  : "Yuklanmoqda..."}
              </p>
            </div>
          )}


          {/* ERROR */}
          {!loading && error && (
            <div className="mt-10 rounded-2xl bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}


          {/* EMPTY */}
          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="mt-10 rounded-[30px] bg-white p-10 text-center shadow-sm">

                <h3 className="text-2xl font-semibold text-[#173f35]">
                  {language === "ru"
                    ? "Пока нет избранных товаров"
                    : "Hozircha tanlangan mahsulotlar yo‘q"}
                </h3>

                <p className="mt-3 text-stone-500">
                  {language === "ru"
                    ? "Отметьте товары как featured в панели администратора."
                    : "Admin panelda mahsulotlarni featured qilib belgilang."}
                </p>

              </div>
            )}


          {/* PRODUCTS */}
          {!loading &&
            !error &&
            products.length > 0 && (

              <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

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

        </div>

      </section>


      {/* ========================= */}
      {/* ABOUT */}
      {/* ========================= */}

      <section className="bg-[#173f35] text-white">

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-2">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b6c8bf] sm:text-sm">
              Velmora
            </p>

            <h2 className="mt-3 max-w-lg text-2xl font-semibold leading-tight sm:mt-4 sm:text-4xl">
              {language === "ru"
                ? "Создаём уют для вашего дома"
                : "Uyingiz uchun shinamlik yaratamiz"}
            </h2>

          </div>


          <div>

            <p className="max-w-xl leading-8 text-[#dce5e0]">
              {language === "ru"
                ? "Velmora предлагает практичный и эстетичный домашний текстиль для комфортного повседневного использования."
                : "Velmora kundalik hayotda qulay foydalanish uchun amaliy va estetik uy tekstili mahsulotlarini taklif qiladi."}
            </p>


            <Link
              to="/about"
              className="mt-6 inline-block w-full rounded-full bg-white px-7 py-3.5 text-center font-medium text-[#173f35] transition hover:bg-stone-100 sm:mt-7 sm:w-auto"
            >
              {language === "ru"
                ? "Подробнее"
                : "Batafsil"}
            </Link>

          </div>

        </div>

      </section>


      {/* ========================= */}
      {/* DELIVERY */}
      {/* ========================= */}

      <section className="bg-[#fffdf8]">

        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:gap-6 sm:px-6 sm:py-16 md:grid-cols-3">

          <div className="rounded-2xl border border-stone-200 p-5 sm:rounded-[26px] sm:p-6">

            <h3 className="text-base font-semibold text-[#173f35] sm:text-lg">
              {language === "ru"
                ? "Бесплатная доставка"
                : "Bepul yetkazib berish"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {language === "ru"
                ? "Доставка осуществляется по городу Ташкент."
                : "Yetkazib berish Toshkent shahri bo‘ylab amalga oshiriladi."}
            </p>

          </div>


          <div className="rounded-2xl border border-stone-200 p-5 sm:rounded-[26px] sm:p-6">

            <h3 className="text-base font-semibold text-[#173f35] sm:text-lg">
              {language === "ru"
                ? "Оплата при получении"
                : "Qabul qilganda to‘lov"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {language === "ru"
                ? "Оплатите заказ наличными после получения."
                : "Buyurtmani qabul qilganingizdan keyin naqd to‘laysiz."}
            </p>

          </div>


          <div className="rounded-2xl border border-stone-200 p-5 sm:rounded-[26px] sm:p-6">

            <h3 className="text-base font-semibold text-[#173f35] sm:text-lg">
              {language === "ru"
                ? "Удобный выбор"
                : "Qulay tanlov"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {language === "ru"
                ? "Выбирайте подходящий цвет, размер и вариант."
                : "O‘zingizga mos rang, o‘lcham va variantni tanlang."}
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}


export default HomePage;