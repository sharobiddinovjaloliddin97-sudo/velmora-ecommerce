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
    <div className="min-h-[80vh] bg-[#faf7f2] dark:bg-[#141210] py-12 sm:py-16 transition-colors duration-300">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border border-[#e8ded2] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] p-6 text-center shadow-sm sm:p-10">
          {/* SUCCESS ICON */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f4efe6] dark:bg-[#28211a] text-[#8a735e] dark:text-[#c4a98e]">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#f4efe6] dark:bg-[#28211a] px-4 py-1.5 text-xs font-semibold tracking-wider text-[#3b2d24] dark:text-[#c4a98e] uppercase border border-[#e8ded2] dark:border-[#383028]">
            <Sparkles className="h-3.5 w-3.5 text-[#8a735e] dark:text-[#c4a98e]" />
            <span>{language === "ru" ? "Заказ успешно создан" : "Buyurtma qabul qilindi"}</span>
          </span>

          <h1 className="mt-4 font-serif text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4] sm:text-4xl">
            {language === "ru" ? "Спасибо за ваш заказ!" : "Xaridingiz uchun tashakkur!"}
          </h1>

          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300 sm:text-base leading-relaxed">
            {language === "ru"
              ? "Мы уже начали обработку вашего заказа. Скоро с вами свяжется оператор."
              : "Buyurtmangiz ko‘rib chiqilmoqda. Tez orada kuryerimiz siz bilan bog‘lanadi."}
          </p>

          {/* ORDER RECEIPT CARD */}
          <div className="mt-8 rounded-2xl border border-[#e8ded2] dark:border-[#2d241c] bg-[#faf7f2] dark:bg-[#181411] p-5 text-left sm:p-6">
            <div className="flex items-center justify-between border-b border-[#e8ded2] dark:border-[#2d241c] pb-3.5 text-sm">
              <span className="text-stone-600 dark:text-stone-400 font-medium">
                {language === "ru" ? "Номер заказа" : "Buyurtma raqami"}
              </span>
              <strong className="font-mono text-base font-bold text-[#3b2d24] dark:text-[#f3ede4]">
                {order.order_number}
              </strong>
            </div>

            <div className="space-y-3.5 pt-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-600 dark:text-stone-400 font-medium">
                  {language === "ru" ? "Статус заказа" : "Buyurtma holati"}
                </span>
                <span className="rounded-full bg-[#f4efe6] dark:bg-[#28211a] px-3 py-1 text-xs font-bold text-[#3b2d24] dark:text-[#ede4d8] border border-[#e8ded2] dark:border-[#383028]">
                  {getOrderStatusLabel(order.status, language)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600 dark:text-stone-400 font-medium">
                  {language === "ru" ? "Способ оплаты" : "To‘lov usuli"}
                </span>
                <span className="font-semibold text-[#3b2d24] dark:text-[#ede4d8]">
                  {getPaymentMethodLabel(order.payment_method, language)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-600 dark:text-stone-400 font-medium">
                  {language === "ru" ? "Доставка" : "Yetkazib berish"}
                </span>
                <span className="font-bold text-[#8a735e] dark:text-[#c4a98e]">
                  {language === "ru" ? "Бесплатно (Ташкент)" : "0 so‘m (Bepul)"}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-t border-[#e8ded2] dark:border-[#2d241c] pt-4">
                <span className="font-serif text-base font-bold text-stone-900 dark:text-[#f3ede4]">
                  {language === "ru" ? "Сумма к оплате" : "To‘lov summasi"}
                </span>
                <span className="font-serif text-2xl font-bold text-[#3b2d24] dark:text-[#c1a27c]">
                  {Number(order.total_amount).toLocaleString("uz-UZ")} so‘m
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to={`/account/orders/${order.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b2d24] dark:bg-[#c1a27c] px-8 py-3.5 text-xs font-bold tracking-wider text-white dark:text-[#1e1915] uppercase shadow-md transition hover:bg-[#534135] dark:hover:bg-[#d6ba94]"
            >
              <PackageCheck className="h-4 w-4" />
              <span>{language === "ru" ? "Детали заказа" : "Buyurtmani kuzatish"}</span>
            </Link>

            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d6c7b2] dark:border-[#383028] bg-white dark:bg-[#1e1915] px-8 py-3.5 text-xs font-bold tracking-wider text-[#3b2d24] dark:text-[#ede4d8] uppercase transition hover:bg-[#f4efe6] dark:hover:bg-[#28211a]"
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