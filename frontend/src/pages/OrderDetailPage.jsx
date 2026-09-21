import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Sparkles,
  Truck,
  User,
} from "lucide-react";

import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import {
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../utils/orderLabels";


const STEPS = [
  { key: "NEW", uz: "Yangi", ru: "Новый", icon: Clock },
  { key: "CONFIRMED", uz: "Tasdiqlangan", ru: "Подтвержден", icon: CheckCircle2 },
  { key: "SHIPPING", uz: "Yetkazilmoqda", ru: "В пути", icon: Truck },
  { key: "DELIVERED", uz: "Yetkazilgan", ru: "Доставлен", icon: PackageCheck },
];


function OrderDetailPage() {
  const { id } = useParams();
  const { language } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/orders/${id}/`);
        if (cancelled) return;
        setOrder(response.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Order detail error:", err);
          setError(
            language === "ru"
              ? "Не удалось загрузить заказ."
              : "Buyurtma ma’lumotlarini yuklashda xatolik yuz berdi."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [id, language]);

  const getStepIndex = (status) => {
    switch (status) {
      case "NEW":
        return 0;
      case "CONFIRMED":
        return 1;
      case "SHIPPING":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return -1;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-base font-medium text-stone-600">
          {language === "ru" ? "Загрузка заказа..." : "Buyurtma yuklanmoqda..."}
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="text-base text-red-600">{error || "Buyurtma topilmadi"}</p>
        <Link
          to="/account"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3b2d24] px-7 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === "ru" ? "Вернуться в кабинет" : "Kabinetga qaytish"}</span>
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-24">
      {/* BREADCRUMB */}
      <nav className="border-b border-[#e8ded2] bg-white/60 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3.5 text-xs text-stone-500 sm:px-6">
          <Link to="/" className="hover:text-[#3b2d24] transition">
            {language === "ru" ? "Главная" : "Bosh sahifa"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <Link to="/account" className="hover:text-[#3b2d24] transition">
            {language === "ru" ? "Личный кабинет" : "Kabinet"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-mono font-bold text-[#3b2d24]">
            {order.order_number}
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 sm:pt-10">
        <Link
          to="/account"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#8a735e] transition hover:text-[#3b2d24]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === "ru" ? "Назад в кабинет" : "Kabinetga qaytish"}</span>
        </Link>

        {/* HEADER */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#8a735e] uppercase">
              {language === "ru" ? "Детали заказа" : "Buyurtma tafsilotlari"}
            </span>
            <h1 className="mt-1 font-mono text-2xl font-bold text-[#3b2d24] sm:text-3xl">
              {order.order_number}
            </h1>
          </div>

          <p className="text-sm text-stone-500">
            {new Date(order.created_at).toLocaleString(
              language === "ru" ? "ru-RU" : "uz-UZ",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>

        {/* ========================= */}
        {/* STATUS STEPPER PROGRESS */}
        {/* ========================= */}
        <div className="mt-8 rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs sm:p-8">
          <h2 className="font-serif text-lg font-bold text-[#3b2d24]">
            {language === "ru" ? "Статус выполнения" : "Buyurtma holati"}
          </h2>

          {isCancelled ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">
                  {language === "ru" ? "Заказ отменен" : "Buyurtma bekor qilingan"}
                </p>
                {order.cancellation_reason && (
                  <p className="mt-0.5 text-rose-600 font-normal">
                    {order.cancellation_reason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STEPS.map((step, idx) => {
                const IconComponent = step.icon;
                const isPassed = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                        isCurrent
                          ? "bg-[#3b2d24] text-white shadow-md ring-4 ring-[#8a735e]/20"
                          : isPassed
                            ? "bg-[#f4efe6] text-[#3b2d24] border border-[#e8ded2]"
                            : "bg-[#faf7f2] text-stone-400 border border-stone-200"
                      }`}
                    >
                      {isPassed ? (
                        <Check className="h-5 w-5 text-[#8a735e]" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>

                    <p
                      className={`mt-2.5 text-xs font-bold uppercase tracking-wider ${
                        isCurrent
                          ? "text-[#3b2d24]"
                          : isPassed
                            ? "text-stone-700"
                            : "text-stone-400"
                      }`}
                    >
                      {language === "ru" ? step.ru : step.uz}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================= */}
        {/* RECIPIENT & ADDRESS INFO */}
        {/* ========================= */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* ADDRESS */}
          <div className="rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#8a735e] uppercase">
              <MapPin className="h-4 w-4" />
              <span>{language === "ru" ? "Адрес доставки" : "Yetkazish manzili"}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-stone-900">
              {order.city}, {order.district_display || order.district}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              {order.street}, {language === "ru" ? "дом" : "uy"} {order.house}
              {order.apartment ? `, ${language === "ru" ? "кв." : "xonadon"} ${order.apartment}` : ""}
            </p>
            {order.landmark && (
              <p className="mt-2 text-xs text-stone-500">
                {language === "ru" ? "Ориентир: " : "Mo‘ljal: "} {order.landmark}
              </p>
            )}
          </div>

          {/* RECIPIENT & PAYMENT */}
          <div className="rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#8a735e] uppercase">
              <User className="h-4 w-4" />
              <span>{language === "ru" ? "Получатель и оплата" : "Qabul qiluvchi va to‘lov"}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-stone-900">
              {order.recipient_name}
            </p>
            <p className="mt-1 text-sm text-stone-600">{order.phone}</p>
            <div className="mt-3.5 flex items-center gap-2 border-t border-[#e8ded2] pt-3.5">
              <Banknote className="h-4 w-4 text-[#8a735e]" />
              <span className="text-sm font-medium text-stone-700">
                {getPaymentMethodLabel(order.payment_method, language)} •{" "}
                <span className="font-bold text-[#3b2d24]">
                  {getPaymentStatusLabel(order.payment_status, language)}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* ORDER ITEMS LIST */}
        {/* ========================= */}
        <div className="mt-6 rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs sm:p-8">
          <h2 className="font-serif text-lg font-bold text-[#3b2d24]">
            {language === "ru" ? "Заказанные товары" : "Buyurtma qilingan tovarlar"}
          </h2>

          <div className="mt-4 divide-y divide-[#e8ded2]">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-serif text-base font-bold text-[#3b2d24]">
                    {item.product_name}
                  </p>
                  <p className="text-sm text-stone-500">
                    <span>{item.color}</span>
                    {" • "}
                    <span>{item.size}</span>
                    {item.sku && (
                      <span className="ml-1 text-stone-400">({item.sku})</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm sm:text-right">
                  <span className="text-stone-500">
                    {item.quantity} {language === "ru" ? "шт." : "dona"} ×{" "}
                    {Number(item.unit_price).toLocaleString("uz-UZ")} so‘m
                  </span>
                  <span className="font-serif text-base font-bold text-[#3b2d24]">
                    {Number(item.line_total).toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL BREAKDOWN */}
          <div className="mt-6 space-y-2 border-t border-[#e8ded2] pt-5 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>{language === "ru" ? "Доставка (Ташкент)" : "Yetkazib berish (Toshkent)"}</span>
              <span className="font-bold text-[#8a735e]">
                {language === "ru" ? "Бесплатно" : "0 so‘m (Bepul)"}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-3 border-t border-[#e8ded2]">
              <span className="font-serif text-base font-bold text-stone-900">
                {language === "ru" ? "Итого к оплате:" : "Jami to‘lov:"}
              </span>
              <span className="font-serif text-2xl font-bold text-[#3b2d24]">
                {Number(order.total_amount).toLocaleString("uz-UZ")} so‘m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;