import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import { addToCart } from "../utils/cart";

function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language } = useLanguage();

  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState(false);
  const [openTab, setOpenTab] = useState("details");

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${slug}/`, {
          params: { lang: language },
        });

        if (cancelled) return;

        const data = response.data;
        setProduct(data);

        // Pick primary image or first
        const primary =
          data.images?.find((img) => img.is_primary)?.image ||
          data.images?.[0]?.image ||
          "";
        setSelectedImage(primary);

        // Auto-select first in-stock variant
        const activeVariants = data.variants?.filter(
          (v) => v.is_active && v.stock > 0
        );
        if (activeVariants && activeVariants.length > 0) {
          setSelectedVariantId(String(activeVariants[0].id));
        } else if (data.variants && data.variants.length > 0) {
          setSelectedVariantId(String(data.variants[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Product fetch error:", err);
          setError(
            language === "ru"
              ? "Не удалось загрузить товар. Возможно, он был удален."
              : "Mahsulotni yuklab bo‘lmadi yoki u mavjud emas."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [slug, language]);

  const selectedVariant = product?.variants?.find(
    (v) => String(v.id) === String(selectedVariantId)
  );

  const favorite = product ? isFavorite(product.id) : false;

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    try {
      await toggleFavorite(product.id);
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  const incrementQty = () => {
    if (!selectedVariant) return;
    if (quantity < selectedVariant.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const [telegramLoading, setTelegramLoading] = useState(false);

  const handleTelegramQuickBuy = async () => {
    if (!selectedVariant) {
      setError(
        language === "ru"
          ? "Пожалуйста, выберите вариант товара."
          : "Iltimos, mahsulot variantini tanlang."
      );
      return;
    }

    if (selectedVariant.stock <= 0) {
      setError(
        language === "ru"
          ? "К сожалению, этот вариант закончился на складе."
          : "Ushbu variant omborda tugagan."
      );
      return;
    }

    setTelegramLoading(true);
    try {
      const payload = {
        items: [
          {
            variant_id: selectedVariant.id,
            product_name: product.name,
            price: selectedVariant.price,
            unit_price: selectedVariant.price,
            size: selectedVariant.size,
            color: selectedVariant.color,
            quantity: quantity,
          },
        ],
      };
      const res = await api.post("/orders/telegram-session/", payload);
      if (res.data?.telegram_url) {
        window.open(res.data.telegram_url, "_blank");
      }
    } catch (err) {
      console.error("Telegram quick buy error:", err);
      window.open("https://t.me/velmora_silkbot", "_blank");
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setError(
        language === "ru"
          ? "Пожалуйста, выберите вариант товара."
          : "Iltimos, mahsulot variantini tanlang."
      );
      return;
    }

    if (selectedVariant.stock <= 0) {
      setError(
        language === "ru"
          ? "К сожалению, этот вариант закончился на складе."
          : "Ushbu variant omborda tugagan."
      );
      return;
    }

    try {
      addToCart(product, selectedVariant, quantity);
      setError("");
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="aspect-4/5 w-full animate-pulse rounded-3xl bg-[#f4efe6]" />
          </div>
          <div className="space-y-6 lg:col-span-5">
            <div className="h-6 w-1/4 animate-pulse rounded bg-[#f4efe6]" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-[#f4efe6]" />
            <div className="h-14 w-full animate-pulse rounded-2xl bg-[#f4efe6]" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-[#f4efe6]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-md rounded-3xl border border-[#ebdcca] bg-white p-10 shadow-xs">
          <h2 className="font-serif text-2xl font-bold text-[#3b2d24]">
            {language === "ru" ? "Товар не найден" : "Mahsulot topilmadi"}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6b584a]">{error}</p>
          <Link
            to="/catalog"
            className="mt-6 inline-block rounded-full bg-[#3b2d24] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#271f19]"
          >
            {language === "ru" ? "Вернуться в каталог" : "Katalogga qaytish"}
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-[#faf7f2] pb-24 text-[#2d241e]">
      {/* ========================= */}
      {/* BREADCRUMB NAVIGATION */}
      {/* ========================= */}
      <nav className="border-b border-[#ebdcca] bg-white/60 backdrop-blur-xs">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3.5 text-xs sm:text-sm text-[#7a6758] sm:px-6">
          <Link to="/" className="transition hover:text-[#3b2d24]">
            {language === "ru" ? "Главная" : "Bosh sahifa"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <Link to="/catalog" className="transition hover:text-[#3b2d24]">
            {language === "ru" ? "Каталог" : "Katalog"}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
              <Link
                to={`/catalog?category=${product.category.slug}`}
                className="transition hover:text-[#3b2d24]"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="max-w-[180px] truncate font-semibold text-[#3b2d24] sm:max-w-xs">
            {product.name}
          </span>
        </div>
      </nav>

      {/* ========================= */}
      {/* MAIN CONTENT */}
      {/* ========================= */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* LEFT: GALLERY */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-4">
              {/* PRIMARY MAIN IMAGE */}
              <div className="relative aspect-4/5 overflow-hidden rounded-3xl border border-[#ebdcca] bg-[#f4efe6] shadow-xs sm:rounded-[36px]">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8a735e]">
                    {language === "ru" ? "Нет изображения" : "Rasm mavjud emas"}
                  </div>
                )}

                {/* FEATURED BADGE */}
                {product.is_featured && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-[#3b2d24]/90 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-white backdrop-blur-xs shadow-xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#c1a27c]" />
                    <span>{language === "ru" ? "Хит продаж" : "Tanlangan tovar"}</span>
                  </span>
                )}
              </div>

              {/* THUMBNAILS CAROUSEL */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-5 gap-3 sm:gap-4">
                  {product.images.map((img) => {
                    const isCurrent = selectedImage === img.image;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedImage(img.image)}
                        className={`aspect-square overflow-hidden rounded-2xl border-2 transition duration-200 ${
                          isCurrent
                            ? "border-[#3b2d24] ring-2 ring-[#8a735e]/25"
                            : "border-[#ebdcca] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DETAILS & BUY ACTION */}
          <div className="space-y-6 lg:col-span-5">
            {/* CATEGORY & TITLE */}
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#8a735e] uppercase">
                {product.category?.name || "Velmora"}
              </span>

              <div className="mt-2 flex items-start justify-between gap-4">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3b2d24]">
                  {product.name}
                </h1>

                <button
                  type="button"
                  onClick={handleFavorite}
                  aria-label={favorite ? "Удалить из избранного" : "Добавить в избранное"}
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d8c8b4] bg-white shadow-xs transition hover:scale-110 active:scale-95 ${
                    favorite ? "text-rose-500 shadow-rose-100" : "text-[#7a6758] hover:text-rose-500"
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorite ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* PRICE */}
            <div className="rounded-3xl border border-[#ebdcca] bg-white p-6 shadow-xs">
              <span className="text-xs sm:text-sm font-medium text-[#7a6758]">
                {language === "ru" ? "Стоимость" : "Narxi"}
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#3b2d24]">
                  {selectedVariant
                    ? `${Number(selectedVariant.price).toLocaleString("uz-UZ")} so‘m`
                    : product.min_price
                      ? `${Number(product.min_price).toLocaleString("uz-UZ")} so‘m`
                      : language === "ru"
                        ? "Цена недоступна"
                        : "Narx mavjud emas"}
                </span>
              </div>

              {/* STOCK BADGE */}
              <div className="mt-2.5 flex items-center gap-2">
                {selectedVariant && selectedVariant.stock > 0 ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs sm:text-sm font-bold text-emerald-800 border border-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {language === "ru"
                      ? `В наличии: ${selectedVariant.stock} шт.`
                      : `Omborda mavjud: ${selectedVariant.stock} dona`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs sm:text-sm font-bold text-rose-800 border border-rose-200">
                    <span className="h-2 w-2 rounded-full bg-rose-600" />
                    {language === "ru" ? "Нет в наличии" : "Hozircha omborda yo‘q"}
                  </span>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <p className="text-base sm:text-lg leading-relaxed text-[#5c4a3d]">
                {product.description}
              </p>
            )}

            {/* VARIANTS PICKER */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-bold tracking-wider text-[#3b2d24] uppercase">
                  {language === "ru" ? "Выберите вариант (Цвет / Размер)" : "Variantni tanlang (Rang / O‘lcham)"}
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariantId === String(variant.id);
                    const isOutOfStock = !variant.is_active || variant.stock <= 0;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          setSelectedVariantId(String(variant.id));
                          setQuantity(1);
                          setError("");
                        }}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? "border-[#3b2d24] bg-[#8a735e]/10 shadow-xs ring-1 ring-[#3b2d24]"
                            : isOutOfStock
                              ? "border-[#ebdcca] bg-stone-100/60 opacity-50 cursor-not-allowed"
                              : "border-[#d6c6b3] bg-white hover:border-[#8a735e]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#3b2d24]">
                            {variant.color} • {variant.size}
                          </p>
                          <p className="mt-0.5 text-xs sm:text-sm font-semibold text-[#8a735e]">
                            {Number(variant.price).toLocaleString("uz-UZ")} so‘m
                          </p>
                        </div>

                        {isSelected && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3b2d24] text-white">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="text-xs font-semibold text-rose-500">
                            {language === "ru" ? "нет" : "yo‘q"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY AND ADD TO CART ROW */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                {/* STEPPER COUNTER */}
                <div className="flex h-14 items-center rounded-full border border-[#d6c6b3] bg-white p-1.5 shadow-xs">
                  <button
                    type="button"
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[#3b2d24] transition hover:bg-[#f4efe6] disabled:opacity-30"
                  >
                    <Minus className="h-5 w-5" />
                  </button>

                  <span className="w-12 text-center font-serif text-lg font-bold text-[#3b2d24]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={incrementQty}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-[#3b2d24] transition hover:bg-[#f4efe6] disabled:opacity-30"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* ADD TO CART BUTTON */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="flex flex-1 items-center justify-center gap-2.5 rounded-full bg-[#3b2d24] px-8 py-4 text-base font-semibold tracking-wide text-white shadow-lg transition-all hover:bg-[#271f19] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>
                    {language === "ru" ? "Добавить в корзину" : "Savatchaga qo‘shish"}
                  </span>
                </button>
              </div>

              {/* TELEGRAM QUICK BUY BUTTON */}
              <button
                type="button"
                onClick={handleTelegramQuickBuy}
                disabled={!selectedVariant || selectedVariant.stock <= 0 || telegramLoading}
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#229ed9] py-4 text-base font-bold tracking-wide text-white shadow-md shadow-[#229ed9]/20 transition hover:bg-[#1e8ec3] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Send className="h-5 w-5" />
                <span>
                  {telegramLoading
                    ? (language === "ru" ? "Загрузка..." : "Yuklanmoqda...")
                    : (language === "ru" ? "Заказать в 1 клик через Telegram" : "Telegram orqali 1 klikda xarid")}
                </span>
              </button>

              {/* FEEDBACK NOTIFICATION */}
              {successToast && (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2.5">
                    <Check className="h-5 w-5 text-emerald-600" />
                    <span>
                      {language === "ru"
                        ? "Товар успешно добавлен в корзину!"
                        : "Mahsulot savatchaga muvaffaqiyatli qo‘shildi!"}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    className="underline hover:text-emerald-950 font-bold ml-2 shrink-0"
                  >
                    {language === "ru" ? "Открыть корзину →" : "Savatchaga o‘tish →"}
                  </Link>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* ========================= */}
            {/* ACCORDIONS / DETAILS TABS */}
            {/* ========================= */}
            <div className="divide-y divide-[#ebdcca] rounded-3xl border border-[#ebdcca] bg-white">
              {/* TAB 1: FABRIC & COMPOSITION */}
              <div className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenTab(openTab === "details" ? "" : "details")}
                  className="flex w-full items-center justify-between text-left font-serif text-lg font-bold text-[#3b2d24]"
                >
                  <span>{language === "ru" ? "Ткань и комплектация" : "Mato va to‘plam tarkibi"}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#8a735e] transition-transform duration-200 ${
                      openTab === "details" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openTab === "details" && (
                  <div className="mt-3.5 space-y-2 text-sm sm:text-base leading-relaxed text-[#6b584a]">
                    {product.fabric && (
                      <p>
                        <strong className="text-[#3b2d24]">
                          {language === "ru" ? "Материал: " : "Mato turi: "}
                        </strong>
                        {product.fabric}
                      </p>
                    )}
                    {product.composition && (
                      <p>
                        <strong className="text-[#3b2d24]">
                          {language === "ru" ? "Состав: " : "Tarkibi: "}
                        </strong>
                        {product.composition}
                      </p>
                    )}
                    {!product.fabric && !product.composition && (
                      <p>
                        {language === "ru"
                          ? "100% натуральный хлопок высшей категории. Изделие приятно к телу и дарит глубокий сон."
                          : "100% tabiiy va yuqori sifatli tola. Mahsulot uzoq yillar xizmat qiladi va shaklini yo‘qotmaydi."}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* TAB 2: CARE INSTRUCTIONS */}
              <div className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenTab(openTab === "care" ? "" : "care")}
                  className="flex w-full items-center justify-between text-left font-serif text-lg font-bold text-[#3b2d24]"
                >
                  <span>{language === "ru" ? "Рекомендации по уходу" : "Parvarish bo‘yicha tavsiyalar"}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#8a735e] transition-transform duration-200 ${
                      openTab === "care" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openTab === "care" && (
                  <div className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#6b584a]">
                    {product.care ? (
                      <p>{product.care}</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          {language === "ru"
                            ? "Стирка при температуре не выше 40°C"
                            : "40°C dan yuqori bo‘lmagan haroratda yuvish tavsiya etiladi"}
                        </li>
                        <li>
                          {language === "ru"
                            ? "Не использовать агрессивные отбеливатели"
                            : "Oqartiruvchi kuchli vositalardan foydalanmang"}
                        </li>
                        <li>
                          {language === "ru"
                            ? "Гладить при средней температуре"
                            : "O‘rtacha haroratda dazmollang"}
                        </li>
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* TAB 3: DELIVERY & PAYMENT */}
              <div className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenTab(openTab === "shipping" ? "" : "shipping")}
                  className="flex w-full items-center justify-between text-left font-serif text-lg font-bold text-[#3b2d24]"
                >
                  <span>{language === "ru" ? "Доставка и оплата" : "Yetkazib berish va to‘lov"}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#8a735e] transition-transform duration-200 ${
                      openTab === "shipping" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openTab === "shipping" && (
                  <div className="mt-3.5 space-y-2 text-sm sm:text-base leading-relaxed text-[#6b584a]">
                    <p>
                      <strong className="text-[#3b2d24]">{language === "ru" ? "Ташкент: " : "Toshkent: "}</strong>
                      {language === "ru"
                        ? "Бесплатная курьерская доставка прямо до вашей двери (0 сум)."
                        : "Kuryer orqali eshikkacha mutlaqo bepul yetkazib beriladi (0 so‘m)."}
                    </p>
                    <p>
                      <strong className="text-[#3b2d24]">{language === "ru" ? "Оплата: " : "To‘lov: "}</strong>
                      {language === "ru"
                        ? "Оплата наличными при получении заказа после проверки качества ткани."
                        : "Mahsulotni qabul qilib, ko‘zdan kechirgach kuryerga naqd to‘lov qilinadi."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* TRUST PILL BADGES */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-3 rounded-2xl border border-[#ebdcca] bg-white p-4 shadow-xs">
                <Truck className="h-6 w-6 shrink-0 text-[#8a735e]" />
                <span className="text-xs sm:text-sm font-bold text-[#3b2d24]">
                  {language === "ru" ? "Бесплатная доставка" : "Bepul yetkazish"}
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#ebdcca] bg-white p-4 shadow-xs">
                <ShieldCheck className="h-6 w-6 shrink-0 text-[#8a735e]" />
                <span className="text-xs sm:text-sm font-bold text-[#3b2d24]">
                  {language === "ru" ? "100% Качество" : "100% Kafolat"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;