import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import api from "../api/client";
import {
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../utils/cart";
import { useLanguage } from "../context/LanguageContext";

function CartPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [cart, setCart] = useState(getCart());
  const [error, setError] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);

  const handleTelegramCheckout = async () => {
    if (cart.length === 0) return;
    setTelegramLoading(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          variant_id: item.variant_id,
          product_name: item.product_name,
          price: item.price,
          unit_price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      };
      const res = await api.post("/orders/telegram-session/", payload);
      if (res.data?.telegram_url) {
        clearCart();
        setCart([]);
        window.open(res.data.telegram_url, "_blank");
      }
    } catch (err) {
      console.error("Telegram checkout error:", err);
      clearCart();
      setCart([]);
      window.open("https://t.me/velmora_silkbot", "_blank");
    } finally {
      setTelegramLoading(false);
    }
  };

  useEffect(() => {
    const refreshCart = () => {
      setCart(getCart());
    };
    window.addEventListener("cart-updated", refreshCart);
    return () => {
      window.removeEventListener("cart-updated", refreshCart);
    };
  }, []);

  const total = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleQuantity = (item, newQuantity) => {
    setError("");
    if (newQuantity < 1) return;

    if (newQuantity > item.stock) {
      setError(
        language === "ru"
          ? `На складе доступно только ${item.stock} шт.`
          : `Omborda faqat ${item.stock} dona mavjud.`
      );
      return;
    }

    try {
      updateCartQuantity(item.variant_id, newQuantity);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = (variantId) => {
    setError("");
    removeFromCart(variantId);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-[#faf7f2] py-16 text-[#2d241e] transition-colors duration-200 dark:bg-[#141210] dark:text-[#ede4d8]">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#f4efe6] text-[#8a735e] border border-[#ebdcca] dark:border-[#383028] dark:bg-[#1c1917] dark:text-[#e5b378]">
            <ShoppingBag className="h-10 w-10" />
          </div>

          <h1 className="mt-6 font-serif text-3xl sm:text-4xl font-bold text-[#3b2d24] dark:text-[#f5efe6]">
            {language === "ru" ? "Ваша корзина пуста" : "Savatchangiz hozircha bo‘sh"}
          </h1>

          <p className="mt-3 text-base sm:text-lg leading-relaxed text-[#6b584a] dark:text-[#a09081]">
            {language === "ru"
              ? "Похоже, вы еще не выбрали товары. Ознакомьтесь с нашей новой коллекцией постельного белья и текстиля."
              : "Siz hali biror mahsulot tanlamadingiz. Velmoraning tabiiy to‘qimachilik to‘plamlari bilan tanishing."}
          </p>

          <Link
            to="/catalog"
            className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#3b2d24] px-9 py-4 text-base font-semibold tracking-wide text-white shadow-md transition hover:bg-[#271f19] dark:bg-[#e5b378] dark:text-[#1c1917] dark:hover:bg-[#d9a365]"
          >
            <span>{language === "ru" ? "Перейти в каталог" : "Katalogga o‘tish"}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-24 text-[#2d241e] transition-colors duration-200 dark:bg-[#141210] dark:text-[#ede4d8]">
      {/* BREADCRUMB */}
      <nav className="border-b border-[#ebdcca] bg-white/60 backdrop-blur-xs dark:border-[#383028] dark:bg-[#1c1917]/60">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3.5 text-xs sm:text-sm text-[#7a6758] sm:px-6 dark:text-[#a09081]">
          <Link to="/" className="hover:text-[#3b2d24] dark:hover:text-[#e8ded4]">
            {language === "ru" ? "Главная" : "Bosh sahifa"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="font-semibold text-[#3b2d24] dark:text-[#f5efe6]">
            {language === "ru" ? "Корзина" : "Savatcha"}
          </span>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="flex items-baseline justify-between border-b border-[#ebdcca] pb-5 dark:border-[#383028]">
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#8a735e] dark:text-[#c1a27c] uppercase">
              {language === "ru" ? "Оформление" : "Xarid"}
            </span>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3b2d24] dark:text-[#f5efe6]">
              {language === "ru" ? "Корзина покупок" : "Savatchadagi mahsulotlar"}
            </h1>
          </div>

          <span className="text-sm sm:text-base font-bold text-[#8a735e]">
            {language === "ru"
              ? `${totalItemsCount} шт.`
              : `${totalItemsCount} ta mahsulot`}
          </span>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* CART ITEMS LIST */}
          <div className="space-y-4 lg:col-span-8">
            {cart.map((item) => (
              <article
                key={item.variant_id}
                className="flex flex-col gap-4 rounded-3xl border border-[#ebdcca] bg-white p-5 shadow-xs transition sm:flex-row sm:items-center sm:gap-6 sm:p-6 dark:border-[#383028] dark:bg-[#1c1917]"
              >
                {/* THUMBNAIL */}
                <Link
                  to={`/products/${item.product_slug}`}
                  className="aspect-square h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#ebdcca] bg-[#f4efe6] sm:h-28 sm:w-28 dark:border-[#383028] dark:bg-[#25201c]"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.product_name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#8a735e] dark:text-[#c1a27c]">
                      {language === "ru" ? "Нет фото" : "Rasm yo‘q"}
                    </div>
                  )}
                </Link>

                {/* DETAILS */}
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/products/${item.product_slug}`}
                      className="line-clamp-1 font-serif text-lg font-bold text-[#3b2d24] transition hover:text-[#8a735e] sm:text-xl dark:text-[#f5efe6] dark:hover:text-[#e5b378]"
                    >
                      {item.product_name}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.variant_id)}
                      aria-label="Remove"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm text-[#6b584a] dark:text-[#b8aa9d]">
                    <span className="font-bold text-[#3b2d24] dark:text-[#f5efe6]">{item.color}</span>
                    {" • "}
                    <span>{item.size}</span>
                    {item.sku && (
                      <span className="ml-2 text-stone-400 dark:text-stone-500">({item.sku})</span>
                    )}
                  </p>

                  <p className="font-serif text-base font-bold text-[#3b2d24] sm:text-lg dark:text-[#e5b378]">
                    {Number(item.price).toLocaleString("uz-UZ")} so‘m
                  </p>
                </div>

                {/* STEPPER & TOTAL */}
                <div className="flex items-center justify-between border-t border-[#f4efe6] pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0 dark:border-[#2e2722]">
                  {/* STEPPER */}
                  <div className="flex h-11 items-center rounded-full border border-[#d6c6b3] bg-[#faf7f2] p-1 dark:border-[#3d342c] dark:bg-[#25201c]">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => handleQuantity(item, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#3b2d24] transition hover:bg-white disabled:opacity-30 dark:text-[#f5efe6] dark:hover:bg-[#332b25]"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-9 text-center text-sm font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => handleQuantity(item, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#3b2d24] transition hover:bg-white disabled:opacity-30 dark:text-[#f5efe6] dark:hover:bg-[#332b25]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* LINE TOTAL */}
                  <div className="text-right sm:mt-2">
                    <p className="text-xs text-[#8a735e] dark:text-[#c1a27c] font-semibold uppercase">
                      {language === "ru" ? "Итого" : "Jami"}
                    </p>
                    <p className="font-serif text-base sm:text-lg font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                      {(Number(item.price) * item.quantity).toLocaleString("uz-UZ")} so‘m
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* SUMMARY SIDEBAR */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5 rounded-3xl border border-[#ebdcca] bg-white p-6 sm:p-7 shadow-sm dark:border-[#383028] dark:bg-[#1c1917]">
              <h2 className="font-serif text-2xl font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                {language === "ru" ? "Сумма заказа" : "Buyurtma hisobi"}
              </h2>

              <div className="space-y-3.5 border-t border-[#f4efe6] pt-5 text-sm sm:text-base dark:border-[#2e2722]">
                <div className="flex justify-between text-[#5c4a3d] dark:text-[#c4b6a8]">
                  <span>{language === "ru" ? "Стоимость товаров" : "Tovarlar summasi"}</span>
                  <span className="font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                    {total.toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#5c4a3d] dark:text-[#c4b6a8]">
                  <span>{language === "ru" ? "Доставка (Ташкент)" : "Yetkazib berish (Toshkent)"}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-800 text-xs sm:text-sm border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {language === "ru" ? "Бесплатно" : "0 so‘m (Bepul)"}
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-[#f4efe6] pt-5 dark:border-[#2e2722]">
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg font-bold text-[#3b2d24] dark:text-[#f5efe6]">
                    {language === "ru" ? "Всего к оплате:" : "Jami to‘lov:"}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#e5b378]">
                    {total.toLocaleString("uz-UZ")} so‘m
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-[#7a6758] dark:text-[#a09081]">
                  {language === "ru"
                    ? "Оплата наличными при получении курьеру"
                    : "To‘lov buyurtmani tekshirib olganda naqd shaklda"}
                </p>
              </div>

              {/* TELEGRAM ORDER BUTTON */}
              <button
                type="button"
                onClick={handleTelegramCheckout}
                disabled={telegramLoading}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full bg-[#229ed9] py-4 text-base font-bold tracking-wide text-white shadow-md shadow-[#229ed9]/25 transition hover:bg-[#1e8ec3] hover:shadow-lg disabled:opacity-60 cursor-pointer"
              >
                <Send className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span>
                  {telegramLoading
                    ? (language === "ru" ? "Загрузка..." : "Yuklanmoqda...")
                    : (language === "ru" ? "Заказать через Telegram" : "Telegram orqali buyurtma berish")}
                </span>
              </button>

              {/* WEBSITE CHECKOUT BUTTON */}
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                className="group flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#3b2d24] bg-white py-3.5 text-sm sm:text-base font-bold tracking-wide text-[#3b2d24] transition hover:bg-[#3b2d24] hover:text-white cursor-pointer dark:border-[#e5b378] dark:bg-transparent dark:text-[#e5b378] dark:hover:bg-[#e5b378] dark:hover:text-[#1c1917]"
              >
                <span>{language === "ru" ? "Оформить на сайте" : "Sayt orqali rasmiylashtirish"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                to="/catalog"
                className="block text-center text-sm font-bold text-[#8a735e] dark:text-[#c1a27c] hover:underline"
              >
                {language === "ru" ? "← Продолжить покупки" : "← Xaridni davom ettirish"}
              </Link>

              {/* TRUST BADGES */}
              <div className="space-y-2.5 border-t border-[#f4efe6] pt-5 text-xs sm:text-sm text-[#7a6758] dark:border-[#2e2722] dark:text-[#a09081]">
                <div className="flex items-center gap-2.5">
                  <Truck className="h-4.5 w-4.5 text-[#8a735e] dark:text-[#e5b378]" />
                  <span>{language === "ru" ? "Бесплатная доставка до двери" : "Eshikkacha bepul yetkazish"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#8a735e] dark:text-[#e5b378]" />
                  <span>{language === "ru" ? "Осмотр товара перед оплатой" : "To‘lovdan oldin tekshirish kafolati"}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CartPage;