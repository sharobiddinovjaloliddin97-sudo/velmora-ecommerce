import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../api/client";
import PasswordInput from "../components/PasswordInput";
import { useLanguage } from "../context/LanguageContext";

function ResetPasswordPage() {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

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
          : "Parolni tiklash havolasi yaroqsiz."
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
      await api.post("/auth/password-reset/confirm/", {
        uid,
        token,
        new_password: password,
        new_password_confirm: passwordConfirm,
      });

      setSuccess(true);
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      console.error("Password reset error:", err.response?.data || err);
      const responseData = err.response?.data;

      if (responseData?.new_password) {
        setError(
          Array.isArray(responseData.new_password)
            ? responseData.new_password[0]
            : responseData.new_password
        );
      } else if (responseData?.new_password_confirm) {
        setError(
          Array.isArray(responseData.new_password_confirm)
            ? responseData.new_password_confirm[0]
            : responseData.new_password_confirm
        );
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError(
          language === "ru"
            ? "Ссылка недействительна или срок её действия истёк."
            : "Havola eskirgan yoki muddati o‘tgan. Qaytadan so‘rov yuboring."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] bg-[#faf7f2] dark:bg-[#141210] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e] dark:text-[#ede4d8] transition-colors duration-300">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white dark:bg-[#1c1714] rounded-3xl p-8 sm:p-12 text-center shadow-[0_15px_45px_-15px_rgba(59,45,36,0.08)] dark:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.5)] border border-[#ebdcca] dark:border-[#2d251f]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 shadow-sm mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
              MUVAFFAQIYATLI
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4]">
              {language === "ru" ? "Пароль обновлён" : "Parol yangilandi"}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] leading-relaxed max-w-xs mx-auto">
              {language === "ru"
                ? "Ваш пароль был успешно изменён. Теперь вы можете войти в аккаунт с новым паролем."
                : "Parolingiz muvaffaqiyatli o‘zgartirildi. Endi yangi parolingiz orqali tizimga kirishingiz mumkin."}
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-[#3b2d24] hover:bg-[#271f19] dark:bg-[#c1a27c] dark:hover:bg-[#d4b791] text-white dark:text-[#1c1714] font-semibold text-base transition shadow-md"
            >
              <span>{language === "ru" ? "Войти в аккаунт" : "Kirish sahifasiga o‘tish"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#faf7f2] dark:bg-[#141210] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e] dark:text-[#ede4d8] transition-colors duration-300">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-[#1c1714] rounded-3xl p-7 sm:p-10 shadow-[0_15px_45px_-15px_rgba(59,45,36,0.08)] dark:shadow-[0_15px_45px_-15px_rgba(0,0,0,0.5)] border border-[#ebdcca] dark:border-[#2d251f]">
          {/* Header & Logo */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-[#261f1a] p-1 border border-[#dfd2c0] dark:border-[#383028] shadow-xs flex items-center justify-center mb-3">
              <img
                src="/logo.png"
                alt="Velmora Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e] dark:text-[#c4a98e]">
              YANGILASH
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4] tracking-tight">
              {language === "ru" ? "Новый пароль" : "Yangi parol o‘rnatish"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] max-w-xs mx-auto">
              {language === "ru"
                ? "Придумайте новый надежный пароль для вашей учетной записи"
                : "Hisobingiz uchun yangi va xavfsiz parol kiriting"}
            </p>
          </div>

          {!uid || !token ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm leading-relaxed">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>
                  {language === "ru"
                    ? "Ссылка восстановления недействительна или неполная."
                    : "Parolni tiklash havolasi noto‘g‘ri yoki to‘liq emas."}
                </span>
              </div>

              <Link
                to="/forgot-password"
                className="block text-center w-full py-3.5 px-4 rounded-xl bg-[#f4efe6] dark:bg-[#261f1a] text-[#3b2d24] dark:text-[#c1a27c] text-sm font-semibold hover:bg-[#ebdcca] dark:hover:bg-[#322922] transition"
              >
                {language === "ru" ? "Запросить ссылку заново" : "Qaytadan havola so‘rash"}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
                >
                  {language === "ru" ? "Новый пароль" : "Yangi parol"}
                </label>
                <div className="relative">
                  <PasswordInput
                    id="newPassword"
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-1.5"
                >
                  {language === "ru" ? "Подтвердите пароль" : "Yangi parolni tasdiqlang"}
                </label>
                <div className="relative">
                  <PasswordInput
                    id="confirmPassword"
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

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm leading-relaxed animate-fadeIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 group relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#3b2d24] hover:bg-[#271f19] dark:bg-[#c1a27c] dark:hover:bg-[#d4b791] text-white dark:text-[#1c1714] font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === "ru" ? "Сохранение..." : "Saqlanmoqda..."}
                  </span>
                ) : (
                  <>
                    <span>{language === "ru" ? "Сохранить новый пароль" : "Yangi parolni saqlash"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[#ebdcca] dark:border-[#2d251f] text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#3b2d24] dark:text-[#c1a27c] hover:text-[#8a735e] dark:hover:text-[#e4cfb8] transition-colors"
            >
              {language === "ru" ? "Вернуться ко входу" : "Kirish sahifasiga qaytish"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;