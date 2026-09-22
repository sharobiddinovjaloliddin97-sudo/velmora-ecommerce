import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Heart,
  Menu,
  ShoppingBag,
  Sparkles,
  User,
  X,
  Phone,
  Send,
} from "lucide-react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import { getCart } from "../utils/cart";
import ThemeToggle from "./ThemeToggle";

function Header() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { favoriteIds } = useFavorites();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const calculateCartCount = () => {
    const cart = getCart();
    return cart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  };

  const [cartCount, setCartCount] = useState(calculateCartCount);
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("/notifications/");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setNotifications(data);
    } catch (error) {
      console.error("Notification load error:", error);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      loadNotifications();
    }, 0);
    const interval = setInterval(loadNotifications, 30000);
    window.addEventListener("focus", loadNotifications);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [user, loadNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.post(`/notifications/${notification.id}/read/`);
        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );
      } catch (error) {
        console.error("Notification read error:", error);
      }
    }
    setNotificationOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all/");
      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartCount(calculateCartCount());
    };
    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navClass = ({ isActive }) =>
    isActive
      ? "relative py-1 text-base font-semibold tracking-wide text-[#3b2d24] dark:text-[#f2e6d6] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-[#8a735e] dark:after:bg-[#e5b378] after:transition-all"
      : "relative py-1 text-base font-medium tracking-wide text-[#5c4a3d] dark:text-[#c4b6a8] transition-colors hover:text-[#8a735e] dark:hover:text-[#e5b378]";

  const mobileNavClass = ({ isActive }) =>
    isActive
      ? "flex items-center justify-between rounded-xl bg-[#8a735e]/15 px-4 py-3.5 text-base font-bold text-[#3b2d24] dark:bg-[#e5b378]/15 dark:text-[#f5efe6]"
      : "flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium text-[#5c4a3d] transition hover:bg-[#f4efe6] dark:text-[#c4b6a8] dark:hover:bg-[#25201c]";

  const handleLogout = async () => {
    await logout();
    setNotifications([]);
    setNotificationOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* ========================= */}
      {/* ANNOUNCEMENT BANNER */}
      {/* ========================= */}
      <aside className="bg-[#241c16] text-[#e8ded4] text-xs py-2 px-3 sm:px-6 border-b border-[#3d3228] transition-colors overflow-hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 justify-center sm:justify-start">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#c1a27c] shrink-0" />
            <span className="truncate text-[11px] sm:text-xs font-medium">
              {language === "ru"
                ? "Бесплатная доставка по Ташкенту • Оплата при получении"
                : "Toshkent bo‘ylab bepul yetkazib berish • To‘lov qabul qilganda"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-[#c1a27c]">
            <a href="tel:+998911652211" className="hover:underline flex items-center gap-1.5" title="Asosiy aloqa raqami">
              <Phone className="w-3.5 h-3.5" />
              <span>+998 91 165 22 11</span>
              <span className="text-[10px] text-[#e5d0b9] font-normal">({language === "ru" ? "Осн." : "Asosiy"})</span>
            </a>
            <span className="text-[#8a735e]">•</span>
            <a href="tel:+998930791734" className="hover:underline flex items-center gap-1 text-[#e5d0b9]" title="Qo‘shimcha aloqa raqami">
              <span>+998 93 079 17 34</span>
              <span className="text-[10px] text-stone-400 font-normal">({language === "ru" ? "Доп." : "Qo‘shimcha"})</span>
            </a>
            <span>•</span>
            <a
              href="https://t.me/velmoramahsulotlari"
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>@velmoramahsulotlari</span>
            </a>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-50 border-b border-[#ebdcca] bg-[#faf7f2]/95 backdrop-blur-md transition-colors duration-200 dark:border-[#332b25] dark:bg-[#141210]/95">
        {/* ========================= */}
        {/* MAIN NAVIGATION BAR */}
        {/* ========================= */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3.5">
          
          {/* BRAND LOGO */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#1f1b17] p-1 border border-[#dfd2c0]/80 dark:border-[#3d342c] shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Velmora"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-3xl font-bold tracking-[0.14em] sm:tracking-[0.16em] text-[#3b2d24] dark:text-[#f2e6d6] transition-colors group-hover:text-[#8a735e] dark:group-hover:text-[#e5b378]">
                VELMORA
              </span>
              <span className="-mt-1 text-[8px] sm:text-[11px] tracking-[0.22em] sm:tracking-[0.28em] text-[#8a735e] dark:text-[#c1a27c] uppercase font-bold">
                Uy Tekstili
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden items-center gap-8 lg:flex">
            <NavLink to="/" className={navClass}>
              {t("home")}
            </NavLink>
            <NavLink to="/catalog" className={navClass}>
              {t("catalog")}
            </NavLink>
            <NavLink to="/about" className={navClass}>
              {t("about")}
            </NavLink>
            <NavLink to="/contact" className={navClass}>
              {t("contact")}
            </NavLink>
          </nav>

          {/* RIGHT UTILITIES */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* LANGUAGE SWITCHER */}
            <div className="flex items-center rounded-full border border-[#d8c8b4] bg-white p-0.5 shadow-xs dark:border-[#3d342c] dark:bg-[#1f1b17]">
              <button
                type="button"
                onClick={() => changeLanguage("uz")}
                className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wider transition ${
                  language === "uz"
                    ? "bg-[#3b2d24] text-white dark:bg-[#e5b378] dark:text-[#1c1917] shadow-xs"
                    : "text-[#6b584a] hover:text-[#3b2d24] dark:text-[#a09081] dark:hover:text-[#e8ded4]"
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("ru")}
                className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold tracking-wider transition ${
                  language === "ru"
                    ? "bg-[#3b2d24] text-white dark:bg-[#e5b378] dark:text-[#1c1917] shadow-xs"
                    : "text-[#6b584a] hover:text-[#3b2d24] dark:text-[#a09081] dark:hover:text-[#e8ded4]"
                }`}
              >
                RU
              </button>
            </div>

            {/* DARK / LIGHT THEME TOGGLE */}
            <ThemeToggle />

            {/* WISHLIST LINK (TABLET & DESKTOP) */}
            <Link
              to={user ? "/account?tab=favorites" : "/login"}
              aria-label={language === "ru" ? "Избранное" : "Sevimlilar"}
              className="relative hidden h-11 w-11 items-center justify-center rounded-full border border-[#d8c8b4] bg-white text-[#4a3b32] transition hover:border-[#3b2d24] hover:text-[#8a735e] dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4] dark:hover:border-[#c1a27c] dark:hover:text-[#e5b378] sm:flex"
              title={language === "ru" ? "Избранное" : "Sevimlilar"}
            >
              <Heart className="h-5 w-5" />
              {favoriteIds.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8a735e] dark:bg-[#c1a27c] px-1 text-[10px] font-bold text-white dark:text-[#1c1917] shadow-xs">
                  {favoriteIds.length}
                </span>
              )}
            </Link>

            {/* NOTIFICATIONS POPOVER (TABLET & DESKTOP) */}
            {user && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((curr) => !curr)}
                  aria-label={language === "ru" ? "Уведомления" : "Bildirishnomalar"}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c8b4] bg-white text-[#4a3b32] transition hover:border-[#3b2d24] hover:text-[#8a735e] dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4] dark:hover:border-[#c1a27c]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs sm:hidden"
                      onClick={() => setNotificationOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="fixed inset-x-3 top-16 z-50 max-h-[82vh] overflow-hidden rounded-3xl border border-[#ebdcca] bg-white shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-[380px] dark:border-[#383028] dark:bg-[#1c1917]">
                      {/* HEADER */}
                      <div className="flex items-center justify-between border-b border-[#ebdcca] bg-[#faf7f2] px-5 py-3.5 dark:border-[#383028] dark:bg-[#25211e]">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-[#8a735e] dark:text-[#e5b378]" />
                          <h3 className="font-semibold text-[#3b2d24] dark:text-[#f5efe6]">
                            {language === "ru" ? "Уведомления" : "Bildirishnomalar"}
                          </h3>
                        </div>

                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs font-semibold text-[#8a735e] dark:text-[#e5b378] transition hover:underline"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span>
                              {language === "ru" ? "Все прочитаны" : "Barchasini o‘qish"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* LIST */}
                      <div className="max-h-96 divide-y divide-[#f4efe6] dark:divide-[#2e2722] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                            <Bell className="h-8 w-8 text-[#d8c8b4] dark:text-[#4d4239]" />
                            <p className="mt-2 text-sm text-[#7a6758] dark:text-[#a6988a]">
                              {language === "ru"
                                ? "У вас пока нет уведомлений"
                                : "Hozircha bildirishnoma yo‘q"}
                            </p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`block w-full p-4 text-left transition hover:bg-[#faf7f2] dark:hover:bg-[#24201c] ${
                                notification.is_read ? "bg-white dark:bg-[#1c1917]" : "bg-[#f5efe6]/60 dark:bg-[#2b2520]/60"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-[#3b2d24] dark:text-[#f5efe6]">
                                  {language === "ru" ? notification.title_ru : notification.title_uz}
                                </p>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-rose-600" />
                                )}
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-[#6b584a] dark:text-[#b8aa9d]">
                                {notification.message}
                              </p>
                              <p className="mt-1.5 text-[11px] text-[#8a735e] dark:text-[#d4af7a]">
                                {new Date(notification.created_at).toLocaleString(
                                  language === "ru" ? "ru-RU" : "uz-UZ",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CART BUTTON (TABLET & DESKTOP; MOBILE HAS STICKY BOTTOM NAV) */}
            <Link
              to="/cart"
              aria-label={t("cart")}
              className="relative hidden sm:flex h-11 items-center gap-2 rounded-full bg-[#3b2d24] px-3.5 sm:px-4 text-white shadow-sm transition hover:bg-[#271f19] dark:bg-[#e5b378] dark:text-[#1c1917] dark:hover:bg-[#d9a365]"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden text-sm font-semibold sm:inline">
                {t("cart")}
              </span>

              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8a735e] dark:bg-[#3b2d24] dark:text-[#f2e6d6] px-1 text-[11px] font-bold text-white shadow-xs">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* DESKTOP USER ACCOUNT / LOGIN */}
            <div className="hidden items-center lg:flex">
              {user ? (
                <div className="flex items-center gap-2 pl-2">
                  <Link
                    to="/account"
                    className="flex items-center gap-2 rounded-full border border-[#d8c8b4] bg-white px-4 py-2 text-sm font-medium text-[#3b2d24] transition hover:border-[#3b2d24] hover:bg-[#faf7f2] dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4] dark:hover:border-[#e5b378]"
                  >
                    <User className="h-4 w-4 text-[#8a735e] dark:text-[#e5b378]" />
                    <span className="max-w-[120px] truncate">
                      {user.first_name || user.email.split("@")[0]}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-semibold text-[#8a735e] dark:text-[#c1a27c] transition hover:text-rose-600 dark:hover:text-rose-400 hover:underline"
                  >
                    {t("logout")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2">
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[#3b2d24] dark:text-[#e8ded4] transition hover:bg-[#f5efe6] dark:hover:bg-[#25201c]"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full border border-[#3b2d24] px-4 py-2 text-sm font-semibold text-[#3b2d24] transition hover:bg-[#3b2d24] hover:text-white dark:border-[#e5b378] dark:text-[#e5b378] dark:hover:bg-[#e5b378] dark:hover:text-[#1c1917]"
                  >
                    {t("register")}
                  </Link>
                </div>
              )}
            </div>

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? language === "ru"
                    ? "Закрыть меню"
                    : "Menuni yopish"
                  : language === "ru"
                    ? "Открыть меню"
                    : "Menuni ochish"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((curr) => !curr)}
              className="relative flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#d8c8b4] bg-white text-[#3b2d24] transition hover:border-[#3b2d24] dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4] dark:hover:border-[#e5b378] lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              )}
              {unreadCount > 0 && !mobileMenuOpen && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ========================= */}
        {/* MOBILE SLIDE-DOWN DRAWER */}
        {/* ========================= */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-[#ebdcca] bg-[#faf7f2] px-4 py-6 lg:hidden dark:border-[#332b25] dark:bg-[#141210]">
            <div className="mx-auto max-w-md space-y-5">
              
              {/* MOBILE USER BADGE OR LOGIN */}
              <div className="rounded-2xl border border-[#ebdcca] bg-white p-4 shadow-xs dark:border-[#383028] dark:bg-[#1c1917]">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4efe6] text-[#8a735e] dark:bg-[#29231e] dark:text-[#e5b378]">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#3b2d24] dark:text-[#f5efe6]">
                          {user.first_name || user.email}
                        </p>
                        <p className="truncate text-xs text-[#7a6758] dark:text-[#a09081]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-xl border border-[#3b2d24] py-2.5 text-center text-xs font-semibold text-[#3b2d24] transition hover:bg-[#3b2d24] hover:text-white dark:border-[#e5b378] dark:text-[#e5b378] dark:hover:bg-[#e5b378] dark:hover:text-[#1c1917]"
                      >
                        {t("account")}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-xl bg-[#f4efe6] py-2.5 text-center text-xs font-semibold text-[#6b584a] transition hover:bg-rose-50 hover:text-rose-600 dark:bg-[#2a241f] dark:text-[#d4c8bc] dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl bg-[#3b2d24] py-3 text-center text-sm font-semibold text-white shadow-xs dark:bg-[#e5b378] dark:text-[#1c1917]"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-xl border border-[#3b2d24] py-3 text-center text-sm font-semibold text-[#3b2d24] dark:border-[#e5b378] dark:text-[#e5b378]"
                    >
                      {t("register")}
                    </Link>
                  </div>
                )}
              </div>

              {/* NAV LINKS */}
              <nav className="flex flex-col gap-1.5">
                <NavLink
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  <span>{t("home")}</span>
                </NavLink>

                <NavLink
                  to="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  <span>{t("catalog")}</span>
                </NavLink>

                <NavLink
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  <span>{t("about")}</span>
                </NavLink>

                <NavLink
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavClass}
                >
                  <span>{t("contact")}</span>
                </NavLink>
              </nav>

              {/* THEME TOGGLE ROW IN MOBILE MENU */}
              <div className="flex items-center justify-between rounded-2xl border border-[#ebdcca] bg-white p-3.5 shadow-xs dark:border-[#383028] dark:bg-[#1c1917]">
                <span className="text-xs font-semibold text-[#5c4a3d] dark:text-[#c4b6a8]">
                  {language === "ru" ? "Режим оформления:" : "Sayt ko‘rinishi:"}
                </span>
                <ThemeToggle showLabel={true} />
              </div>

              {/* DIRECT CONTACTS ON MOBILE */}
              <div className="rounded-2xl bg-[#f4efe6] p-4 space-y-2.5 text-xs text-[#3b2d24] dark:bg-[#201c18] dark:text-[#e8ded4]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a735e] dark:text-[#c1a27c]">
                    {language === "ru" ? "Телефоны для связи:" : "Bog‘lanish telefonlari:"}
                  </span>
                  <a
                    href="tel:+998911652211"
                    className="flex items-center gap-2 font-bold text-sm text-[#3b2d24] dark:text-[#f5efe6] hover:text-[#8a735e]"
                  >
                    <Phone className="w-4 h-4 text-[#8a735e] dark:text-[#e5b378]" />
                    <span>+998 91 165 22 11</span>
                    <span className="ml-1 text-[10px] font-medium text-[#8a735e] dark:text-[#c1a27c]">(Asosiy)</span>
                  </a>
                  <a
                    href="tel:+998930791734"
                    className="flex items-center gap-2 font-medium text-sm text-[#5c4a3d] dark:text-[#c4b6a8] hover:text-[#8a735e]"
                  >
                    <span className="w-4" />
                    <span>+998 93 079 17 34</span>
                  </a>
                </div>
                <div className="pt-1 border-t border-[#dfd2c0] dark:border-[#383028]">
                  <a
                    href="https://t.me/velmoramahsulotlari"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 font-semibold text-sm text-[#0088cc] hover:underline"
                  >
                    <Send className="w-4 h-4" />
                    <span>@velmoramahsulotlari</span>
                  </a>
                </div>
              </div>

              {/* MOBILE WISHLIST & CART SHORTCUTS */}
              <div className="grid grid-cols-2 gap-2 border-t border-[#ebdcca] pt-4 dark:border-[#332b25]">
                <Link
                  to={user ? "/account?tab=favorites" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[#d8c8b4] bg-white py-3 text-xs font-semibold text-[#3b2d24] shadow-xs dark:border-[#3d342c] dark:bg-[#1f1b17] dark:text-[#e8ded4]"
                >
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>{language === "ru" ? "Избранное" : "Sevimlilar"}</span>
                  {favoriteIds.length > 0 && (
                    <span className="rounded-full bg-[#f4efe6] dark:bg-[#2d251f] px-1.5 py-0.5 text-[10px]">
                      {favoriteIds.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#3b2d24] py-3 text-xs font-semibold text-white shadow-xs dark:bg-[#e5b378] dark:text-[#1c1917]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t("cart")}</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-[#8a735e] dark:bg-[#3b2d24] dark:text-[#f2e6d6] px-1.5 py-0.5 text-[10px] text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;