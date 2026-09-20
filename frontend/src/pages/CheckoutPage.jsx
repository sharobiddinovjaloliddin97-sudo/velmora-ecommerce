import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  clearCart,
  getCart,
} from "../utils/cart";


const DISTRICTS = [
  {
    value: "BEKTEMIR",
    uz: "Bektemir",
    ru: "Бектемир",
  },
  {
    value: "CHILONZOR",
    uz: "Chilonzor",
    ru: "Чиланзар",
  },
  {
    value: "MIROBOD",
    uz: "Mirobod",
    ru: "Мирабад",
  },
  {
    value: "MIRZO_ULUGBEK",
    uz: "Mirzo Ulug‘bek",
    ru: "Мирзо-Улугбек",
  },
  {
    value: "OLMAZOR",
    uz: "Olmazor",
    ru: "Алмазар",
  },
  {
    value: "SERGELI",
    uz: "Sergeli",
    ru: "Сергелий",
  },
  {
    value: "SHAYXONTOHUR",
    uz: "Shayxontohur",
    ru: "Шайхантахур",
  },
  {
    value: "UCHTEPA",
    uz: "Uchtepa",
    ru: "Учтепа",
  },
  {
    value: "YAKKASAROY",
    uz: "Yakkasaroy",
    ru: "Яккасарай",
  },
  {
    value: "YASHNOBOD",
    uz: "Yashnobod",
    ru: "Яшнабад",
  },
  {
    value: "YUNUSOBOD",
    uz: "Yunusobod",
    ru: "Юнусабад",
  },
  {
    value: "YANGIHAYOT",
    uz: "Yangihayot",
    ru: "Янги Хаёт",
  },
];


function CheckoutPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    language,
  } = useLanguage();


  const cart = getCart();


  const [form, setForm] = useState({
    recipient_name:
      user?.first_name || "",

    phone: "",
    district: "",
    street: "",
    house: "",
    apartment: "",
    landmark: "",
    comment: "",
  });


  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  const frontendTotal =
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


  const handleChange = (
    event
  ) => {

    setForm({
      ...form,

      [event.target.name]:
        event.target.value,
    });
  };


  const getErrorMessage = (
    data
  ) => {

    if (!data) {
      return language === "ru"
        ? "Не удалось создать заказ."
        : "Buyurtma yaratishda xatolik yuz berdi.";
    }


    if (
      typeof data ===
      "string"
    ) {
      return data;
    }


    if (
      data.detail
    ) {
      return Array.isArray(
        data.detail
      )
        ? data.detail[0]
        : data.detail;
    }


    if (
      data.items
    ) {
      return Array.isArray(
        data.items
      )
        ? data.items.join(" ")
        : String(
            data.items
          );
    }


    if (
      data.district
    ) {
      return Array.isArray(
        data.district
      )
        ? data.district[0]
        : data.district;
    }


    if (
      data.phone
    ) {
      return Array.isArray(
        data.phone
      )
        ? data.phone[0]
        : data.phone;
    }


    if (
      data.recipient_name
    ) {
      return Array.isArray(
        data.recipient_name
      )
        ? data.recipient_name[0]
        : data.recipient_name;
    }


    const firstValue =
      Object.values(
        data
      )[0];


    if (
      Array.isArray(
        firstValue
      )
    ) {
      return firstValue[0];
    }


    return language === "ru"
      ? "Не удалось создать заказ."
      : "Buyurtma yaratishda xatolik yuz berdi.";
  };


  const sendCheckout = async (idempotencyKey) => {
    return api.post(
      "/orders/checkout/",
      {
        recipient_name: form.recipient_name,
        phone: form.phone,
        city: "Toshkent",
        district: form.district,
        street: form.street,
        house: form.house,
        apartment: form.apartment,
        landmark: form.landmark,
        comment: form.comment,

        items: cart.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      },
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    );
  };

  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();

      setError("");


      if (
        cart.length === 0
      ) {
        setError(
          language === "ru"
            ? "Ваша корзина пуста."
            : "Savatchangiz bo‘sh."
        );

        return;
      }


      if (
        !form.recipient_name.trim()
      ) {
        setError(
          language === "ru"
            ? "Введите имя получателя."
            : "Qabul qiluvchi ismini kiriting."
        );

        return;
      }


      if (
        !form.phone.trim()
      ) {
        setError(
          language === "ru"
            ? "Введите номер телефона."
            : "Telefon raqamini kiriting."
        );

        return;
      }


      if (
        !form.district
      ) {
        setError(
          language === "ru"
            ? "Выберите район."
            : "Tumanni tanlang."
        );

        return;
      }


      if (
        !form.street.trim() ||
        !form.house.trim()
      ) {
        setError(
          language === "ru"
            ? "Укажите улицу и дом."
            : "Ko‘cha va uy raqamini kiriting."
        );

        return;
      }


      setSubmitting(true);


      try {
        const idempotencyKey = crypto.randomUUID();

        const response = await sendCheckout(
          idempotencyKey
        );

        clearCart();

        navigate(
          "/order-success",
          {
            replace: true,
            state: {
              order: response.data,
            },
          }
        );

      } catch (err) {
        console.error(
          "Checkout error:",
          err.response?.data ||
            err
        );


        setError(
          getErrorMessage(
            err.response?.data
          )
        );

      } finally {
        setSubmitting(false);
      }
    };


  // =========================
  // EMPTY CART
  // =========================

  if (
    cart.length === 0
  ) {
    return (
      <div className="bg-[#f8f5ef]">

        <div className="mx-auto flex min-h-[65vh] max-w-7xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">

          <h1 className="text-2xl font-semibold text-[#173f35] sm:text-4xl">

            {language === "ru"
              ? "Ваша корзина пуста"
              : "Savatchangiz bo‘sh"}

          </h1>


          <p className="mt-4 max-w-md leading-7 text-stone-600">

            {language === "ru"
              ? "Добавьте товары в корзину перед оформлением заказа."
              : "Buyurtma berishdan oldin savatchaga mahsulot qo‘shing."}

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
            ? "Оформление заказа"
            : "Buyurtmani rasmiylashtirish"}

        </h1>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">

          {language === "ru"
            ? "Заполните данные для доставки. Доставка осуществляется только по городу Ташкент."
            : "Yetkazib berish ma’lumotlarini kiriting. Yetkazib berish faqat Toshkent shahri bo‘ylab amalga oshiriladi."}

        </p>


        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[1fr_380px]">

          {/* ========================= */}
          {/* CHECKOUT FORM */}
          {/* ========================= */}

          <form
            onSubmit={
              handleSubmit
            }
            className="rounded-2xl bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-7"
          >

            <h2 className="text-xl font-semibold text-[#173f35] sm:text-2xl">

              {language === "ru"
                ? "Данные доставки"
                : "Yetkazib berish ma’lumotlari"}

            </h2>


            <div className="mt-7 grid gap-5 sm:grid-cols-2">

              {/* NAME */}
              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Имя получателя"
                    : "Qabul qiluvchi ism"}

                </label>


                <input
                  name="recipient_name"
                  required
                  value={
                    form.recipient_name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    language === "ru"
                      ? "Введите имя"
                      : "Ismingizni kiriting"
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* PHONE */}
              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Телефон"
                    : "Telefon"}

                </label>


                <input
                  name="phone"
                  type="tel"
                  required
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="+998 90 123 45 67"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* CITY */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Город"
                    : "Shahar"}

                </label>


                <input
                  value={
                    language === "ru"
                      ? "Ташкент"
                      : "Toshkent"
                  }
                  disabled
                  className="w-full rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-stone-600"
                />

              </div>


              {/* DISTRICT */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Район"
                    : "Tuman"}

                </label>


                <select
                  name="district"
                  required
                  value={
                    form.district
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-[#173f35]"
                >

                  <option value="">

                    {language === "ru"
                      ? "Выберите район"
                      : "Tumanni tanlang"}

                  </option>


                  {DISTRICTS.map(
                    (
                      district
                    ) => (

                      <option
                        key={
                          district.value
                        }
                        value={
                          district.value
                        }
                      >
                        {
                          district[
                            language
                          ]
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* STREET */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Улица"
                    : "Ko‘cha"}

                </label>


                <input
                  name="street"
                  required
                  value={
                    form.street
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* HOUSE */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Дом"
                    : "Uy"}

                </label>


                <input
                  name="house"
                  required
                  value={
                    form.house
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* APARTMENT */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Квартира"
                    : "Xonadon"}

                </label>


                <input
                  name="apartment"
                  value={
                    form.apartment
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* LANDMARK */}
              <div>

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Ориентир"
                    : "Mo‘ljal"}

                </label>


                <input
                  name="landmark"
                  value={
                    form.landmark
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>


              {/* COMMENT */}
              <div className="sm:col-span-2">

                <label className="mb-2 block text-sm font-medium text-stone-700">

                  {language === "ru"
                    ? "Комментарий"
                    : "Izoh"}

                </label>


                <textarea
                  name="comment"
                  rows="4"
                  value={
                    form.comment
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    language === "ru"
                      ? "Дополнительная информация для курьера..."
                      : "Kuryer uchun qo‘shimcha ma’lumot..."
                  }
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
                />

              </div>

            </div>


            {/* ERROR */}
            {error && (

              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>

            )}


            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                submitting
              }
              className="mt-7 w-full rounded-full bg-[#173f35] px-6 py-4 font-medium text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {submitting
                ? language ===
                  "ru"
                  ? "Создание заказа..."
                  : "Buyurtma yaratilmoqda..."
                : language ===
                    "ru"
                  ? "Подтвердить заказ"
                  : "Buyurtmani tasdiqlash"}

            </button>

          </form>


          {/* ========================= */}
          {/* ORDER SUMMARY */}
          {/* ========================= */}

          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-7">

            <h2 className="text-xl font-semibold text-[#173f35]">

              {language === "ru"
                ? "Ваш заказ"
                : "Buyurtmangiz"}

            </h2>


            <div className="mt-5 space-y-4">

              {cart.map(
                (
                  item
                ) => (

                  <div
                    key={
                      item.variant_id
                    }
                    className="border-b border-stone-100 pb-4"
                  >

                    <p className="font-medium text-[#173f35] break-words">
                      {
                        item.product_name
                      }
                    </p>


                    <p className="mt-1 text-sm text-stone-500">
                      {item.color}
                      {" · "}
                      {item.size}
                    </p>


                    <div className="mt-2 flex justify-between gap-4 text-sm">

                      <span>

                        {
                          item.quantity
                        }{" "}

                        {language === "ru"
                          ? "шт."
                          : "dona"}

                      </span>


                      <span>

                        {(
                          Number(
                            item.price
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "uz-UZ"
                        )}{" "}
                        so‘m

                      </span>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* DELIVERY */}
            <div className="mt-5 flex justify-between gap-4">

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


            {/* TOTAL */}
            <div className="mt-5 border-t border-stone-200 pt-5">

              <div className="flex justify-between gap-4">

                <span className="font-semibold">

                  {language === "ru"
                    ? "Итого"
                    : "Jami"}

                </span>


                <span className="text-xl font-semibold text-[#173f35]">

                  {frontendTotal.toLocaleString(
                    "uz-UZ"
                  )}{" "}
                  so‘m

                </span>

              </div>


              <p className="mt-3 text-xs leading-5 text-stone-500">

                {language === "ru"
                  ? "Окончательная сумма рассчитывается сервером по актуальной цене товара в базе данных."
                  : "Yakuniy summa server tomonidan bazadagi amaldagi narx asosida hisoblanadi."}

              </p>

            </div>


            {/* PAYMENT */}
            <div className="mt-6 rounded-2xl bg-[#eee7da] p-4">

              <p className="font-medium text-[#173f35]">

                {language === "ru"
                  ? "Способ оплаты"
                  : "To‘lov usuli"}

              </p>


              <p className="mt-1 text-sm leading-6 text-stone-600">

                {language === "ru"
                  ? "Наличными при получении товара"
                  : "Mahsulotni qabul qilganda naqd to‘lash"}

              </p>

            </div>


            {/* BACK */}
            <Link
              to="/cart"
              className="mt-5 block text-center text-sm font-medium text-[#52796f] hover:underline"
            >

              ←{" "}
              {language === "ru"
                ? "Вернуться в корзину"
                : "Savatchaga qaytish"}

            </Link>

          </aside>

        </div>

      </div>

    </div>
  );
}


export default CheckoutPage;