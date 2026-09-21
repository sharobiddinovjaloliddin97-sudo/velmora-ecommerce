import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  Check,
  ChevronRight,
  Clock,
  Heart,
  KeyRound,
  LogOut,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
} from "lucide-react";

import api from "../api/client";
import PasswordInput from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import { getOrderStatusLabel } from "../utils/orderLabels";


function AccountPage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { language } = useLanguage();
  const { removeFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'favorites' | 'profile' | 'security'

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // CHANGE PASSWORD
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================
  // LOAD ACCOUNT DATA
  // =========================
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      api.get("/auth/profile/"),
      api.get("/orders/"),
      api.get("/favorites/", {
        params: { lang: language },
      }),
    ])
      .then(([profileRes, ordersRes, favoritesRes]) => {
        if (cancelled) return;

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data);
        }

        if (ordersRes.status === "fulfilled") {
          const ordData =
            ordersRes.value.data.results ?? ordersRes.value.data;
          setOrders(Array.isArray(ordData) ? ordData : []);
        }

        if (favoritesRes.status === "fulfilled") {
          const favData =
            favoritesRes.value.data.results ?? favoritesRes.value.data;
          setFavorites(Array.isArray(favData) ? favData : []);
        }

        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Account load error:", err);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const handleProfileChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch("/auth/profile/", {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      });

      setProfile(response.data);
      setUser(response.data);
      setMessage(
        language === "ru"
          ? "Профиль успешно сохранён."
          : "Profil ma’lumotlari muvaffaqiyatli saqlandi."
      );
    } catch (err) {
      console.error("Profile save error:", err);
      const data = err.response?.data;
      setError(
        data?.email?.[0] ||
          (language === "ru"
            ? "Не удалось сохранить профиль."
            : "Profilni saqlashda xatolik yuz berdi.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    });
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      setPasswordError(
        language === "ru"
          ? "Новые пароли не совпадают."
          : "Yangi parollar bir xil emas."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.post("/auth/change-password/", passwordForm);
      setPasswordMessage(
        response.data?.detail ||
          (language === "ru"
            ? "Пароль успешно изменён."
            : "Parol muvaffaqiyatli o‘zgartirildi.")
      );

      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err) {
      console.error("Change password error:", err);
      const data = err.response?.data;
      if (data?.old_password?.[0]) {
        setPasswordError(data.old_password[0]);
      } else if (data?.new_password?.[0]) {
        setPasswordError(data.new_password[0]);
      } else if (data?.new_password_confirm?.[0]) {
        setPasswordError(data.new_password_confirm[0]);
      } else {
        setPasswordError(
          language === "ru"
            ? "Не удалось изменить пароль."
            : "Parolni o‘zgartirishda xatolik yuz berdi."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFavorite(productId);
      setFavorites((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } catch (err) {
      console.error("Remove favorite error:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "NEW":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "CONFIRMED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SHIPPING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#faf8f5]">
        <p className="text-sm font-medium text-stone-500">
          {language === "ru" ? "Загрузка кабинета..." : "Kabinet yuklanmoqda..."}
        </p>
      </div>
    );
  }

  const userInitial = profile.first_name
    ? profile.first_name[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "V";

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-24">
      {/* HEADER BANNER */}
      <section className="border-b border-[#e8ded2] bg-gradient-to-b from-[#f4efe6] to-[#faf7f2] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3b2d24] font-serif text-2xl font-bold text-[#faf7f2] shadow-md">
                {userInitial}
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-[#8a735e] uppercase">
                  {language === "ru" ? "Личный кабинет" : "Shaxsiy kabinet"}
                </span>
                <h1 className="font-serif text-2xl font-bold text-[#3b2d24] sm:text-3xl">
                  {profile.first_name || user?.email}
                </h1>
                <p className="text-sm text-stone-500">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[#d6c7b2] bg-white px-5 py-2.5 text-xs font-bold tracking-wider text-stone-700 uppercase transition hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 sm:self-auto shadow-xs"
            >
              <LogOut className="h-4 w-4" />
              <span>{language === "ru" ? "Выйти из аккаунта" : "Chiqish"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ========================= */}
          {/* SIDEBAR TABS */}
          {/* ========================= */}
          <aside className="lg:col-span-3">
            <nav className="flex flex-row gap-1.5 overflow-x-auto rounded-3xl border border-[#e8ded2] bg-white p-2 shadow-xs sm:p-2.5 lg:flex-col">
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex shrink-0 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                  activeTab === "orders"
                    ? "bg-[#3b2d24] text-white shadow-xs"
                    : "text-stone-700 hover:bg-[#f4efe6] hover:text-[#3b2d24]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4" />
                  <span>{language === "ru" ? "Мои заказы" : "Buyurtmalarim"}</span>
                </div>
                {orders.length > 0 && (
                  <span
                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeTab === "orders"
                        ? "bg-white/20 text-white"
                        : "bg-[#f4efe6] text-[#3b2d24]"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`flex shrink-0 items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                  activeTab === "favorites"
                    ? "bg-[#3b2d24] text-white shadow-xs"
                    : "text-stone-700 hover:bg-[#f4efe6] hover:text-[#3b2d24]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4" />
                  <span>{language === "ru" ? "Избранное" : "Sevimlilar"}</span>
                </div>
                {favorites.length > 0 && (
                  <span
                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      activeTab === "favorites"
                        ? "bg-white/20 text-white"
                        : "bg-[#f4efe6] text-[#3b2d24]"
                    }`}
                  >
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                  activeTab === "profile"
                    ? "bg-[#3b2d24] text-white shadow-xs"
                    : "text-stone-700 hover:bg-[#f4efe6] hover:text-[#3b2d24]"
                }`}
              >
                <User className="h-4 w-4" />
                <span>{language === "ru" ? "Профиль" : "Profil"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition ${
                  activeTab === "security"
                    ? "bg-[#3b2d24] text-white shadow-xs"
                    : "text-stone-700 hover:bg-[#f4efe6] hover:text-[#3b2d24]"
                }`}
              >
                <KeyRound className="h-4 w-4" />
                <span>{language === "ru" ? "Безопасность" : "Xavfsizlik"}</span>
              </button>
            </nav>
          </aside>

          {/* ========================= */}
          {/* TAB PANELS */}
          {/* ========================= */}
          <main className="lg:col-span-9">
            {/* 1. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#e8ded2] pb-4">
                  <h2 className="font-serif text-xl font-bold text-[#3b2d24]">
                    {language === "ru" ? "История заказов" : "Buyurtmalar tarixi"}
                  </h2>
                  <span className="text-sm text-stone-500">
                    {orders.length} {language === "ru" ? "заказов" : "ta buyurtma"}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-[#e8ded2] bg-white p-12 text-center shadow-xs">
                    <Package className="mx-auto h-12 w-12 text-stone-300" />
                    <h3 className="mt-4 font-serif text-lg font-bold text-[#3b2d24]">
                      {language === "ru" ? "У вас пока нет заказов" : "Hozircha buyurtmalar yo‘q"}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {language === "ru"
                        ? "Когда вы оформите заказ, он появится на этой странице."
                        : "Siz bergan buyurtmalar ushbu bo‘limda aks etadi."}
                    </p>
                    <Link
                      to="/catalog"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3b2d24] px-7 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135]"
                    >
                      <span>{language === "ru" ? "В каталог" : "Katalogga o‘tish"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/account/orders/${order.id}`}
                        className="group block rounded-3xl border border-[#e8ded2] bg-white p-5 shadow-xs transition hover:border-[#8a735e] hover:shadow-md sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base font-bold text-[#3b2d24]">
                                {order.order_number}
                              </span>
                              <span
                                className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {getOrderStatusLabel(order.status, language)}
                              </span>
                            </div>

                            <p className="flex items-center gap-1.5 text-sm text-stone-500">
                              <Clock className="h-4 w-4 text-[#8a735e]" />
                              <span>
                                {new Date(order.created_at).toLocaleString(
                                  language === "ru" ? "ru-RU" : "uz-UZ",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#e8ded2] pt-3 sm:border-0 sm:pt-0 sm:text-right">
                            <div>
                              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {language === "ru" ? "Сумма" : "Summa"}
                              </p>
                              <p className="font-serif text-lg font-bold text-[#3b2d24]">
                                {Number(order.total_amount).toLocaleString("uz-UZ")} so‘m
                              </p>
                            </div>

                            <span className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4efe6] text-[#3b2d24] transition group-hover:bg-[#3b2d24] group-hover:text-white">
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. FAVORITES TAB */}
            {activeTab === "favorites" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#e8ded2] pb-4">
                  <h2 className="font-serif text-xl font-bold text-[#3b2d24]">
                    {language === "ru" ? "Избранные товары" : "Sevimli mahsulotlar"}
                  </h2>
                  <span className="text-sm text-stone-500">
                    {favorites.length} {language === "ru" ? "товаров" : "ta mahsulot"}
                  </span>
                </div>

                {favorites.length === 0 ? (
                  <div className="rounded-3xl border border-[#e8ded2] bg-white p-12 text-center shadow-xs">
                    <Heart className="mx-auto h-12 w-12 text-stone-300" />
                    <h3 className="mt-4 font-serif text-lg font-bold text-[#3b2d24]">
                      {language === "ru"
                        ? "В избранном пока пусто"
                        : "Sevimli mahsulotlar ro‘yxati bo‘sh"}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {language === "ru"
                        ? "Нажмите на сердечко у любого товара, чтобы сохранить его сюда."
                        : "Mahsulot ustidagi yurakcha tugmasini bosib, uni bu yerga saqlab qo‘yishingiz mumkin."}
                    </p>
                    <Link
                      to="/catalog"
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3b2d24] px-7 py-3 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135]"
                    >
                      <span>{language === "ru" ? "Смотреть каталог" : "Katalogga o‘tish"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((fav) => {
                      const prod = fav.product;
                      const primaryImg =
                        prod.images?.find((img) => img.is_primary)?.image ||
                        prod.images?.[0]?.image;

                      return (
                        <div
                          key={fav.id}
                          className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e8ded2] bg-white p-4 shadow-xs transition hover:shadow-md hover:border-[#8a735e]"
                        >
                          <div>
                            <Link
                              to={`/products/${prod.slug}`}
                              className="block aspect-4/5 w-full overflow-hidden rounded-2xl bg-[#faf7f2]"
                            >
                              {primaryImg ? (
                                <img
                                  src={primaryImg}
                                  alt={prod.name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-sm text-stone-400">
                                  No photo
                                </div>
                              )}
                            </Link>

                            <Link
                              to={`/products/${prod.slug}`}
                              className="mt-3.5 block font-serif text-base font-bold text-[#3b2d24] hover:text-[#8a735e] transition"
                            >
                              {prod.name}
                            </Link>

                            <p className="mt-1.5 font-serif text-base font-semibold text-[#8a735e]">
                              {prod.min_price
                                ? `${Number(prod.min_price).toLocaleString("uz-UZ")} so‘m`
                                : "-"}
                            </p>
                          </div>

                          <div className="mt-5 flex items-center justify-between border-t border-[#e8ded2] pt-3.5">
                            <Link
                              to={`/products/${prod.slug}`}
                              className="text-xs font-bold tracking-wider text-[#3b2d24] uppercase hover:text-[#8a735e] transition"
                            >
                              {language === "ru" ? "Открыть →" : "Ko‘rish →"}
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(prod.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>{language === "ru" ? "Удалить" : "O‘chirish"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs sm:p-8">
                <h2 className="font-serif text-xl font-bold text-[#3b2d24]">
                  {language === "ru" ? "Данные профиля" : "Shaxsiy ma’lumotlar"}
                </h2>

                {message && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-200">
                    {error}
                  </div>
                )}

                <form onSubmit={saveProfile} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                        {language === "ru" ? "Имя" : "Ism"}
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                        {language === "ru" ? "Фамилия" : "Familiya"}
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="mt-2 w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#3b2d24] px-8 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135] disabled:opacity-50"
                    >
                      {saving
                        ? language === "ru"
                          ? "Сохранение..."
                          : "Saqlanmoqda..."
                        : language === "ru"
                          ? "Сохранить изменения"
                          : "O‘zgarishlarni saqlash"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. SECURITY TAB */}
            {activeTab === "security" && (
              <div className="rounded-3xl border border-[#e8ded2] bg-white p-6 shadow-xs sm:p-8">
                <h2 className="font-serif text-xl font-bold text-[#3b2d24]">
                  {language === "ru" ? "Смена пароля" : "Parolni o‘zgartirish"}
                </h2>

                {passwordMessage && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{passwordMessage}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 border border-rose-200">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={changePassword} className="mt-6 space-y-4 max-w-lg">
                  <div>
                    <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                      {language === "ru" ? "Текущий пароль" : "Amaldagi parol"}
                    </label>
                    <div className="mt-2">
                      <PasswordInput
                        id="old_password"
                        name="old_password"
                        required
                        value={passwordForm.old_password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                      {language === "ru" ? "Новый пароль" : "Yangi parol"}
                    </label>
                    <div className="mt-2">
                      <PasswordInput
                        id="new_password"
                        name="new_password"
                        required
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wider text-stone-700 uppercase">
                      {language === "ru" ? "Подтвердите новый пароль" : "Yangi parolni tasdiqlang"}
                    </label>
                    <div className="mt-2">
                      <PasswordInput
                        id="new_password_confirm"
                        name="new_password_confirm"
                        required
                        value={passwordForm.new_password_confirm}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-[#e8ded2] bg-[#faf7f2]/60 p-3.5 text-sm text-[#3b2d24] outline-none focus:border-[#3b2d24] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="rounded-full bg-[#3b2d24] px-8 py-3.5 text-xs font-bold tracking-wider text-white uppercase shadow-md transition hover:bg-[#534135] disabled:opacity-50"
                    >
                      {changingPassword
                        ? language === "ru"
                          ? "Обновление..."
                          : "Yangilanmoqda..."
                        : language === "ru"
                          ? "Обновить пароль"
                          : "Parolni yangilash"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;