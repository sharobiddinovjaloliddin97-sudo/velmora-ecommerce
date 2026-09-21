import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "../utils/orderLabels";


function OrderSuccessPage() {
  const location = useLocation();
  const { language } = useLanguage();

  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[80vh] bg-[#faf7f2] py-12 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#e8ded2] bg-white p-6 text-center shadow-sm sm:p-10">
          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4efe6] text-[#8a735e]">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#f4efe6] px-4 py-1.5 text-xs font-semibold tracking-wider text-[#3b2d24] uppercase">
            <Sparkles className="h-3.5 w-3.5 text-[#8a735e]" />
            <span>{language === "ru" ? "Заказ успешно создан" : "Buyurtma qabul qilindi"}</span>
          </span>

          <h1 className="mt-4 font-serif text-3xl font-bold text-[#3b2d24] sm:text-4xl">
            {language === "ru" ? "Спасибо за ваш заказ!" : "Xaridingiz uchun tashakkur!"}
          </h1>

          <p className="mt-3 text-sm text-stone-600 sm:text-base leading-relaxed">
            {language === "ru"
              ? "Мы уже начали обработку вашего заказа. Скоро с вами свяжется оператор."
              : "Buyurtmangiz ko‘rib chiqilmoqda. Tez orada kuryerimiz siz bilan bog‘lanadi."}
          </p>

          {/* ORDER RECEIPT CARD */}
          <div className="mt-8 rounded-2xl border border-[#e8ded2] bg-[#faf7f2] p-5 text-left sm:p-6">
            <div className="flex items-center justify-between border-b border-[#e8ded2] pb-3.5 text-sm">
              <span className="text-stone-600 font-medium">
                {language === "ru" ? "Номер заказа" : "Buyurtma raqami"}
              </span>
              <strong className="font-mono text-base font-bold text-[#3b2d24]">
                {order.order_number}
              </strong>
            </div>

            <div className="space-y-3.5 pt-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">
                  {language === "ru" ? "Статус заказа" : "Buyurtma holati"}
                </span>
                <span className="rounded-full bg-[#f4efe6] px-3 py-1 text-xs font-bold text-[#3b2d24] border border-[#e8ded2]">
                  {getOrderStatusLabel(order.status, language)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">
                  {language === "ru" ? "Способ оплаты" : "To‘lov usuli"}
                </span>
                <span className="font-semibold text-[#3b2d24]">
                  {getPaymentMethodLabel(order.payment_method, language)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600 font-medium">
                  {language === "ru" ? "Доставка" : "Yetkazib berish"}
                </span>
                <span className="font-bold text-[#8a735e]">
                  {language === "ru" ? "Бесплатно (Ташкент)" : "0 so‘m (Bepul)"}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#e8ded2] pt-4">
                <span className="font-serif text-base font-bold text-stone-900">
                  {language === "ru" ? "Сумма к оплате" : "To‘lov summasi"}
                </span>
                <span className="font-serif text-2xl font-bold text-[#3b2d24]">
                  {Number(order.total_amount).toLocaleString("uz-UZ")} so‘m
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/account/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b2d24] px-8 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135]"
            >
              <PackageCheck className="h-4 w-4" />
              <span>{language === "ru" ? "Детали заказа" : "Buyurtmani kuzatish"}</span>
            </Link>

            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d6c7b2] bg-white px-8 py-3.5 text-xs font-bold tracking-wider text-[#3b2d24] uppercase transition hover:bg-[#f4efe6]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{language === "ru" ? "Продолжить покупки" : "Xaridni davom ettirish"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;