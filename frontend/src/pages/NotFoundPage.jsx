import { Link } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";


function NotFoundPage() {
  const { language } = useLanguage();


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">

        <div className="text-center">

          <p className="text-8xl font-bold text-[#d5cec1]">
            404
          </p>

          <h1 className="mt-5 text-4xl font-semibold text-[#173f35]">
            {language === "ru"
              ? "Страница не найдена"
              : "Sahifa topilmadi"}
          </h1>

          <p className="mx-auto mt-4 max-w-md leading-7 text-stone-600">
            {language === "ru"
              ? "Возможно, страница была удалена или адрес указан неверно."
              : "Sahifa o‘chirilgan yoki manzil noto‘g‘ri kiritilgan bo‘lishi mumkin."}
          </p>


          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              to="/"
              className="rounded-full bg-[#173f35] px-7 py-3.5 font-medium text-white"
            >
              {language === "ru"
                ? "На главную"
                : "Bosh sahifaga"}
            </Link>

            <Link
              to="/catalog"
              className="rounded-full border border-[#173f35] px-7 py-3.5 font-medium text-[#173f35]"
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