import { useState } from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import api from "../api/client";
import PasswordInput from "../components/PasswordInput";
import { useLanguage } from "../context/LanguageContext";


function ResetPasswordPage() {
  const { language } = useLanguage();

  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");


  const [password, setPassword] = useState("");
  const [
    passwordConfirm,
    setPasswordConfirm,
  ] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");


    if (!uid || !token) {
      setError(
        language === "ru"
          ? "Ссылка восстановления недействительна."
          : "Parolni tiklash havolasi noto‘g‘ri."
      );

      return;
    }


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
        "/auth/password-reset/confirm/",
        {
          uid,
          token,
          new_password: password,
          new_password_confirm: passwordConfirm,
        }
      );

      setSuccess(true);
      setPassword("");
      setPasswordConfirm("");

    } catch (err) {
      console.error(
        "Password reset error:",
        err.response?.data || err
      );

      const responseData =
        err.response?.data;


      if (responseData?.new_password) {
        setError(
          Array.isArray(responseData.new_password)
            ? responseData.new_password[0]
            : responseData.new_password
        );
      } else if (
        responseData?.new_password_confirm
      ) {
        setError(
          Array.isArray(
            responseData.new_password_confirm
          )
            ? responseData.new_password_confirm[0]
            : responseData.new_password_confirm
        );
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError(
          language === "ru"
            ? "Ссылка недействительна или срок её действия истёк."
            : "Havola noto‘g‘ri yoki uning amal qilish muddati tugagan."
        );
      }

    } finally {
      setSubmitting(false);
    }
  };


  if (success) {
    return (
      <div className="bg-[#f8f5ef]">

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16">

          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-center shadow-sm sm:rounded-[30px] sm:p-8">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-[#173f35]">
              ✓
            </div>


            <h1 className="mt-4 text-2xl font-semibold text-[#173f35] sm:mt-5 sm:text-3xl">
              {language === "ru"
                ? "Пароль обновлён"
                : "Parol yangilandi"}
            </h1>


            <p className="mt-3 text-sm leading-6 text-stone-600">
              {language === "ru"
                ? "Теперь вы можете войти в аккаунт с новым паролем."
                : "Endi yangi parolingiz orqali hisobingizga kirishingiz mumkin."}
            </p>


            <Link
              to="/login"
              className="mt-7 inline-flex rounded-full bg-[#173f35] px-7 py-3 font-medium text-white transition hover:bg-[#245448]"
            >
              {language === "ru"
                ? "Войти"
                : "Kirish"}
            </Link>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="bg-[#f8f5ef]">

      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16">

        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-sm sm:rounded-[30px] sm:p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#52796f] sm:text-sm">
            Velmora
          </p>


          <h1 className="mt-2 text-2xl font-semibold text-[#173f35] sm:mt-3 sm:text-3xl">
            {language === "ru"
              ? "Новый пароль"
              : "Yangi parol"}
          </h1>


          <p className="mt-3 text-sm leading-6 text-stone-600">
            {language === "ru"
              ? "Введите новый пароль для вашего аккаунта."
              : "Hisobingiz uchun yangi parol kiriting."}
          </p>


          {!uid || !token ? (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {language === "ru"
                ? "Ссылка восстановления недействительна."
                : "Parolni tiklash havolasi noto‘g‘ri."}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Новый пароль"
                    : "Yangi parol"}
                </label>

                <PasswordInput
                  id="newPassword"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
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


              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Повторите новый пароль"
                    : "Yangi parolni tasdiqlang"}
                </label>

                <PasswordInput
                  id="confirmPassword"
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
                    ? "Сохранение..."
                    : "Saqlanmoqda..."
                  : language === "ru"
                    ? "Сохранить новый пароль"
                    : "Yangi parolni saqlash"}
              </button>

            </form>
          )}


          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="text-sm font-medium text-[#52796f] hover:underline"
            >
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