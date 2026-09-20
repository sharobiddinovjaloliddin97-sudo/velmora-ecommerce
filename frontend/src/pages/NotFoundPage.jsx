import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";


function NotFoundPage() {
  const { language } = useLanguage();


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16">

        <div className="w-full max-w-lg text-center">

          <p className="text-6xl font-bold text-[#d5cec1] sm:text-8xl">
            404
          </p>

          <h1 className="mt-4 text-2xl font-semibold text-[#173f35] sm:mt-5 sm:text-4xl">
            {language === "ru"
              ? "Страница не найдена"
              : "Sahifa topilmadi"}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 sm:mt-4 sm:text-base sm:leading-7">
            {language === "ru"
              ? "Возможно, страница была удалена или адрес указан неверно."
              : "Sahifa o‘chirilgan yoki manzil noto‘g‘ri kiritilgan bo‘lishi mumkin."}
          </p>


          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">

            <Link
              to="/"
              className="w-full rounded-full bg-[#173f35] px-7 py-3.5 text-center font-medium text-white transition hover:bg-[#245448] sm:w-auto"
            >
              {language === "ru"
                ? "На главную"
                : "Bosh sahifaga"}
            </Link>

            <Link
              to="/catalog"
              className="w-full rounded-full border border-[#173f35] px-7 py-3.5 text-center font-medium text-[#173f35] transition hover:bg-white sm:w-auto"
            >
              {language === "ru"
                ? "Каталог"
                : "Katalog"}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


export default NotFoundPage;