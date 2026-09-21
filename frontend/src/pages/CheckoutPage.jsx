import {
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Banknote,
  Building,
  Check,
  ChevronRight,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { clearCart, getCart } from "../utils/cart";

const DISTRICTS = [
  { value: "BEKTEMIR", uz: "Bektemir tumani", ru: "Бектемирский район" },
  { value: "CHILONZOR", uz: "Chilonzor tumani", ru: "Чиланзарский район" },
  { value: "MIROBOD", uz: "Mirobod tumani", ru: "Мирабадский район" },
  { value: "MIRZO_ULUGBEK", uz: "Mirzo Ulug‘bek tumani", ru: "Мирзо-Улугбекский район" },
  { value: "OLMAZOR", uz: "Olmazor tumani", ru: "Алмазарский район" },
  { value: "SERGELI", uz: "Sergeli tumani", ru: "Сергелийский район" },
  { value: "SHAYXONTOHUR", uz: "Shayxontohur tumani", ru: "Шайхантахурский район" },
  { value: "UCHTEPA", uz: "Uchtepa tumani", ru: "Учтепинский район" },
  { value: "YAKKASAROY", uz: "Yakkasaroy tumani", ru: "Яккасарайский район" },
  { value: "YASHNOBOD", uz: "Yashnobod tumani", ru: "Яшнабадский район" },
  { value: "YUNUSOBOD", uz: "Yunusobod tumani", ru: "Юнусабадский район" },
  { value: "YANGIHAYOT", uz: "Yangihayot tumani", ru: "Янгихаётский район" },
];

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const cart = getCart();

  const [form, setForm] = useState({
    recipient_name: user?.first_name || "",
    phone: "",
    district: "",
    street: "",
    house: "",
    apartment: "",
    landmark: "",
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const frontendTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getErrorMessage = (data) => {
    if (!data) {
      return language === "ru"
        ? "Не удалось оформить заказ. Попробуйте еще раз."
        : "Buyurtmani rasmiylashtirib bo‘lmadi. Qaytadan urinib ko‘ring.";
    }
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      return Array.isArray(val) ? val[0] : String(val);
    }
    return language === "ru" ? "Ошибка оформления" : "Xatolik yuz berdi";
  };

  const sendCheckout = (idempotencyKey) => {
    const payload = {
      items: cart.map((item) => ({
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
      shipping_address: {
        city: "Tashkent",
        district: form.district,
        street: form.street,
        house: form.house,
        apartment: form.apartment || "",
        landmark: form.landmark || "",
      },
      payment_method: "CASH_ON_DELIVERY",
      comment: form.comment || "",
      recipient_name: form.recipient_name,
      phone: form.phone,
    };

    return api.post("/orders/checkout/", payload, {
      headers: {
        "X-Idempotency-Key": idempotencyKey,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError(
        language === "ru"
          ? "Корзина пуста."
          : "Savatchangizda mahsulot yo‘q."
      );
      return;
    }

    if (!form.district) {
      setError(
        language === "ru"
          ? "Пожалуйста, выберите район города Ташкент."
          : "Iltimos, Toshkent shahri tumanini tanlang."
      );
      return;
    }

    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await sendCheckout(idempotencyKey);
      clearCart();
      navigate("/order-success", {
        replace: true,
        state: {
          order: response.data,
        },
      });
    } catch (err) {
      console.error("Checkout error:", err.response?.data || err);
      setError(getErrorMessage(err.response?.data));
    } finally {
      setSubmitting(false);
    }
  };

  // EMPTY CART
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#faf7f2] py-16 text-[#2d241e]">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#3b2d24]">
            {language === "ru" ? "Ваша корзина пуста" : "Savatchangiz bo‘sh"}
          </h1>
          <p className="mt-3 text-base text-[#6b584a]">
            {language === "ru"
              ? "Добавьте товары в корзину перед оформлением заказа."
              : "Buyurtma berishdan oldin savatchaga mahsulot qo‘shing."}
          </p>
          <Link
            to="/catalog"
            className="mt-6 rounded-full bg-[#3b2d24] px-8 py-4 text-sm font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#271f19]"
          >
            {language === "ru" ? "Перейти в каталог" : "Katalogga o‘tish"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-24 text-[#2d241e]">
      {/* BREADCRUMB */}
      <nav className="border-b border-[#ebdcca] bg-white/60 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3.5 text-xs sm:text-sm text-[#7a6758] sm:px-6">
          <Link to="/" className="hover:text-[#3b2d24]">
            {language === "ru" ? "Главная" : "Bosh sahifa"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <Link to="/cart" className="hover:text-[#3b2d24]">
            {language === "ru" ? "Корзина" : "Savatcha"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-semibold text-[#3b2d24]">
            {language === "ru" ? "Оформление заказа" : "Rasmiylashtirish"}
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="border-b border-[#ebdcca] pb-5">
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8a735e] uppercase">
            {language === "ru" ? "Шаг 2 из 2" : "2-bosqich"}
          </span>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3b2d24]">
            {language === "ru" ? "Оформление заказа" : "Yetkazib berish va to‘lov"}
          </h1>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* FORM AREA */}
          <div className="space-y-6 lg:col-span-7">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-6 rounded-3xl border border-[#ebdcca] bg-white p-6 shadow-sm sm:p-8"
            >
              {/* SECTION 1: RECIPIENT */}
              <div>
                <h2 className="flex items-center gap-2.5 font-serif text-xl font-bold text-[#3b2d24]">
                  <User className="h-5 w-5 text-[#8a735e]" />
                  <span>{language === "ru" ? "Получатель" : "Qabul qiluvchi"}</span>
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                      {language === "ru" ? "Имя и фамилия *" : "Ism va familiya *"}
                    </label>
                    <input
                      type="text"
                      name="recipient_name"
                      required
                      value={form.recipient_name}
                      onChange={handleChange}
                      placeholder={language === "ru" ? "Алишер Навои" : "Alisher Navoiy"}
                      className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                      {language === "ru" ? "Телефон *" : "Telefon raqami *"}
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+998 90 123 45 67"
                        className="w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                      <Phone className="absolute top-4 right-4 h-5 w-5 text-[#8a735e]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: ADDRESS */}
              <div className="border-t border-[#f4efe6] pt-6">
                <h2 className="flex items-center gap-2.5 font-serif text-xl font-bold text-[#3b2d24]">
                  <MapPin className="h-5 w-5 text-[#8a735e]" />
                  <span>{language === "ru" ? "Адрес доставки (Ташкент)" : "Yetkazish manzili (Toshkent)"}</span>
                </h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                      {language === "ru" ? "Район города Ташкент *" : "Toshkent shahar tumani *"}
                    </label>
                    <select
                      name="district"
                      required
                      value={form.district}
                      onChange={handleChange}
                      className="mt-1.5 w-full cursor-pointer rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base font-medium outline-none focus:border-[#3b2d24] focus:bg-white"
                    >
                      <option value="">
                        {language === "ru" ? "Выберите район..." : "Tumanni tanlang..."}
                      </option>
                      {DISTRICTS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {language === "ru" ? d.ru : d.uz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                        {language === "ru" ? "Улица / Махалля *" : "Ko‘cha / Mahalla *"}
                      </label>
                      <input
                        type="text"
                        name="street"
                        required
                        value={form.street}
                        onChange={handleChange}
                        placeholder={language === "ru" ? "ул. Амира Темура" : "Amir Temur ko‘chasi"}
                        className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                        {language === "ru" ? "Дом *" : "Uy raqami *"}
                      </label>
                      <input
                        type="text"
                        name="house"
                        required
                        value={form.house}
                        onChange={handleChange}
                        placeholder="12A"
                        className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                        {language === "ru" ? "Квартира (опционально)" : "Xonadon / Kvartira (ixtiyoriy)"}
                      </label>
                      <input
                        type="text"
                        name="apartment"
                        value={form.apartment}
                        onChange={handleChange}
                        placeholder="45"
                        className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                        {language === "ru" ? "Ориентир (опционально)" : "Mo‘ljal (ixtiyoriy)"}
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={form.landmark}
                        onChange={handleChange}
                        placeholder={language === "ru" ? "Рядом с метро" : "Metro bekati yonida"}
                        className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                      {language === "ru" ? "Комментарий к заказу" : "Kuryer uchun izoh"}
                    </label>
                    <textarea
                      rows={2}
                      name="comment"
                      value={form.comment}
                      onChange={handleChange}
                      placeholder={language === "ru" ? "Домофон, код или удобное время..." : "Domofon kodi yoki qulay vaqt..."}
                      className="mt-1.5 w-full rounded-xl border border-[#d6c6b3] bg-[#faf7f2]/60 p-3.5 text-base outline-none focus:border-[#3b2d24] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAYMENT METHOD CARD */}
              <div className="border-t border-[#f4efe6] pt-6">
                <h2 className="flex items-center gap-2.5 font-serif text-xl font-bold text-[#3b2d24]">
                  <Banknote className="h-5 w-5 text-[#8a735e]" />
                  <span>{language === "ru" ? "Способ оплаты" : "To‘lov usuli"}</span>
                </h2>

                <div className="mt-3 flex items-center justify-between rounded-2xl border-2 border-[#3b2d24] bg-[#8a735e]/10 p-4 sm:p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3b2d24] text-white">
                      <Banknote className="h-6 w-6 text-[#c1a27c]" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-[#3b2d24]">
                        {language === "ru" ? "Оплата при получении (Наличными)" : "Eshik oldida tekshirib to‘lov (Naqd)"}
                      </p>
                      <p className="text-xs sm:text-sm text-[#6b584a]">
                        {language === "ru" ? "Оплата курьеру после проверки заказа" : "Buyurtmani ko‘rib olgach kuryerga to‘lanadi"}
                      </p>
                    </div>
                  </div>

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b2d24] text-white">
                    <Check className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* ORDER SUMMARY (STICKY) */}
          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-5 rounded-3xl border border-[#ebdcca] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="font-serif text-2xl font-bold text-[#3b2d24]">
                {language === "ru" ? "Ваш заказ" : "Buyurtma tarkibi"}
              </h2>

              {/* ITEMS MINI LIST */}
              <div className="max-h-64 divide-y divide-[#f4efe6] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.variant_id} className="flex items-center gap-3.5 py-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#ebdcca] bg-[#f4efe6]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-[#8a735e]">
                          -
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#3b2d24]">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-[#6b584a]">
                        {item.color} • {item.size} × {item.quantity}
                      </p>
                    </div>

                    <span className="font-serif text-sm font-bold text-[#3b2d24]">
                      {(Number(item.price) * item.quantity).toLocaleString("uz-UZ")} so‘m
                    </span>
                  </div>
                ))}
              </div>

              {/* TOTAL CALCULATION */}
              <div className="space-y-2.5 border-t border-[#f4efe6] pt-4 text-sm sm:text-base">
                <div className="flex justify-between text-[#5c4a3d]">
                  <span>{language === "ru" ? "Товары" : "Tovarlar summasi"}</span>
                  <span className="font-bold text-[#3b2d24]">
                    {frontendTotal.toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#5c4a3d]">
                  <span>{language === "ru" ? "Доставка (Ташкент)" : "Yetkazib berish (Toshkent)"}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs sm:text-sm border border-emerald-200">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    {language === "ru" ? "Бесплатно" : "0 so‘m (Bepul)"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#f4efe6] pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg font-bold text-[#3b2d24]">
                    {language === "ru" ? "Всего к оплате:" : "Jami to‘lov:"}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24]">
                    {frontendTotal.toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#3b2d24] py-4 text-base font-semibold tracking-wide text-white shadow-md transition hover:bg-[#271f19] hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{language === "ru" ? "Оформление..." : "Rasmiylashtirilmoqda..."}</span>
                  </>
                ) : (
                  <>
                    <span>{language === "ru" ? "Подтвердить заказ" : "Buyurtmani tasdiqlash"}</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="space-y-2 border-t border-[#f4efe6] pt-4 text-xs sm:text-sm text-[#7a6758]">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#8a735e]" />
                  <span>{language === "ru" ? "Бесплатно по всем районам Ташкента" : "Toshkent shahri bo‘ylab bepul"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#8a735e]" />
                  <span>{language === "ru" ? "Оплата только после проверки товара" : "To‘lov buyurtmani ko‘rgach to‘lanadi"}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;