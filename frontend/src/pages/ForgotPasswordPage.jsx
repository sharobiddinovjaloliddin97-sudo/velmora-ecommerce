import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";


function ForgotPasswordPage() {
  const { language } = useLanguage();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post(
        "/auth/password-reset/",
        {
          email,
        }
      );

      setSuccess(
        language === "ru"
          ? "Если аккаунт с таким email существует, ссылка для восстановления пароля была отправлена."
          : "Agar ushbu email bilan hisob mavjud bo‘lsa, parolni tiklash havolasi yuborildi."
      );

      setEmail("");

    } catch (err) {
      console.error(
        "Password reset request error:",
        err.response?.data || err
      );

      const data =
        err.response?.data;

      if (data?.email?.[0]) {
        setError(
          data.email[0]
        );

      } else if (
        data?.detail
      ) {
        setError(
          data.detail
        );

      } else {
        setError(
          language === "ru"
            ? "Не удалось отправить запрос."
            : "So‘rov yuborishda xatolik yuz berdi."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16">

        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
            Velmora
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-3xl">

            {language === "ru"
              ? "Восстановление пароля"
              : "Parolni tiklash"}

          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-600">

            {language === "ru"
              ? "Введите email, связанный с вашим аккаунтом."
              : "Hisobingizga bog‘langan email manzilni kiriting."}

          </p>


          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >

            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-stone-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="example@gmail.com"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
            />


            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            {success && (
              <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-[#173f35] px-6 py-3.5 font-medium text-white transition hover:bg-[#245448] disabled:opacity-50"
            >

              {loading
                ? language === "ru"
                  ? "Отправка..."
                  : "Yuborilmoqda..."
                : language === "ru"
                  ? "Отправить ссылку"
                  : "Tiklash havolasini yuborish"}

            </button>

          </form>


          <div className="mt-7 text-center">

            <Link
              to="/login"
              className="text-sm font-medium text-[#173f35] hover:underline"
            >
              ←{" "}
              {language === "ru"
                ? "Вернуться ко входу"
                : "Kirish sahifasiga qaytish"}
            </Link>

          </div>

        </div>
      </div>

    </div>
  );
}


export default ForgotPasswordPage;