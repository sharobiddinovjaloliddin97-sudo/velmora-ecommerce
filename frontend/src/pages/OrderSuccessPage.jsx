import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../utils/orderLabels";


function OrderSuccessPage() {
  const location =
    useLocation();

  const {
    language,
  } = useLanguage();


  const order =
    location.state?.order;


  if (!order) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16">

        <div className="w-full rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-[32px] sm:p-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl text-green-700 sm:h-16 sm:w-16 sm:text-2xl">
            ✓
          </div>


          <h1 className="mt-4 text-2xl font-semibold text-[#173f35] sm:mt-6 sm:text-3xl">

            {language === "ru"
              ? "Заказ принят"
              : "Buyurtma qabul qilindi"}

          </h1>


          <p className="mt-2 text-sm text-stone-600 sm:mt-3 sm:text-base">

            {language === "ru"
              ? "Ваш заказ успешно создан."
              : "Buyurtmangiz muvaffaqiyatli yaratildi."}

          </p>


          <div className="mt-6 rounded-2xl bg-[#f8f5ef] p-4 text-left sm:mt-8 sm:p-6">

            {/* ORDER NUMBER */}
            <div className="flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Номер заказа"
                  : "Buyurtma raqami"}
              </span>

              <strong className="text-[#173f35]">
                {order.order_number}
              </strong>

            </div>


            {/* ORDER STATUS */}
            <div className="mt-4 flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Статус заказа"
                  : "Buyurtma holati"}
              </span>

              <span className="font-medium">
                {getOrderStatusLabel(
                  order.status,
                  language
                )}
              </span>

            </div>


            {/* PAYMENT STATUS */}
            <div className="mt-4 flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Статус оплаты"
                  : "To‘lov holati"}
              </span>

              <span className="font-medium">
                {getPaymentStatusLabel(
                  order.payment_status,
                  language
                )}
              </span>

            </div>


            {/* PAYMENT METHOD */}
            <div className="mt-4 flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Способ оплаты"
                  : "To‘lov usuli"}
              </span>

              <span>
                {getPaymentMethodLabel(
                  order.payment_method,
                  language
                )}
              </span>

            </div>


            {/* TOTAL */}
            <div className="mt-4 flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Итого"
                  : "Jami"}
              </span>

              <strong>
                {Number(
                  order.total_amount
                ).toLocaleString(
                  "uz-UZ"
                )}{" "}
                so‘m
              </strong>

            </div>


            {/* DELIVERY */}
            <div className="mt-4 flex justify-between gap-4">

              <span className="text-stone-500">
                {language === "ru"
                  ? "Доставка"
                  : "Yetkazib berish"}
              </span>

              <span className="text-green-700">
                {language === "ru"
                  ? "Бесплатно"
                  : "Bepul"}
              </span>

            </div>

          </div>


          <p className="mt-6 text-sm leading-6 text-stone-500">

            {language === "ru"
              ? "Информацию о заказе можно посмотреть в личном кабинете."
              : "Buyurtma ma’lumotlarini shaxsiy kabinetingizdan ko‘rishingiz mumkin."}

          </p>


          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">

            <Link
              to="/account"
              className="w-full rounded-full bg-[#173f35] px-6 py-3 text-center font-medium text-white transition hover:bg-[#245448] sm:w-auto"
            >
              {language === "ru"
                ? "Мои заказы"
                : "Buyurtmalarim"}
            </Link>


            <Link
              to="/catalog"
              className="w-full rounded-full border border-[#173f35] px-6 py-3 text-center font-medium text-[#173f35] transition hover:bg-white sm:w-auto"
            >
              {language === "ru"
                ? "Продолжить покупки"
                : "Xaridni davom ettirish"}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


export default OrderSuccessPage;