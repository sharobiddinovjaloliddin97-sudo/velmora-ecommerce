import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
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
      <div className="min-h-[85vh] bg-[#faf7f2] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e]">
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-[0_15px_45px_-15px_rgba(59,45,36,0.08)] border border-[#ebdcca]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e]">
              MUVAFFAQIYATLI
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24]">
              {language === "ru" ? "Пароль обновлён" : "Parol yangilandi"}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#6b584a] leading-relaxed max-w-xs mx-auto">
              {language === "ru"
                ? "Ваш пароль был успешно изменён. Теперь вы можете войти в аккаунт с новым паролем."
                : "Parolingiz muvaffaqiyatli o‘zgartirildi. Endi yangi parolingiz orqali tizimga kirishingiz mumkin."}
            </p>

            <Link
              to="/login"
              className="mt-8 inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-[#3b2d24] text-white font-semibold text-base transition hover:bg-[#271f19] shadow-md"
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
    <div className="min-h-[85vh] bg-[#faf7f2] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e]">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_15px_45px_-15px_rgba(59,45,36,0.08)] border border-[#ebdcca]">
          {/* Header & Logo */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden bg-white p-1 border border-[#dfd2c0] shadow-xs flex items-center justify-center mb-3">
              <img
                src="/logo.png"
                alt="Velmora Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a735e]">
              YANGILASH
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] tracking-tight">
              {language === "ru" ? "Новый пароль" : "Yangi parol o‘rnatish"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6b584a] max-w-xs mx-auto">
              {language === "ru"
                ? "Придумайте новый надежный пароль для вашей учетной записи"
                : "Hisobingiz uchun yangi va xavfsiz parol kiriting"}
            </p>
          </div>

          {!uid || !token ? (
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm leading-relaxed">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                <span>
                  {language === "ru"
                    ? "Ссылка восстановления недействительна или неполная."
                    : "Parolni tiklash havolasi noto‘g‘ri yoki to‘liq emas."}
                </span>
              </div>

              <Link
                to="/forgot-password"
                className="block text-center w-full py-3.5 px-4 rounded-xl bg-[#f4efe6] text-[#3b2d24] text-sm font-semibold hover:bg-[#ebdcca] transition"
              >
                {language === "ru" ? "Запросить ссылку заново" : "Qaytadan havola so‘rash"}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-1.5"
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
                    className="pl-12 pr-12 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] pointer-events-none" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-1.5"
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
                    className="pl-12 pr-12 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e] pointer-events-none" />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm leading-relaxed animate-fadeIn">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 group relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#3b2d24] text-white font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#271f19] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

          <div className="mt-8 pt-6 border-t border-[#ebdcca] text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#3b2d24] hover:text-[#8a735e] transition-colors"
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