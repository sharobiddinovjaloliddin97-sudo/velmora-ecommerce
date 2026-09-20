import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api/client";

import PasswordInput from "../components/PasswordInput";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useFavorites,
} from "../context/FavoritesContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getOrderStatusLabel,
} from "../utils/orderLabels";


function AccountPage() {
  const {
    user,
    setUser,
  } = useAuth();

  const {
    language,
  } = useLanguage();

  const {
    removeFavorite,
  } = useFavorites();

  const [profile, setProfile] =
    useState({
      first_name: "",
      last_name: "",
      email: "",
    });


  const [orders, setOrders] =
    useState([]);

  const [favorites, setFavorites] =
    useState([]);


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // CHANGE PASSWORD
  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    passwordMessage,
    setPasswordMessage,
  ] = useState("");

  const [
    passwordError,
    setPasswordError,
  ] = useState("");


  // =========================
  // LOAD ACCOUNT DATA
  // =========================

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get(
        "/auth/profile/"
      ),

      api.get(
        "/orders/"
      ),

      api.get(
        "/favorites/",
        {
          params: {
            lang: language,
          },
        }
      ),
    ])
      .then(
        ([
          profileResponse,
          ordersResponse,
          favoritesResponse,
        ]) => {
          if (cancelled) {
            return;
          }

          setProfile(
            profileResponse.data
          );

          setOrders(
            ordersResponse.data.results ??
              ordersResponse.data
          );

          setFavorites(
            favoritesResponse.data.results ??
              favoritesResponse.data
          );

          setError("");
        }
      )
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Account load error:",
          err.response?.data || err
        );

        setError(
          language === "ru"
            ? "Не удалось загрузить данные кабинета."
            : "Kabinet ma’lumotlarini yuklashda xatolik yuz berdi."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });


    return () => {
      cancelled = true;
    };
  }, [language]);


  // =========================
  // PROFILE
  // =========================

  const handleProfileChange =
    (event) => {

      setProfile({
        ...profile,

        [event.target.name]:
          event.target.value,
      });
    };


  const saveProfile =
    async (event) => {

      event.preventDefault();

      setSaving(true);
      setError("");
      setMessage("");

      try {
        const response = await api.patch(
          "/auth/profile/",
          {
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
          }
        );


        setProfile(
          response.data
        );

        setUser(
          response.data
        );


        setMessage(
          language === "ru"
            ? "Профиль успешно сохранён."
            : "Profil muvaffaqiyatli saqlandi."
        );

      } catch (err) {
        console.error(
          "Profile save error:",
          err.response?.data ||
            err
        );

        const data =
          err.response?.data;


        setError(
          data?.email?.[0] ||
          (
            language === "ru"
              ? "Не удалось сохранить профиль."
              : "Profilni saqlashda xatolik yuz berdi."
          )
        );

      } finally {
        setSaving(false);
      }
    };


  // =========================
  // CHANGE PASSWORD
  // =========================

  const handlePasswordChange =
    (event) => {

      setPasswordForm({
        ...passwordForm,

        [event.target.name]:
          event.target.value,
      });
    };


  const changePassword =
    async (event) => {

      event.preventDefault();

      setPasswordError("");
      setPasswordMessage("");


      if (
        passwordForm.new_password !==
        passwordForm.new_password_confirm
      ) {
        setPasswordError(
          language === "ru"
            ? "Новые пароли не совпадают."
            : "Yangi parollar bir xil emas."
        );

        return;
      }


      setChangingPassword(true);


      try {
        const response = await api.post(
          "/auth/change-password/",
          passwordForm
        );


        setPasswordMessage(
          response.data?.detail ||
          (
            language === "ru"
              ? "Пароль успешно изменён."
              : "Parol muvaffaqiyatli o‘zgartirildi."
          )
        );


        setPasswordForm({
          old_password: "",
          new_password: "",
          new_password_confirm: "",
        });

      } catch (err) {
        console.error(
          "Change password error:",
          err.response?.data ||
            err
        );


        const data =
          err.response?.data;


        if (
          data?.old_password?.[0]
        ) {
          setPasswordError(
            data.old_password[0]
          );

        } else if (
          data?.new_password?.[0]
        ) {
          setPasswordError(
            data.new_password[0]
          );

        } else if (
          data?.new_password_confirm?.[0]
        ) {
          setPasswordError(
            data.new_password_confirm[0]
          );

        } else if (
          data?.non_field_errors?.[0]
        ) {
          setPasswordError(
            data.non_field_errors[0]
          );

        } else {
          setPasswordError(
            language === "ru"
              ? "Не удалось изменить пароль."
              : "Parolni o‘zgartirishda xatolik yuz berdi."
          );
        }

      } finally {
        setChangingPassword(false);
      }
    };


  // =========================
  // FAVORITES
  // =========================

  const handleRemoveFavorite =
    async (productId) => {

      try {
        await removeFavorite(productId);

        setFavorites(
          (prev) =>
            prev.filter(
              (favorite) =>
                favorite.product.id !==
                productId
            )
        );

      } catch (err) {
        console.error(
          "Remove favorite error:",
          err
        );

        setError(
          language === "ru"
            ? "Не удалось удалить товар из избранного."
            : "Sevimli mahsulotni o‘chirishda xatolik yuz berdi."
        );
      }
    };


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <p className="text-stone-500">
          {language === "ru"
            ? "Загрузка..."
            : "Yuklanmoqda..."}
        </p>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8f5ef] pt-4 sm:pt-6 md:pt-0">

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
          Velmora
        </p>


        <h1 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-4xl">

          {language === "ru"
            ? "Личный кабинет"
            : "Shaxsiy kabinet"}

        </h1>


        <p className="mt-2 text-stone-600">

          {language === "ru"
            ? "Здравствуйте"
            : "Salom"}
          ,{" "}

          {user?.first_name}

        </p>


        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}


        {message && (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}


        {/* ========================= */}
        {/* PROFILE */}
        {/* ========================= */}

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:mt-10 sm:rounded-[30px] sm:p-7">

          <h2 className="text-xl font-semibold text-[#173f35] sm:text-2xl">

            {language === "ru"
              ? "Профиль"
              : "Profil"}

          </h2>


          <form
            onSubmit={
              saveProfile
            }
            className="mt-6 grid gap-5 md:grid-cols-2"
          >

            <div>

              <label className="mb-2 block text-sm font-medium">

                {language === "ru"
                  ? "Имя"
                  : "Ism"}

              </label>

              <input
                name="first_name"
                value={
                  profile.first_name
                }
                onChange={
                  handleProfileChange
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">

                {language === "ru"
                  ? "Фамилия"
                  : "Familiya"}

              </label>

              <input
                name="last_name"
                value={
                  profile.last_name
                }
                onChange={
                  handleProfileChange
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />

            </div>


            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={
                  profile.email
                }
                onChange={
                  handleProfileChange
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3"
              />

            </div>


            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={
                  saving
                }
                className="w-full rounded-full bg-[#173f35] px-7 py-3 font-medium text-white transition hover:bg-[#245448] disabled:opacity-50 sm:w-auto"
              >

                {saving
                  ? language === "ru"
                    ? "Сохранение..."
                    : "Saqlanmoqda..."
                  : language === "ru"
                    ? "Сохранить профиль"
                    : "Profilni saqlash"}

              </button>

            </div>

          </form>

        </section>


        {/* ========================= */}
        {/* CHANGE PASSWORD */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:mt-8 sm:rounded-[30px] sm:p-7">

          <h2 className="text-xl font-semibold text-[#173f35] sm:text-2xl">

            {language === "ru"
              ? "Изменить пароль"
              : "Parolni o‘zgartirish"}

          </h2>


          <form
            onSubmit={
              changePassword
            }
            className="mt-6 grid gap-5 md:grid-cols-2"
          >

            <div className="md:col-span-2">

              <label
                htmlFor="old_password"
                className="mb-2 block text-sm font-medium"
              >

                {language === "ru"
                  ? "Текущий пароль"
                  : "Hozirgi parol"}

              </label>

              <PasswordInput
                id="old_password"
                name="old_password"
                required
                autoComplete="current-password"
                value={
                  passwordForm.old_password
                }
                onChange={
                  handlePasswordChange
                }
                showLabel={
                  language === "ru"
                    ? "Показать пароль"
                    : "Parolni ko‘rsatish"
                }
                hideLabel={
                  language === "ru"
                    ? "Скрыть пароль"
                    : "Parolni yashirish"
                }
                className="rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
              />

            </div>


            <div>

              <label
                htmlFor="new_password"
                className="mb-2 block text-sm font-medium"
              >

                {language === "ru"
                  ? "Новый пароль"
                  : "Yangi parol"}

              </label>

              <PasswordInput
                id="new_password"
                name="new_password"
                required
                autoComplete="new-password"
                value={
                  passwordForm.new_password
                }
                onChange={
                  handlePasswordChange
                }
                showLabel={
                  language === "ru"
                    ? "Показать пароль"
                    : "Parolni ko‘rsatish"
                }
                hideLabel={
                  language === "ru"
                    ? "Скрыть пароль"
                    : "Parolni yashirish"
                }
                className="rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
              />

            </div>


            <div>

              <label
                htmlFor="new_password_confirm"
                className="mb-2 block text-sm font-medium"
              >

                {language === "ru"
                  ? "Подтвердите пароль"
                  : "Yangi parolni tasdiqlang"}

              </label>

              <PasswordInput
                id="new_password_confirm"
                name="new_password_confirm"
                required
                autoComplete="new-password"
                value={
                  passwordForm.new_password_confirm
                }
                onChange={
                  handlePasswordChange
                }
                showLabel={
                  language === "ru"
                    ? "Показать пароль"
                    : "Parolni ko‘rsatish"
                }
                hideLabel={
                  language === "ru"
                    ? "Скрыть пароль"
                    : "Parolni yashirish"
                }
                className="rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
              />

            </div>


            {passwordError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 md:col-span-2">
                {passwordError}
              </div>
            )}


            {passwordMessage && (
              <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700 md:col-span-2">
                {passwordMessage}
              </div>
            )}


            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={
                  changingPassword
                }
                className="w-full rounded-full bg-[#173f35] px-7 py-3 font-medium text-white transition hover:bg-[#245448] disabled:opacity-50 sm:w-auto"
              >

                {changingPassword
                  ? language === "ru"
                    ? "Изменение..."
                    : "O‘zgartirilmoqda..."
                  : language === "ru"
                    ? "Изменить пароль"
                    : "Parolni o‘zgartirish"}

              </button>

            </div>

          </form>

        </section>


        {/* ========================= */}
        {/* ORDERS */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:mt-8 sm:rounded-[30px] sm:p-7">

          <h2 className="text-xl font-semibold text-[#173f35] sm:text-2xl">

            {language === "ru"
              ? "Мои заказы"
              : "Buyurtmalarim"}

          </h2>


          {orders.length === 0 ? (

            <p className="mt-6 text-stone-500">

              {language === "ru"
                ? "У вас пока нет заказов."
                : "Hali buyurtmangiz yo‘q."}

            </p>

          ) : (

            <div className="mt-6 space-y-4">

              {orders.map(
                (order) => (

                  <Link
                    key={
                      order.id
                    }
                    to={`/account/orders/${order.id}`}
                    className="block rounded-2xl border border-stone-200 p-5 transition hover:border-[#173f35]"
                  >

                    <div className="flex flex-wrap items-center justify-between gap-4">

                      <div>

                        <p className="font-semibold text-[#173f35]">
                          {
                            order.order_number
                          }
                        </p>

                        <p className="mt-1 text-sm text-stone-500">

                          {new Date(
                            order.created_at
                          ).toLocaleString(
                            language === "ru"
                              ? "ru-RU"
                              : "uz-UZ"
                          )}

                        </p>

                      </div>


                      <div className="text-right">

                        <p className="font-medium">
                          {getOrderStatusLabel(
                            order.status,
                            language
                          )}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">

                          {Number(
                            order.total_amount
                          ).toLocaleString(
                            "uz-UZ"
                          )}{" "}
                          so‘m

                        </p>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>


        {/* ========================= */}
        {/* FAVORITES */}
        {/* ========================= */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:mt-8 sm:rounded-[30px] sm:p-7">

          <h2 className="text-xl font-semibold text-[#173f35] sm:text-2xl">

            {language === "ru"
              ? "Избранное"
              : "Sevimli mahsulotlar"}

          </h2>


          {favorites.length === 0 ? (

            <p className="mt-6 text-stone-500">

              {language === "ru"
                ? "В избранном пока ничего нет."
                : "Sevimli mahsulotlar yo‘q."}

            </p>

          ) : (

            <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

              {favorites.map(
                (favorite) => (

                  <div
                    key={
                      favorite.id
                    }
                    className="rounded-2xl border border-stone-200 p-4"
                  >

                    <Link
                      to={`/products/${favorite.product.slug}`}
                    >

                      <h3 className="line-clamp-2 font-semibold text-[#173f35] break-words">
                        {
                          favorite.product.name
                        }
                      </h3>


                      <p className="mt-2 text-sm text-stone-500">

                        {favorite.product.min_price
                          ? `${Number(
                              favorite.product.min_price
                            ).toLocaleString(
                              "uz-UZ"
                            )} so‘m`
                          : language ===
                            "ru"
                            ? "Цена недоступна"
                            : "Narx mavjud emas"}

                      </p>

                    </Link>


                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFavorite(
                          favorite.product.id
                        )
                      }
                      className="mt-4 text-sm text-red-600 hover:underline"
                    >

                      {language === "ru"
                        ? "Удалить из избранного"
                        : "Sevimlidan o‘chirish"}

                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}


export default AccountPage;