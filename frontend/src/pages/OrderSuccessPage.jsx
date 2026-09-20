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

      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-16">

        <div className="w-full rounded-[32px] bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>


          <h1 className="mt-6 text-3xl font-semibold text-[#173f35]">

            {language === "ru"
              ? "Заказ принят"
              : "Buyurtma qabul qilindi"}

          </h1>


          <p className="mt-3 text-stone-600">

            {language === "ru"
              ? "Ваш заказ успешно создан."
              : "Buyurtmangiz muvaffaqiyatli yaratildi."}

          </p>


          <div className="mt-8 rounded-2xl bg-[#f8f5ef] p-6 text-left">

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


          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Link
              to="/account"
              className="rounded-full bg-[#173f35] px-6 py-3 font-medium text-white"
            >
              {language === "ru"
                ? "Мои заказы"
                : "Buyurtmalarim"}
            </Link>


            <Link
              to="/catalog"
              className="rounded-full border border-[#173f35] px-6 py-3 font-medium text-[#173f35]"
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