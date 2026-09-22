import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
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
          : "Parollar bir xil emas. Qaytadan tekshiring."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        language === "ru"
          ? "Пароль должен содержать не менее 6 символов."
          : "Parol kamida 6 ta belgidan iborat bo‘lishi kerak."
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/register/", {
        first_name: firstName,
        email,
        password,
        password_confirm: passwordConfirm,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Register error:", err.response?.data || err);
      const responseData = err.response?.data;

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
            ? "Не удалось зарегистрироваться. Проверьте введённые данные."
            : "Ro‘yxatdan o‘tishda xatolik yuz berdi. Ma’lumotlarni tekshiring."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#faf7f2] dark:bg-[#141210] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e] dark:text-[#ede4d8] transition-colors duration-300">
      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white dark:bg-[#1c1714] rounded-3xl p-7 sm:p-10 shadow-[0_15px_45px_-15px_rgba(59,45,36,0.08)] dark:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.5)] border border-[#ebdcca] dark:border-[#2d251f]">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#261f1a] p-1 border border-[#dfd2c0] dark:border-[#383028] shadow-xs flex items-center justify-center mb-3">
              <img
                src="/logo.png"
                alt="Velmora Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
              VELMORA UY TEKSTILI
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4] tracking-tight">
              {language === "ru" ? "Создать аккаунт" : "Ro‘yxatdan o‘tish"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] max-w-xs mx-auto">
              {language === "ru"
                ? "Зарегистрируйтесь для быстрого оформления заказов и сохранения избранного"
                : "Buyurtmalarni tez rasmiylashtirish va saqlanganlarni ko‘rish uchun hisob yarating"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
              >
                {language === "ru" ? "Ваше имя" : "Ismingiz"}
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={language === "ru" ? "Азиза" : "Aziza"}
                  className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 dark:bg-[#261f1a] border border-[#d6c6b3] dark:border-[#383028] text-[#2d241e] dark:text-[#ede4d8] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#2d251f] focus:border-[#3b2d24] dark:focus:border-[#c1a27c] focus:ring-2 focus:ring-[#8a735e]/15"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#c4a98e]" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 dark:bg-[#261f1a] border border-[#d6c6b3] dark:border-[#383028] text-[#2d241e] dark:text-[#ede4d8] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#2d251f] focus:border-[#3b2d24] dark:focus:border-[#c1a27c] focus:ring-2 focus:ring-[#8a735e]/15"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#c4a98e]" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
              >
                {language === "ru" ? "Пароль" : "Parol"}
              </label>
              <div className="relative">
                <PasswordInput
                  id="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  showLabel={language === "ru" ? "Показать пароль" : "Parolni ko‘rsatish"}
                  hideLabel={language === "ru" ? "Скрыть пароль" : "Parolni yashirish"}
                  className="pl-12 pr-12 py-3.5 text-base bg-[#faf7f2]/60 dark:bg-[#261f1a] border border-[#d6c6b3] dark:border-[#383028] text-[#2d241e] dark:text-[#ede4d8] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#2d251f] focus:border-[#3b2d24] dark:focus:border-[#c1a27c] focus:ring-2 focus:ring-[#8a735e]/15"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#c4a98e] pointer-events-none" />
              </div>
            </div>

            {/* Password Confirm */}
            <div>
              <label
                htmlFor="passwordConfirm"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
              >
                {language === "ru" ? "Подтверждение пароля" : "Parolni tasdiqlang"}
              </label>
              <div className="relative">
                <PasswordInput
                  id="passwordConfirm"
                  required
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="••••••••"
                  showLabel={language === "ru" ? "Показать пароль" : "Parolni ko‘rsatish"}
                  hideLabel={language === "ru" ? "Скрыть пароль" : "Parolni yashirish"}
                  className="pl-12 pr-12 py-3.5 text-base bg-[#faf7f2]/60 dark:bg-[#261f1a] border border-[#d6c6b3] dark:border-[#383028] text-[#2d241e] dark:text-[#ede4d8] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white dark:focus:bg-[#2d251f] focus:border-[#3b2d24] dark:focus:border-[#c1a27c] focus:ring-2 focus:ring-[#8a735e]/15"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] dark:text-[#c4a98e] pointer-events-none" />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm leading-relaxed animate-fadeIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 group relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#3b2d24] hover:bg-[#271f19] dark:bg-[#c1a27c] dark:hover:bg-[#d4b791] text-white dark:text-[#1c1714] font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {language === "ru" ? "Регистрация..." : "Ro‘yxatdan o‘tilmoqda..."}
                </span>
              ) : (
                <>
                  <span>{language === "ru" ? "Зарегистрироваться" : "Ro‘yxatdan o‘tish"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[#ebdcca] dark:border-[#2d251f] text-center">
            <p className="text-sm text-[#6b584a] dark:text-[#b8a99a]">
              {language === "ru" ? "Уже есть аккаунт?" : "Hisobingiz bormi?"}{" "}
              <Link
                to="/login"
                className="font-bold text-[#3b2d24] dark:text-[#c1a27c] hover:text-[#8a735e] dark:hover:text-[#e4cfb8] transition-colors underline-offset-4 hover:underline"
              >
                {language === "ru" ? "Войти" : "Kirish"}
              </Link>
            </p>
          </div>
        </div>

        {/* Benefits Trust */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs sm:text-sm text-[#7a6758] dark:text-[#9a897b]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
            <span>{language === "ru" ? "Конфиденциально" : "Maxfiy va xavfsiz"}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#d6c6b3] dark:bg-[#3d3229]" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8a735e] dark:text-[#c4a98e]" />
            <span>{language === "ru" ? "Премиум текстиль" : "Tabiiy matolar"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;