import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";


function Footer() {
  const { language } = useLanguage();

  const year = new Date().getFullYear();


  return (
    <footer className="bg-[#102f28] text-white">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">

        {/* BRAND */}
        <div>

          <Link
            to="/"
            className="text-2xl font-bold"
          >
            Velmora
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-[#cad8d2]">
            {language === "ru"
              ? "Домашний текстиль для комфортной и уютной атмосферы."
              : "Qulay va shinam muhit uchun uy tekstili mahsulotlari."}
          </p>

        </div>


        {/* LINKS */}
        <div>

          <h3 className="font-semibold">
            {language === "ru"
              ? "Навигация"
              : "Navigatsiya"}
          </h3>

          <div className="mt-4 flex flex-col gap-3 text-sm text-[#cad8d2]">

            <Link
              to="/"
              className="hover:text-white"
            >
              {language === "ru"
                ? "Главная"
                : "Bosh sahifa"}
            </Link>

            <Link
              to="/catalog"
              className="hover:text-white"
            >
              {language === "ru"
                ? "Каталог"
                : "Katalog"}
            </Link>

            <Link
              to="/about"
              className="hover:text-white"
            >
              {language === "ru"
                ? "О нас"
                : "Biz haqimizda"}
            </Link>

            <Link
              to="/contact"
              className="hover:text-white"
            >
              {language === "ru"
                ? "Контакты"
                : "Aloqa"}
            </Link>

          </div>

        </div>


        {/* DELIVERY */}
        <div>

          <h3 className="font-semibold">
            {language === "ru"
              ? "Доставка и оплата"
              : "Yetkazib berish va to‘lov"}
          </h3>

          <p className="mt-4 text-sm leading-7 text-[#cad8d2]">
            {language === "ru"
              ? "Бесплатная доставка по городу Ташкент. Оплата наличными при получении."
              : "Toshkent shahri bo‘ylab bepul yetkazib berish. To‘lov mahsulotni qabul qilganda naqd."}
          </p>

        </div>

      </div>


      <div className="border-t border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-[#9eb3aa]">

          © {year} Velmora.{" "}

          {language === "ru"
            ? "Все права защищены."
            : "Barcha huquqlar himoyalangan."}

        </div>

      </div>

    </footer>
  );
}


export default Footer;