import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api/client";

import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";

import { addToCart } from "../utils/cart";


function ProductDetailsPage() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const {
    language,
  } = useLanguage();


  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState("");

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // =========================
  // LOAD PRODUCT
  // =========================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response =
          await api.get(
            `/products/${slug}/`,
            {
              params: {
                lang: language,
              },
            }
          );


        const data =
          response.data;

        setProduct(data);


        const firstImage =
          data.images?.find(
            (image) =>
              image.is_primary
          )?.image ??
          data.images?.[0]?.image ??
          "";


        setSelectedImage(
          firstImage
        );


        const firstAvailableVariant =
          data.variants?.find(
            (variant) =>
              variant.is_active &&
              variant.stock > 0
          );


        if (
          firstAvailableVariant
        ) {
          setSelectedVariantId(
            String(
              firstAvailableVariant.id
            )
          );
        } else {
          setSelectedVariantId("");
        }


        setQuantity(1);

      } catch (err) {
        console.error(
          "Product load error:",
          err
        );

        setError(
          language === "ru"
            ? "Не удалось загрузить товар."
            : "Mahsulotni yuklashda xatolik yuz berdi."
        );

      } finally {
        setLoading(false);
      }
    };


    loadProduct();

  }, [
    slug,
    language,
  ]);


  // =========================
  // SELECTED VARIANT
  // =========================

  const selectedVariant =
    useMemo(() => {

      if (!product) {
        return null;
      }


      return (
        product.variants?.find(
          (variant) =>
            String(
              variant.id
            ) ===
            String(
              selectedVariantId
            )
        ) ?? null
      );

    }, [
      product,
      selectedVariantId,
    ]);


  const favorite =
    product
      ? isFavorite(
          product.id
        )
      : false;


  // =========================
  // FAVORITE
  // =========================

  const handleFavorite =
    async () => {

      if (!user) {
        navigate(
          "/login",
          {
            state: {
              from:
                `/products/${slug}`,
            },
          }
        );

        return;
      }


      try {
        await toggleFavorite(
          product.id
        );

      } catch (err) {
        console.error(
          "Favorite error:",
          err
        );

        setError(
          language === "ru"
            ? "Не удалось изменить избранное."
            : "Sevimli mahsulotni o‘zgartirishda xatolik yuz berdi."
        );
      }
    };


  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = () => {
    setError("");
    setSuccess("");


    if (!selectedVariant) {
      setError(
        language === "ru"
          ? "Выберите вариант товара."
          : "Iltimos, mahsulot variantini tanlang."
      );

      return;
    }


    if (
      !selectedVariant.is_active ||
      selectedVariant.stock <= 0
    ) {
      setError(
        language === "ru"
          ? "Этот вариант сейчас недоступен."
          : "Bu variant hozirda mavjud emas."
      );

      return;
    }


    if (
      quantity < 1 ||
      !Number.isInteger(
        quantity
      )
    ) {
      setError(
        language === "ru"
          ? "Количество должно быть положительным целым числом."
          : "Miqdor musbat butun son bo‘lishi kerak."
      );

      return;
    }


    if (
      quantity >
      selectedVariant.stock
    ) {
      setError(
        language === "ru"
          ? `На складе доступно только ${selectedVariant.stock} шт.`
          : `Omborda faqat ${selectedVariant.stock} dona mavjud.`
      );

      return;
    }


    try {
      addToCart(
        product,
        selectedVariant,
        quantity
      );


      setSuccess(
        language === "ru"
          ? "Товар добавлен в корзину."
          : "Mahsulot savatchaga qo‘shildi."
      );

    } catch (err) {
      setError(
        err.message
      );
    }
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-6">

        <p className="text-stone-500">
          {language === "ru"
            ? "Загрузка товара..."
            : "Mahsulot yuklanmoqda..."}
        </p>

      </div>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (
    error &&
    !product
  ) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

        <p className="text-red-600">
          {error}
        </p>

        <Link
          to="/catalog"
          className="mt-6 rounded-full bg-[#173f35] px-6 py-3 text-white"
        >
          {language === "ru"
            ? "Вернуться в каталог"
            : "Katalogga qaytish"}
        </Link>

      </div>
    );
  }


  if (!product) {
    return null;
  }


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* BACK */}
        <Link
          to="/catalog"
          className="text-sm font-medium text-[#52796f] hover:underline"
        >
          ←{" "}
          {language === "ru"
            ? "Вернуться в каталог"
            : "Katalogga qaytish"}
        </Link>


        <div className="mt-8 grid gap-12 lg:grid-cols-2">

          {/* ========================= */}
          {/* IMAGES */}
          {/* ========================= */}

          <div>

            <div className="aspect-[4/5] overflow-hidden rounded-[32px] bg-[#eee9df]">

              {selectedImage ? (
                <img
                  src={
                    selectedImage
                  }
                  alt={
                    product.name
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-stone-400">

                  {language === "ru"
                    ? "Нет изображения"
                    : "Rasm mavjud emas"}

                </div>
              )}

            </div>


            {product.images?.length >
              1 && (

              <div className="mt-4 grid grid-cols-4 gap-3">

                {product.images.map(
                  (image) => (

                    <button
                      key={
                        image.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image.image
                        )
                      }
                      className={`aspect-square overflow-hidden rounded-xl border-2 ${
                        selectedImage ===
                        image.image
                          ? "border-[#173f35]"
                          : "border-transparent"
                      }`}
                    >

                      <img
                        src={
                          image.image
                        }
                        alt={
                          product.name
                        }
                        className="h-full w-full object-cover"
                      />

                    </button>

                  )
                )}

              </div>
            )}

          </div>


          {/* ========================= */}
          {/* PRODUCT INFO */}
          {/* ========================= */}

          <div>

            <p className="text-sm font-medium text-[#52796f]">
              {
                product.category
                  ?.name
              }
            </p>


            {/* TITLE */}
            <div className="mt-3 flex items-start justify-between gap-5">

              <h1 className="text-4xl font-semibold leading-tight text-[#173f35]">
                {
                  product.name
                }
              </h1>


              <button
                type="button"
                onClick={
                  handleFavorite
                }
                aria-label={
                  favorite
                    ? language === "ru"
                      ? "Удалить из избранного"
                      : "Sevimlidan o‘chirish"
                    : language === "ru"
                      ? "Добавить в избранное"
                      : "Sevimliga qo‘shish"
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-2xl text-[#173f35] shadow-sm transition hover:scale-105"
              >
                {favorite
                  ? "♥"
                  : "♡"}
              </button>

            </div>


            {/* DESCRIPTION */}
            {product.description && (
              <p className="mt-5 leading-7 text-stone-600">
                {
                  product.description
                }
              </p>
            )}


            {/* PRICE */}
            <div className="mt-8">

              <p className="text-sm font-medium text-stone-600">

                {language === "ru"
                  ? "Цена"
                  : "Narx"}

              </p>


              <p className="mt-1 text-3xl font-semibold text-[#173f35]">

                {selectedVariant
                  ? `${Number(
                      selectedVariant.price
                    ).toLocaleString(
                      "uz-UZ"
                    )} so‘m`
                  : language === "ru"
                    ? "Выберите вариант"
                    : "Variant tanlang"}

              </p>

            </div>


            {/* VARIANT */}
            <div className="mt-8">

              <label
                htmlFor="variant"
                className="mb-2 block font-medium text-stone-700"
              >
                {language === "ru"
                  ? "Цвет и размер"
                  : "Rang va o‘lcham"}
              </label>


              <select
                id="variant"
                value={
                  selectedVariantId
                }
                onChange={(
                  event
                ) => {

                  setSelectedVariantId(
                    event.target
                      .value
                  );

                  setQuantity(1);

                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-[#173f35]"
              >

                <option value="">

                  {language === "ru"
                    ? "Выберите вариант"
                    : "Variantni tanlang"}

                </option>


                {product.variants?.map(
                  (variant) => (

                    <option
                      key={
                        variant.id
                      }
                      value={
                        variant.id
                      }
                      disabled={
                        !variant.is_active ||
                        variant.stock <=
                          0
                      }
                    >

                      {variant.color}
                      {" — "}
                      {variant.size}
                      {" — "}

                      {Number(
                        variant.price
                      ).toLocaleString(
                        "uz-UZ"
                      )}

                      {" so‘m"}

                      {variant.stock <=
                      0
                        ? language ===
                          "ru"
                          ? " — Нет в наличии"
                          : " — Tugagan"
                        : ""}

                    </option>

                  )
                )}

              </select>

            </div>


            {/* STOCK */}
            {selectedVariant && (

              <div className="mt-3 text-sm">

                {selectedVariant.stock >
                0 ? (

                  <span className="text-green-700">

                    {language === "ru"
                      ? `В наличии: ${selectedVariant.stock} шт.`
                      : `Omborda: ${selectedVariant.stock} dona`}

                  </span>

                ) : (

                  <span className="text-red-600">

                    {language === "ru"
                      ? "Нет в наличии"
                      : "Omborda mavjud emas"}

                  </span>

                )}

              </div>

            )}


            {/* QUANTITY */}
            <div className="mt-8">

              <label
                htmlFor="quantity"
                className="mb-2 block font-medium text-stone-700"
              >
                {language === "ru"
                  ? "Количество"
                  : "Miqdor"}
              </label>


              <input
                id="quantity"
                type="number"
                min="1"
                max={
                  selectedVariant
                    ?.stock ?? 1
                }
                value={
                  quantity
                }
                onChange={(
                  event
                ) =>
                  setQuantity(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
                className="w-28 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#173f35]"
              />

            </div>


            {/* ERROR */}
            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {/* SUCCESS */}
            {success && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                {success}
              </div>
            )}


            {/* CART BUTTON */}
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                !selectedVariant ||
                selectedVariant.stock <=
                  0
              }
              className="mt-6 w-full rounded-full bg-[#173f35] px-7 py-4 font-medium text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {language === "ru"
                ? "Добавить в корзину"
                : "Savatchaga qo‘shish"}

            </button>


            {/* ========================= */}
            {/* DETAILS */}
            {/* ========================= */}

            <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">

              {product.fabric && (

                <div className="py-5">

                  <h3 className="font-semibold text-[#173f35]">
                    {language === "ru"
                      ? "Ткань"
                      : "Mato"}
                  </h3>

                  <p className="mt-2 leading-7 text-stone-600">
                    {
                      product.fabric
                    }
                  </p>

                </div>

              )}


              {product.composition && (

                <div className="py-5">

                  <h3 className="font-semibold text-[#173f35]">
                    {language === "ru"
                      ? "Состав комплекта"
                      : "To‘plam tarkibi"}
                  </h3>

                  <p className="mt-2 leading-7 text-stone-600">
                    {
                      product.composition
                    }
                  </p>

                </div>

              )}


              {product.care && (

                <div className="py-5">

                  <h3 className="font-semibold text-[#173f35]">
                    {language === "ru"
                      ? "Уход"
                      : "Parvarish"}
                  </h3>

                  <p className="mt-2 leading-7 text-stone-600">
                    {
                      product.care
                    }
                  </p>

                </div>

              )}

            </div>


            {/* DELIVERY */}
            <div className="mt-8 rounded-2xl bg-[#eee7da] p-5">

              <p className="font-medium text-[#173f35]">

                {language === "ru"
                  ? "Бесплатная доставка"
                  : "Bepul yetkazib berish"}

              </p>

              <p className="mt-1 text-sm leading-6 text-stone-600">

                {language === "ru"
                  ? "Доставка осуществляется только по городу Ташкент."
                  : "Yetkazib berish faqat Toshkent shahri hududida."}

              </p>

              <p className="mt-2 text-sm leading-6 text-stone-600">

                {language === "ru"
                  ? "Оплата наличными при получении товара."
                  : "To‘lov mahsulotni qabul qilganda naqd amalga oshiriladi."}

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default ProductDetailsPage;