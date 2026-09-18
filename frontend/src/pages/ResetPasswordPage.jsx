import { useState } from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../api/client";
import { useLanguage } from "../context/LanguageContext";


function ResetPasswordPage() {
  const navigate = useNavigate();

  const { language } =
    useLanguage();

  const [searchParams] =
    useSearchParams();

  const uid =
    searchParams.get("uid")?.trim();

  const token =
    searchParams.get("token")?.trim();


  const [
    password,
    setPassword,
  ] = useState("");

  const [
    passwordConfirm,
    setPasswordConfirm,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const getErrorMessage = (
    data
  ) => {

    if (!data) {
      return language === "ru"
        ? "Не удалось восстановить пароль."
        : "Parolni tiklashda xatolik yuz berdi.";
    }


    if (
      data.new_password
    ) {
      return Array.isArray(
        data.new_password
      )
        ? data.new_password[0]
        : data.new_password;
    }


    if (
      data.new_password_confirm
    ) {
      return Array.isArray(
        data.new_password_confirm
      )
        ? data.new_password_confirm[0]
        : data.new_password_confirm;
    }


    if (
      data.uid
    ) {
      return Array.isArray(
        data.uid
      )
        ? data.uid[0]
        : data.uid;
    }


    if (
      data.token
    ) {
      return Array.isArray(
        data.token
      )
        ? data.token[0]
        : data.token;
    }


    if (
      data.non_field_errors
    ) {
      return Array.isArray(
        data.non_field_errors
      )
        ? data.non_field_errors[0]
        : data.non_field_errors;
    }


    if (
      data.detail
    ) {
      return data.detail;
    }


    return language === "ru"
      ? "Не удалось восстановить пароль."
      : "Parolni tiklashda xatolik yuz berdi.";
  };


  const handleSubmit =
    async (
      event
    ) => {

      event.preventDefault();

      setError("");
      setSuccess("");


      if (
        !uid ||
        !token
      ) {
        setError(
          language === "ru"
            ? "Ссылка для восстановления пароля недействительна."
            : "Parolni tiklash havolasi noto‘g‘ri yoki to‘liq emas."
        );

        return;
      }


      if (
        !password ||
        !passwordConfirm
      ) {
        setError(
          language === "ru"
            ? "Заполните оба поля пароля."
            : "Ikkala parol maydonini ham to‘ldiring."
        );

        return;
      }


      if (
        password !==
        passwordConfirm
      ) {
        setError(
          language === "ru"
            ? "Пароли не совпадают."
            : "Parollar bir xil emas."
        );

        return;
      }


      if (
        password.length < 8
      ) {
        setError(
          language === "ru"
            ? "Пароль должен содержать не менее 8 символов."
            : "Parol kamida 8 ta belgidan iborat bo‘lishi kerak."
        );

        return;
      }


      setLoading(true);


      try {
        const response =
          await api.post(
            "/auth/password-reset/confirm/",
            {
              uid,
              token,

              new_password:
                password,

              new_password_confirm:
                passwordConfirm,
            }
          );


        setSuccess(
          response.data?.detail ||
          (
            language === "ru"
              ? "Пароль успешно изменён."
              : "Parolingiz muvaffaqiyatli yangilandi."
          )
        );


        setPassword("");
        setPasswordConfirm("");


        setTimeout(() => {

          navigate(
            "/login",
            {
              replace: true,
            }
          );

        }, 1500);


      } catch (err) {
        console.error(
          "Password reset error:",
          err.response?.data ||
            err
        );


        setError(
          getErrorMessage(
            err.response?.data
          )
        );


      } finally {
        setLoading(false);
      }
    };


  if (
    !uid ||
    !token
  ) {
    return (
      <div className="bg-[#f8f5ef]">

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">

          <div className="w-full max-w-md rounded-[30px] bg-white p-8 text-center shadow-sm">

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
              Velmora
            </p>

            <h1 className="mt-3 text-3xl font-semibold text-[#173f35]">

              {language === "ru"
                ? "Недействительная ссылка"
                : "Noto‘g‘ri havola"}

            </h1>

            <p className="mt-4 leading-7 text-stone-600">

              {language === "ru"
                ? "В ссылке отсутствует UID или токен."
                : "Parolni tiklash havolasida UID yoki token topilmadi."}

            </p>

            <Link
              to="/forgot-password"
              className="mt-7 inline-block rounded-full bg-[#173f35] px-7 py-3 font-medium text-white"
            >

              {language === "ru"
                ? "Получить новую ссылку"
                : "Yangi havola olish"}

            </Link>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-16">

        <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-sm">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#52796f]">
            Velmora
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-[#173f35]">

            {language === "ru"
              ? "Новый пароль"
              : "Yangi parol"}

          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-600">

            {language === "ru"
              ? "Введите новый пароль для вашего аккаунта."
              : "Hisobingiz uchun yangi parol kiriting."}

          </p>


          <form
            onSubmit={
              handleSubmit
            }
            className="mt-8 space-y-5"
          >

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-stone-700"
              >

                {language === "ru"
                  ? "Новый пароль"
                  : "Yangi parol"}

              </label>


              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={
                  password
                }
                onChange={(
                  event
                ) =>
                  setPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />

            </div>


            <div>

              <label
                htmlFor="password-confirm"
                className="mb-2 block text-sm font-medium text-stone-700"
              >

                {language === "ru"
                  ? "Подтвердите новый пароль"
                  : "Yangi parolni tasdiqlang"}

              </label>


              <input
                id="password-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={
                  passwordConfirm
                }
                onChange={(
                  event
                ) =>
                  setPasswordConfirm(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#173f35]"
              />

            </div>


            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}


            {success && (
              <div className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-700">
                {success}
              </div>
            )}


            <button
              type="submit"
              disabled={
                loading ||
                Boolean(success)
              }
              className="w-full rounded-full bg-[#173f35] px-6 py-3.5 font-medium text-white transition hover:bg-[#245448] disabled:opacity-50"
            >

              {loading
                ? language === "ru"
                  ? "Сохранение..."
                  : "Saqlanmoqda..."
                : language === "ru"
                  ? "Сохранить новый пароль"
                  : "Yangi parolni saqlash"}

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


export default ResetPasswordPage;