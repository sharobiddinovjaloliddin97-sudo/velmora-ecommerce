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
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../utils/cart";

import {
  useLanguage,
} from "../context/LanguageContext";


function CartPage() {
  const navigate =
    useNavigate();

  const {
    language,
  } = useLanguage();


  const [
    cart,
    setCart,
  ] = useState(
    getCart()
  );

  const [
    error,
    setError,
  ] = useState("");


  // =========================
  // CART EVENTS
  // =========================

  useEffect(() => {
    const refreshCart = () => {
      setCart(
        getCart()
      );
    };


    window.addEventListener(
      "cart-updated",
      refreshCart
    );


    return () => {
      window.removeEventListener(
        "cart-updated",
        refreshCart
      );
    };
  }, []);


  // =========================
  // TOTAL
  // =========================

  const total =
    useMemo(() => {

      return cart.reduce(
        (
          sum,
          item
        ) =>
          sum +
          Number(
            item.price
          ) *
            item.quantity,
        0
      );

    }, [cart]);


  // =========================
  // QUANTITY
  // =========================

  const handleQuantity = (
    item,
    newQuantity
  ) => {

    setError("");


    if (newQuantity < 1) {
      return;
    }


    if (
      newQuantity >
      item.stock
    ) {
      setError(
        language === "ru"
          ? `На складе доступно только ${item.stock} шт.`
          : `Omborda faqat ${item.stock} dona mavjud.`
      );

      return;
    }


    try {
      updateCartQuantity(
        item.variant_id,
        newQuantity
      );

    } catch (err) {
      setError(
        err.message
      );
    }
  };


  // =========================
  // REMOVE
  // =========================

  const handleRemove = (
    variantId
  ) => {

    setError("");

    removeFromCart(
      variantId
    );
  };


  // =========================
  // EMPTY CART
  // =========================

  if (
    cart.length === 0
  ) {
    return (
      <div className="bg-[#f8f5ef]">

        <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-6 text-center">

          <h1 className="text-4xl font-semibold text-[#173f35]">

            {language === "ru"
              ? "Ваша корзина пуста"
              : "Savatchangiz bo‘sh"}

          </h1>


          <p className="mt-4 max-w-md leading-7 text-stone-600">

            {language === "ru"
              ? "Добавьте понравившиеся товары в корзину."
              : "O‘zingizga yoqqan mahsulotlarni savatchaga qo‘shing."}

          </p>


          <Link
            to="/catalog"
            className="mt-7 rounded-full bg-[#173f35] px-7 py-3.5 font-medium text-white"
          >

            {language === "ru"
              ? "Перейти в каталог"
              : "Katalogga o‘tish"}

          </Link>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8f5ef]">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
          Velmora
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-4xl">

          {language === "ru"
            ? "Корзина"
            : "Savatcha"}

        </h1>


        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[1fr_360px]">

          {/* ========================= */}
          {/* ITEMS */}
          {/* ========================= */}

          <div className="space-y-4 sm:space-y-5">

            {cart.map(
              (item) => (

                <article
                  key={
                    item.variant_id
                  }
                  className="grid grid-cols-[84px_1fr] gap-3.5 rounded-2xl bg-white p-3.5 shadow-sm sm:grid-cols-[140px_1fr] sm:gap-5 sm:rounded-[28px] sm:p-5"
                >

                  {/* IMAGE */}
                  <Link
                    to={`/products/${item.product_slug}`}
                    className="aspect-square overflow-hidden rounded-xl bg-[#eee9df] sm:rounded-2xl"
                  >

                    {item.image ? (

                      <img
                        src={
                          item.image
                        }
                        alt={
                          item.product_name
                        }
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center px-2 text-center text-[10px] text-stone-400 sm:px-3 sm:text-xs">

                        {language === "ru"
                          ? "Нет изображения"
                          : "Rasm mavjud emas"}

                      </div>

                    )}

                  </Link>


                  {/* INFO */}
                  <div className="flex flex-col justify-between">

                    <div>

                      <div className="flex items-start justify-between gap-3 sm:gap-5">

                        <div className="min-w-0 flex-1">

                          <Link
                            to={`/products/${item.product_slug}`}
                            className="line-clamp-2 text-base font-semibold text-[#173f35] break-words hover:underline sm:text-xl"
                          >
                            {
                              item.product_name
                            }
                          </Link>


                          <p className="mt-1 text-xs text-stone-500 sm:mt-2 sm:text-sm">

                            {item.color}
                            {" · "}
                            {item.size}

                          </p>


                          <p className="mt-1 text-[11px] text-stone-400 sm:text-xs">
                            SKU:{" "}
                            {
                              item.sku
                            }
                          </p>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            handleRemove(
                              item.variant_id
                            )
                          }
                          className="shrink-0 text-xs font-medium text-red-600 hover:underline sm:text-sm"
                        >

                          {language === "ru"
                            ? "Удалить"
                            : "O‘chirish"}

                        </button>

                      </div>


                      <p className="mt-3 text-base font-semibold text-[#173f35] sm:mt-4 sm:text-lg">

                        {Number(
                          item.price
                        ).toLocaleString(
                          "uz-UZ"
                        )}{" "}
                        so‘m

                      </p>

                    </div>


                    {/* QUANTITY */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-6 sm:gap-4">

                      <div className="flex items-center rounded-full border border-stone-300">

                        <button
                          type="button"
                          disabled={
                            item.quantity <=
                            1
                          }
                          onClick={() =>
                            handleQuantity(
                              item,
                              item.quantity -
                                1
                            )
                          }
                          className="h-8 w-8 text-lg disabled:opacity-30 sm:h-10 sm:w-10 sm:text-xl"
                        >
                          −
                        </button>


                        <span className="min-w-8 text-center text-sm font-medium sm:min-w-10 sm:text-base">
                          {
                            item.quantity
                          }
                        </span>


                        <button
                          type="button"
                          disabled={
                            item.quantity >=
                            item.stock
                          }
                          onClick={() =>
                            handleQuantity(
                              item,
                              item.quantity +
                                1
                            )
                          }
                          className="h-8 w-8 text-lg disabled:opacity-30 sm:h-10 sm:w-10 sm:text-xl"
                        >
                          +
                        </button>

                      </div>


                      <div className="text-right">

                        <p className="text-[11px] text-stone-500 sm:text-xs">

                          {language === "ru"
                            ? "Итого"
                            : "Jami"}

                        </p>

                        <p className="text-sm font-semibold text-[#173f35] sm:text-base">

                          {(
                            Number(
                              item.price
                            ) *
                            item.quantity
                          ).toLocaleString(
                            "uz-UZ"
                          )}{" "}
                          so‘m

                        </p>

                      </div>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>


          {/* ========================= */}
          {/* SUMMARY */}
          {/* ========================= */}

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-7">

            <h2 className="text-2xl font-semibold text-[#173f35]">

              {language === "ru"
                ? "Ваш заказ"
                : "Buyurtmangiz"}

            </h2>


            <div className="mt-6 flex justify-between text-stone-600">

              <span>
                {language === "ru"
                  ? "Товары"
                  : "Mahsulotlar"}
              </span>

              <span>
                {total.toLocaleString(
                  "uz-UZ"
                )}{" "}
                so‘m
              </span>

            </div>


            <div className="mt-4 flex justify-between text-stone-600">

              <span>
                {language === "ru"
                  ? "Доставка"
                  : "Yetkazib berish"}
              </span>

              <span className="font-medium text-green-700">

                {language === "ru"
                  ? "Бесплатно"
                  : "Bepul"}

              </span>

            </div>


            <div className="mt-6 border-t border-stone-200 pt-6">

              <div className="flex items-center justify-between">

                <span className="text-lg font-semibold">
                  {language === "ru"
                    ? "Итого"
                    : "Jami"}
                </span>

                <span className="text-2xl font-semibold text-[#173f35]">

                  {total.toLocaleString(
                    "uz-UZ"
                  )}{" "}
                  so‘m

                </span>

              </div>

            </div>


            <p className="mt-5 text-xs leading-5 text-stone-500">

              {language === "ru"
                ? "Окончательная цена и наличие товара будут повторно проверены сервером при оформлении заказа."
                : "Buyurtma rasmiylashtirilganda yakuniy narx va mahsulot mavjudligi server tomonidan qayta tekshiriladi."}

            </p>


            <div className="mt-5 rounded-2xl bg-[#eee7da] p-4">

              <p className="font-medium text-[#173f35]">

                {language === "ru"
                  ? "Бесплатная доставка"
                  : "Bepul yetkazib berish"}

              </p>

              <p className="mt-1 text-sm leading-6 text-stone-600">

                {language === "ru"
                  ? "Только по городу Ташкент."
                  : "Faqat Toshkent shahri bo‘ylab."}

              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/checkout"
                )
              }
              className="mt-6 w-full rounded-full bg-[#173f35] px-6 py-4 font-medium text-white transition hover:bg-[#245448]"
            >

              {language === "ru"
                ? "Оформить заказ"
                : "Buyurtma berish"}

            </button>


            <Link
              to="/catalog"
              className="mt-4 block text-center text-sm font-medium text-[#52796f] hover:underline"
            >

              {language === "ru"
                ? "Продолжить покупки"
                : "Xaridni davom ettirish"}

            </Link>

          </aside>

        </div>

      </div>

    </div>
  );
}


export default CartPage;