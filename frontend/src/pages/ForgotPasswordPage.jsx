import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
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
      await api.post("/auth/password-reset/", { email });

      setSuccess(
        language === "ru"
          ? "Если аккаунт с таким email существует, ссылка для восстановления пароля была отправлена на вашу почту."
          : "Agar ushbu email bilan hisob mavjud bo‘lsa, parolni tiklash havolasi pochtangizga yuborildi."
      );
      setEmail("");
    } catch (err) {
      console.error("Password reset request error:", err.response?.data || err);
      const data = err.response?.data;

      if (data?.email?.[0]) {
        setError(data.email[0]);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError(
          language === "ru"
            ? "Не удалось отправить запрос. Попробуйте позже."
            : "So‘rov yuborishda xatolik yuz berdi. Birozdan so‘ng qayta urinib ko‘ring."
        );
      }
    } finally {
      setLoading(false);
    }
  };

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
              XAVFSIZLIK
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] dark:text-[#f3ede4] tracking-tight">
              {language === "ru" ? "Восстановление пароля" : "Parolni tiklash"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6b584a] dark:text-[#b8a99a] max-w-xs mx-auto">
              {language === "ru"
                ? "Введите email, указанный при регистрации, и мы отправим ссылку для сброса пароля"
                : "Ro‘yxatdan o‘tgan emailingizni kiriting, tiklash havolasini yuboramiz"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] dark:text-[#ede4d8] mb-2"
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

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm leading-relaxed animate-fadeIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 group relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#3b2d24] hover:bg-[#271f19] dark:bg-[#c1a27c] dark:hover:bg-[#d4b791] text-white dark:text-[#1c1714] font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {language === "ru" ? "Отправка..." : "Yuborilmoqda..."}
                </span>
              ) : (
                <>
                  <span>{language === "ru" ? "Отправить ссылку" : "Tiklash havolasini yuborish"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[#ebdcca] dark:border-[#2d251f] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b2d24] dark:text-[#c1a27c] hover:text-[#8a735e] dark:hover:text-[#e4cfb8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "ru" ? "Вернуться ко входу" : "Kirish sahifasiga qaytish"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;