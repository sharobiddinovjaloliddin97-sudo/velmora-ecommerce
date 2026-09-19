import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";


function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();
  const { language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        email,
        password
      );

      const destination =
        location.state?.from || "/";

      navigate(
        destination,
        {
          replace: true,
        }
      );

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        language === "ru"
          ? "Неверный email или пароль."
          : "Email yoki parol noto‘g‘ri."
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
              ? "Вход в аккаунт"
              : "Hisobga kirish"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-stone-600">
            {language === "ru"
              ? "Введите email и пароль для входа."
              : "Hisobingizga kirish uchun email va parolni kiriting."}
          </p>


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

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

              <div className="mb-2 flex items-center justify-between gap-4">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-stone-700"
                >
                  {language === "ru"
                    ? "Пароль"
                    : "Parol"}
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#52796f] hover:underline"
                >
                  {language === "ru"
                    ? "Забыли пароль?"
                    : "Parolni unutdingizmi?"}
                </Link>

              </div>


              <PasswordInput
                id="password"
                required
                autoComplete="current-password"
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
                  ? "Вход..."
                  : "Kirilmoqda..."
                : language === "ru"
                  ? "Войти"
                  : "Kirish"}
            </button>

          </form>


          <div className="mt-6 text-center text-sm text-stone-600">

            {language === "ru"
              ? "Нет аккаунта?"
              : "Hisobingiz yo‘qmi?"}{" "}

            <Link
              to="/register"
              className="font-medium text-[#173f35] hover:underline"
            >
              {language === "ru"
                ? "Регистрация"
                : "Ro‘yxatdan o‘tish"}
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}


export default LoginPage;