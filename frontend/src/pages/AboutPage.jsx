import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";


function AboutPage() {
  const { language } = useLanguage();

  return (
    <div className="bg-[#f8f5ef]">

      {/* HERO */}
      <section className="bg-[#eee7da]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
              Velmora
            </p>

            <h1 className="mt-4 text-5xl font-semibold leading-tight text-[#173f35]">
              {language === "ru"
                ? "Уют начинается с деталей"
                : "Shinamlik detallardan boshlanadi"}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
              {language === "ru"
                ? "Velmora предлагает практичный и эстетичный домашний текстиль для комфортной атмосферы в вашем доме."
                : "Velmora uyingizda qulay va shinam muhit yaratish uchun amaliy hamda estetik uy tekstili mahsulotlarini taklif qiladi."}
            </p>
          </div>


          <div className="min-h-[420px] rounded-[40px] bg-gradient-to-br from-[#d6ccbc] via-[#f5efe5] to-[#a7b6aa] p-8">

            <div className="flex h-full items-end">

              <div className="max-w-sm rounded-[28px] bg-white/80 p-6 backdrop-blur">

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
                  Velmora Home
                </p>

                <p className="mt-3 text-2xl font-semibold leading-snug text-[#173f35]">
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

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
              {language === "ru"
                ? "Наш подход"
                : "Bizning yondashuvimiz"}
            </p>

            <h2 className="mt-3 text-4xl font-semibold text-[#173f35]">
              {language === "ru"
                ? "Просто, удобно и красиво"
                : "Sodda, qulay va chiroyli"}
            </h2>

          </div>


          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <div className="rounded-[28px] border border-stone-200 bg-white p-7">

              <h3 className="text-xl font-semibold text-[#173f35]">
                {language === "ru"
                  ? "Комфорт"
                  : "Qulaylik"}
              </h3>

              <p className="mt-3 leading-7 text-stone-600">
                {language === "ru"
                  ? "Товары для повседневного комфортного использования."
                  : "Kundalik hayotda qulay foydalanishga mos mahsulotlar."}
              </p>

            </div>


            <div className="rounded-[28px] border border-stone-200 bg-white p-7">

              <h3 className="text-xl font-semibold text-[#173f35]">
                {language === "ru"
                  ? "Эстетика"
                  : "Estetika"}
              </h3>

              <p className="mt-3 leading-7 text-stone-600">
                {language === "ru"
                  ? "Спокойный дизайн, который легко вписывается в интерьер."
                  : "Interyerga oson mos tushadigan sokin va chiroyli dizayn."}
              </p>

            </div>


            <div className="rounded-[28px] border border-stone-200 bg-white p-7">

              <h3 className="text-xl font-semibold text-[#173f35]">
                {language === "ru"
                  ? "Удобная покупка"
                  : "Qulay xarid"}
              </h3>

              <p className="mt-3 leading-7 text-stone-600">
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

        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b8c9c0]">
              {language === "ru"
                ? "Доставка"
                : "Yetkazib berish"}
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight">
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

        <div className="mx-auto max-w-7xl px-6 py-20 text-center">

          <h2 className="text-4xl font-semibold text-[#173f35]">
            {language === "ru"
              ? "Найдите товар для своего дома"
              : "Uyingiz uchun mos mahsulotni toping"}
          </h2>

          <Link
            to="/catalog"
            className="mt-8 inline-block rounded-full bg-[#173f35] px-8 py-4 font-medium text-white transition hover:bg-[#245448]"
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