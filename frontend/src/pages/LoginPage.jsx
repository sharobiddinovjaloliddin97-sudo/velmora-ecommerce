import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
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
      await login(email, password);
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        language === "ru"
          ? "Неверный email или пароль."
          : "Email yoki parol noto‘g‘ri kiritildi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#faf7f2] flex items-center justify-center px-4 py-12 sm:px-6 lg:py-16 relative overflow-hidden text-[#2d241e]">
      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
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
              VELMORA UY TEKSTILI
            </p>

            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#3b2d24] tracking-tight">
              {language === "ru" ? "Вход в аккаунт" : "Hisobga kirish"}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-[#6b584a] max-w-xs mx-auto">
              {language === "ru"
                ? "Войдите для доступа к заказам и избранным товарам"
                : "Buyurtmalar va saqlangan to‘plamlarga kirish uchun tizimga kiring"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24] mb-2"
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
                  className="w-full pl-12 pr-4 py-3.5 text-base bg-[#faf7f2]/60 border border-[#d6c6b3] rounded-xl outline-none transition-all placeholder:text-stone-400 focus:bg-white focus:border-[#3b2d24] focus:ring-2 focus:ring-[#8a735e]/15"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8a735e]" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold uppercase tracking-wider text-[#3b2d24]"
                >
                  {language === "ru" ? "Пароль" : "Parol"}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-[#8a735e] hover:text-[#3b2d24] transition-colors"
                >
                  {language === "ru" ? "Забыли пароль?" : "Parolni unutdingizmi?"}
                </Link>
              </div>
              <div className="relative">
                <PasswordInput
                  id="password"
                  required
                  autoComplete="current-password"
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

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm leading-relaxed animate-fadeIn">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#3b2d24] text-white font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#271f19] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {language === "ru" ? "Вход..." : "Kirilmoqda..."}
                </span>
              ) : (
                <>
                  <span>{language === "ru" ? "Войти в аккаунт" : "Hisobga kirish"}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[#ebdcca] text-center">
            <p className="text-sm text-[#6b584a]">
              {language === "ru" ? "Ещё нет аккаунта?" : "Hali hisobingiz yo‘qmi?"}{" "}
              <Link
                to="/register"
                className="font-bold text-[#3b2d24] hover:text-[#8a735e] transition-colors underline-offset-4 hover:underline"
              >
                {language === "ru" ? "Зарегистрироваться" : "Ro‘yxatdan o‘tish"}
              </Link>
            </p>
          </div>
        </div>

        {/* Brand Trust Reassurance */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs sm:text-sm text-[#7a6758]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#8a735e]" />
            <span>{language === "ru" ? "Безопасный вход" : "Xavfsiz tizim"}</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#d6c6b3]" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#8a735e]" />
            <span>{language === "ru" ? "Премиум текстиль" : "Tabiiy va sifatli"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;