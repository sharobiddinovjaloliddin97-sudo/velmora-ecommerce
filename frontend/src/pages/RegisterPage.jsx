import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";
import PasswordInput from "../components/PasswordInput";
import { useLanguage } from "../context/LanguageContext";


function RegisterPage() {
  const navigate = useNavigate();

  const { language } = useLanguage();


  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");


    if (password !== passwordConfirm) {
      setError(
        language === "ru"
          ? "Пароли не совпадают."
          : "Parollar bir xil emas."
      );

      return;
    }


    setSubmitting(true);

    try {
      await api.post(
        "/auth/register/",
        {
          first_name: firstName,
          email,
          password,
          password_confirm: passwordConfirm,
        }
      );

      navigate(
        "/login",
        {
          replace: true,
        }
      );

    } catch (err) {
      console.error(
        "Register error:",
        err.response?.data || err
      );

      const responseData =
        err.response?.data;


      if (responseData?.email) {
        setError(
          Array.isArray(responseData.email)
            ? responseData.email[0]
            : responseData.email
        );
      } else if (responseData?.password) {
        setError(
          Array.isArray(responseData.password)
            ? responseData.password[0]
            : responseData.password
        );
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError(
          language === "ru"
            ? "Не удалось зарегистрироваться."
            : "Ro‘yxatdan o‘tishda xatolik yuz berdi."
        );
      }

    } finally {
      setSubmitting(false);
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
              ? "Регистрация"
              : "Ro‘yxatdan o‘tish"}
          </h1>


          <p className="mt-3 text-sm leading-6 text-stone-600">
            {language === "ru"
              ? "Создайте аккаунт Velmora."
              : "Velmora hisobingizni yarating."}
          </p>


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                {language === "ru"
                  ? "Имя"
                  : "Ism"}
              </label>

              <input
                id="firstName"
                type="text"
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
              />
            </div>


            <div>
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
                  setEmail(event.target.value)
                }
                placeholder="example@gmail.com"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-[#173f35]"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                {language === "ru"
                  ? "Пароль"
                  : "Parol"}
              </label>

              <PasswordInput
                id="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
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
                htmlFor="passwordConfirm"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                {language === "ru"
                  ? "Повторите пароль"
                  : "Parolni tasdiqlang"}
              </label>

              <PasswordInput
                id="passwordConfirm"
                required
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(event) =>
                  setPasswordConfirm(
                    event.target.value
                  )
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


            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#173f35] px-6 py-3.5 font-medium text-white transition hover:bg-[#245448] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? language === "ru"
                  ? "Регистрация..."
                  : "Ro‘yxatdan o‘tilmoqda..."
                : language === "ru"
                  ? "Зарегистрироваться"
                  : "Ro‘yxatdan o‘tish"}
            </button>

          </form>


          <div className="mt-6 text-center text-sm text-stone-600">

            {language === "ru"
              ? "Уже есть аккаунт?"
              : "Hisobingiz bormi?"}{" "}

            <Link
              to="/login"
              className="font-medium text-[#173f35] hover:underline"
            >
              {language === "ru"
                ? "Войти"
                : "Kirish"}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


export default RegisterPage;