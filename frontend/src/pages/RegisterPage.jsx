import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";


function RegisterPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    first_name: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };


  const getErrorMessage = (data) => {
    if (!data) {
      return language === "ru"
        ? "Ошибка регистрации."
        : "Ro‘yxatdan o‘tishda xatolik yuz berdi.";
    }

    if (data.email?.[0]) {
      return data.email[0];
    }

    if (data.password?.[0]) {
      return data.password[0];
    }

    if (data.password_confirm?.[0]) {
      return data.password_confirm[0];
    }

    if (data.first_name?.[0]) {
      return data.first_name[0];
    }

    if (data.non_field_errors?.[0]) {
      return data.non_field_errors[0];
    }

    if (data.detail) {
      return data.detail;
    }

    return language === "ru"
      ? "Ошибка регистрации."
      : "Ro‘yxatdan o‘tishda xatolik yuz berdi.";
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      form.password !==
      form.password_confirm
    ) {
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
        form
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

      setError(
        getErrorMessage(
          err.response?.data
        )
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">

        <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
            Velmora
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#173f35]">
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
              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Имя"
                  : "Ism"}
              </label>

              <input
                name="first_name"
                required
                value={form.first_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                Email
              </label>

              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Пароль"
                  : "Parol"}
              </label>

              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-medium text-stone-700">
                {language === "ru"
                  ? "Подтвердите пароль"
                  : "Parolni tasdiqlang"}
              </label>

              <input
                name="password_confirm"
                type="password"
                required
                autoComplete="new-password"
                value={form.password_confirm}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />
            </div>


            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}


            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#173f35] px-6 py-3.5 font-medium text-white transition hover:bg-[#245448] disabled:opacity-50"
            >
              {submitting
                ? language === "ru"
                  ? "Создание аккаунта..."
                  : "Yaratilmoqda..."
                : language === "ru"
                  ? "Зарегистрироваться"
                  : "Ro‘yxatdan o‘tish"}
            </button>

          </form>


          <p className="mt-6 text-center text-sm text-stone-600">

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

          </p>

        </div>
      </div>

    </div>
  );
}


export default RegisterPage;