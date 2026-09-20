import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";


function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="bg-[#f8f5ef]">

      {/* HERO */}
      <section className="bg-[#eee7da]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
              Velmora
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#173f35] break-words sm:mt-4 sm:text-5xl">
              {language === "ru"
                ? "Уют начинается с деталей"
                : "Shinamlik detallardan boshlanadi"}
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">
              {language === "ru"
                ? "Velmora предлагает практичный и эстетичный домашний текстиль для комфортной атмосферы в вашем доме."
                : "Velmora uyingizda qulay va shinam muhit yaratish uchun amaliy hamda estetik uy tekstili mahsulotlarini taklif qiladi."}
            </p>
          </div>


          <div className="min-h-[260px] rounded-3xl bg-gradient-to-br from-[#d6ccbc] via-[#f5efe5] to-[#a7b6aa] p-5 sm:min-h-[420px] sm:rounded-[40px] sm:p-8">

            <div className="flex h-full items-end">

              <div className="w-full max-w-sm rounded-2xl bg-white/85 p-4 shadow-sm backdrop-blur sm:rounded-[28px] sm:p-6">

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
                  Velmora Home
                </p>

                <p className="mt-2 text-xl font-semibold leading-snug text-[#173f35] sm:mt-3 sm:text-2xl">
                  {language === "ru"
                    ? "Красота и комфорт для вашего дома"
                    : "Uyingiz uchun go‘zallik va qulaylik"}
                </p>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* VALUES */}
      <section className="bg-[#fffdf8]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
              {language === "ru"
                ? "Наш подход"
                : "Bizning yondashuvimiz"}
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-4xl">
              {language === "ru"
                ? "Просто, удобно и красиво"
                : "Sodda, qulay va chiroyli"}
            </h2>

          </div>


          <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">

            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:rounded-[28px] sm:p-7">

              <h3 className="text-lg font-semibold text-[#173f35] sm:text-xl">
                {language === "ru"
                  ? "Комфорт"
                  : "Qulaylik"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">
                {language === "ru"
                  ? "Товары для повседневного комфортного использования."
                  : "Kundalik hayotda qulay foydalanishga mos mahsulotlar."}
              </p>

            </div>


            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:rounded-[28px] sm:p-7">

              <h3 className="text-lg font-semibold text-[#173f35] sm:text-xl">
                {language === "ru"
                  ? "Эстетика"
                  : "Estetika"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">
                {language === "ru"
                  ? "Спокойный дизайн, который легко вписывается в интерьер."
                  : "Interyerga oson mos tushadigan sokin va chiroyli dizayn."}
              </p>

            </div>


            <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:rounded-[28px] sm:p-7">

              <h3 className="text-lg font-semibold text-[#173f35] sm:text-xl">
                {language === "ru"
                  ? "Удобная покупка"
                  : "Qulay xarid"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">
                {language === "ru"
                  ? "Простой выбор товара, оформление заказа и доставка."
                  : "Mahsulot tanlash, buyurtma berish va yetkazib berish jarayoni sodda."}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* DELIVERY */}
      <section className="bg-[#173f35] text-white">

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8c9c0] sm:text-sm">
              {language === "ru"
                ? "Доставка"
                : "Yetkazib berish"}
            </p>

            <h2 className="mt-3 text-2xl font-semibold leading-tight sm:mt-4 sm:text-4xl">
              {language === "ru"
                ? "Бесплатная доставка по Ташкенту"
                : "Toshkent bo‘ylab bepul yetkazib berish"}
            </h2>

          </div>


          <div>

            <p className="leading-8 text-[#dce5e0]">
              {language === "ru"
                ? "На текущем этапе Velmora осуществляет доставку только в пределах города Ташкент. Стоимость доставки — 0 сум."
                : "Hozirgi bosqichda Velmora buyurtmalarni faqat Toshkent shahri hududida yetkazib beradi. Yetkazib berish narxi — 0 so‘m."}
            </p>

            <p className="mt-4 leading-8 text-[#dce5e0]">
              {language === "ru"
                ? "Оплата производится наличными при получении товара."
                : "To‘lov mahsulotni qabul qilganda naqd amalga oshiriladi."}
            </p>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section className="bg-[#fffdf8]">

        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-20">

          <h2 className="text-2xl font-semibold text-[#173f35] sm:text-4xl">
            {language === "ru"
              ? "Найдите товар для своего дома"
              : "Uyingiz uchun mos mahsulotni toping"}
          </h2>

          <Link
            to="/catalog"
            className="mt-6 inline-block w-full rounded-full bg-[#173f35] px-8 py-4 font-medium text-white transition hover:bg-[#245448] sm:mt-8 sm:w-auto"
          >
            {language === "ru"
              ? "Перейти в каталог"
              : "Katalogga o‘tish"}
          </Link>

        </div>

      </section>

    </div>
  );
}


export default AboutPage;