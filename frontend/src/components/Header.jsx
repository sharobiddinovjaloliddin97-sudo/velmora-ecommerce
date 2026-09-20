import {
  useCallback,
  useEffect,
  useState,
} from "react";

import api from "../api/client";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useLanguage,
} from "../context/LanguageContext";

import {
  getCart,
} from "../utils/cart";


function Header() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const {
    language,
    changeLanguage,
    t,
  } = useLanguage();


  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const calculateCartCount = () => {
    const cart = getCart();

    return cart.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  };


  const [
    cartCount,
    setCartCount,
  ] = useState(calculateCartCount);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);


  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;


  const loadNotifications =
    useCallback(async () => {
      if (!user) {
        return;
      }

      try {
        const response =
          await api.get(
            "/notifications/"
          );

        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data.results || [];

        setNotifications(data);

      } catch (error) {
        console.error(
          "Notification load error:",
          error
        );
      }
    }, [user]);


  useEffect(() => {
    if (!user) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    window.addEventListener(
      "focus",
      loadNotifications
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "focus",
        loadNotifications
      );
    };
  }, [
    user,
    loadNotifications,
  ]);


  const handleNotificationClick =
    async (notification) => {

      if (!notification.is_read) {
        try {
          await api.post(
            `/notifications/${notification.id}/read/`
          );

          setNotifications(
            (previous) =>
              previous.map((item) =>
                item.id === notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
              )
          );

        } catch (error) {
          console.error(
            "Notification read error:",
            error
          );
        }
      }

      setNotificationOpen(false);

      if (notification.link) {
        navigate(
          notification.link
        );
      }
    };


  const handleMarkAllRead =
    async () => {

      try {
        await api.post(
          "/notifications/read-all/"
        );

        setNotifications(
          (previous) =>
            previous.map((item) => ({
              ...item,
              is_read: true,
            }))
        );

      } catch (error) {
        console.error(
          "Mark all read error:",
          error
        );
      }
    };


  // =========================
  // CART COUNT
  // =========================

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartCount(
        calculateCartCount()
      );
    };

    window.addEventListener(
      "cart-updated",
      handleCartUpdated
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdated
      );
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


  const navClass = ({
    isActive,
  }) =>
    isActive
      ? "font-semibold text-[#173f35]"
      : "text-stone-600 transition hover:text-[#173f35]";


  const mobileNavClass = ({
    isActive,
  }) =>
    isActive
      ? "rounded-xl bg-[#edf1ed] px-4 py-3 font-semibold text-[#173f35]"
      : "rounded-xl px-4 py-3 text-stone-700 transition hover:bg-stone-100";


  const handleLogout =
    async () => {

      await logout();

      setNotifications([]);
      setNotificationOpen(false);
      setMobileMenuOpen(false);

      navigate("/");
    };


  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffdf8]/95 backdrop-blur">

      {/* ========================= */}
      {/* DESKTOP / MAIN BAR */}
      {/* ========================= */}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">

        {/* LOGO */}
        <Link
          to="/"
          className="shrink-0 text-xl font-bold tracking-tight text-[#173f35] sm:text-2xl"
        >
          Velmora
        </Link>


        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-6 lg:flex">

          <NavLink
            to="/"
            className={navClass}
          >
            {t("home")}
          </NavLink>

          <NavLink
            to="/catalog"
            className={navClass}
          >
            {t("catalog")}
          </NavLink>

          <NavLink
            to="/about"
            className={navClass}
          >
            {t("about")}
          </NavLink>

          <NavLink
            to="/contact"
            className={navClass}
          >
            {t("contact")}
          </NavLink>

        </nav>


        {/* RIGHT SIDE */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* LANGUAGE - DESKTOP */}
          <div className="hidden rounded-full border border-stone-300 bg-white p-1 sm:flex">

            <button
              type="button"
              onClick={() =>
                changeLanguage(
                  "uz"
                )
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                language === "uz"
                  ? "bg-[#173f35] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              UZ
            </button>

            <button
              type="button"
              onClick={() =>
                changeLanguage(
                  "ru"
                )
              }
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                language === "ru"
                  ? "bg-[#173f35] text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              RU
            </button>

          </div>


          {/* DESKTOP AUTH */}
          <div className="hidden items-center gap-3 lg:flex">

            {user ? (
              <>
                <span className="hidden text-sm text-stone-600 xl:block">

                  {t("hello")},{" "}

                  <span className="font-medium text-[#173f35]">
                    {user.first_name}
                  </span>

                </span>


                <Link
                  to="/account"
                  className="text-sm font-medium text-[#173f35] hover:underline"
                >
                  {t("account")}
                </Link>


                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="text-sm font-medium text-[#173f35] hover:underline"
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-[#173f35] hover:underline"
                >
                  {t("login")}
                </Link>

                <Link
                  to="/register"
                  className="text-sm font-medium text-stone-600 hover:text-[#173f35]"
                >
                  {t("register")}
                </Link>
              </>
            )}

          </div>


          {/* NOTIFICATIONS */}
          {user && (
            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(
                    (current) => !current
                  )
                }
                aria-label={
                  language === "ru"
                    ? "Уведомления"
                    : "Bildirishnomalar"
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-base text-[#173f35] transition hover:bg-stone-100 sm:h-11 sm:w-11 sm:text-xl"
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white sm:min-h-5 sm:min-w-5 sm:text-[10px]">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>


              {notificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[60] bg-black/20 sm:hidden"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                    aria-hidden="true"
                  />
                  <div className="fixed inset-x-3 top-16 z-[70] max-h-[80vh] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-[380px]">

                  <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">

                    <h3 className="font-semibold text-[#173f35]">
                      {language === "ru"
                        ? "Уведомления"
                        : "Bildirishnomalar"}
                    </h3>


                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={
                          handleMarkAllRead
                        }
                        className="text-xs font-medium text-[#52796f] hover:underline"
                      >
                        {language === "ru"
                          ? "Прочитать все"
                          : "Barchasini o‘qish"}
                      </button>
                    )}

                  </div>


                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length === 0 ? (

                      <div className="px-5 py-8 text-center text-sm text-stone-500">
                        {language === "ru"
                          ? "Уведомлений пока нет."
                          : "Hozircha bildirishnoma yo‘q."}
                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`block w-full border-b border-stone-100 px-4 py-4 text-left transition last:border-b-0 hover:bg-stone-50 ${
                              notification.is_read
                                ? "bg-white"
                                : "bg-[#f1f7f4]"
                            }`}
                          >

                            <div className="flex gap-3">

                              <span className="mt-1 text-lg">
                                🔔
                              </span>


                              <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-3">

                                  <p className="font-semibold text-[#173f35]">
                                    {language === "ru"
                                      ? notification.title_ru
                                      : notification.title_uz}
                                  </p>

                                  {!notification.is_read && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-600" />
                                  )}

                                </div>


                                <p className="mt-1 line-clamp-3 text-sm leading-5 text-stone-600">
                                  {
                                    notification.message
                                  }
                                </p>


                                <p className="mt-2 text-xs text-stone-400">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString(
                                    language === "ru"
                                      ? "ru-RU"
                                      : "uz-UZ"
                                  )}
                                </p>

                              </div>

                            </div>

                          </button>

                        )
                      )

                    )}

                  </div>

                </div>
                </>
              )}

            </div>
          )}


          {/* CART */}
          <Link
            to="/cart"
            aria-label={t("cart")}
            className="relative flex h-9 items-center justify-center rounded-full bg-[#173f35] px-2.5 text-xs font-medium text-white transition hover:bg-[#245448] sm:h-11 sm:px-4 sm:text-sm"
          >

            <span className="hidden sm:inline">
              {t("cart")}
            </span>

            <span className="sm:hidden">
              🛒
            </span>


            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#173f35] shadow sm:-right-2 sm:-top-2 sm:min-h-6 sm:min-w-6 sm:px-1.5 sm:text-xs">

                {cartCount > 99
                  ? "99+"
                  : cartCount}

              </span>
            )}

          </Link>


          {/* HAMBURGER */}
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
            aria-expanded={
              mobileMenuOpen
            }
            onClick={() =>
              setMobileMenuOpen(
                (current) =>
                  !current
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-xl text-[#173f35] lg:hidden sm:h-11 sm:w-11 sm:text-2xl"
          >

            {mobileMenuOpen
              ? "×"
              : "☰"}

          </button>

        </div>

      </div>


      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}

      {mobileMenuOpen && (

        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-stone-200 bg-[#fffdf8] lg:hidden">

          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">

            {/* MOBILE LANGUAGE */}
            <div className="mb-5 flex items-center justify-between">

              <span className="text-sm font-medium text-stone-600">
                {language === "ru"
                  ? "Язык"
                  : "Til"}
              </span>


              <div className="flex rounded-full border border-stone-300 bg-white p-1">

                <button
                  type="button"
                  onClick={() =>
                    changeLanguage(
                      "uz"
                    )
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    language === "uz"
                      ? "bg-[#173f35] text-white"
                      : "text-stone-600"
                  }`}
                >
                  UZ
                </button>


                <button
                  type="button"
                  onClick={() =>
                    changeLanguage(
                      "ru"
                    )
                  }
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                    language === "ru"
                      ? "bg-[#173f35] text-white"
                      : "text-stone-600"
                  }`}
                >
                  RU
                </button>

              </div>

            </div>


            {/* MOBILE NAV */}
            <nav className="flex flex-col gap-1">

              <NavLink
                to="/"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={
                  mobileNavClass
                }
              >
                {t("home")}
              </NavLink>

              <NavLink
                to="/catalog"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={
                  mobileNavClass
                }
              >
                {t("catalog")}
              </NavLink>

              <NavLink
                to="/about"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={
                  mobileNavClass
                }
              >
                {t("about")}
              </NavLink>

              <NavLink
                to="/contact"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className={
                  mobileNavClass
                }
              >
                {t("contact")}
              </NavLink>

            </nav>


            {/* AUTH */}
            <div className="mt-5 border-t border-stone-200 pt-5">

              {user ? (
                <div className="space-y-3">

                  <div className="rounded-2xl bg-[#f3efe7] p-4">

                    <p className="text-xs text-stone-500">

                      {language === "ru"
                        ? "Вы вошли как"
                        : "Siz tizimga kirgansiz"}

                    </p>

                    <p className="mt-1 truncate font-semibold text-[#173f35]">

                      {user.first_name ||
                        user.email}

                    </p>

                    <p className="mt-1 truncate text-sm text-stone-500">
                      {user.email}
                    </p>

                  </div>


                  <Link
                    to="/account"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="block rounded-xl border border-[#173f35] px-4 py-3 text-center font-medium text-[#173f35]"
                  >
                    {t("account")}
                  </Link>


                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="w-full rounded-xl bg-[#173f35] px-4 py-3 font-medium text-white"
                  >
                    {t("logout")}
                  </button>

                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">

                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="rounded-xl bg-[#173f35] px-4 py-3 text-center font-medium text-white"
                  >
                    {t("login")}
                  </Link>

                  <Link
                    to="/register"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="rounded-xl border border-[#173f35] px-4 py-3 text-center font-medium text-[#173f35]"
                  >
                    {t("register")}
                  </Link>

                </div>
              )}

            </div>


            {/* MOBILE CART */}
            <Link
              to="/cart"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="mt-4 flex items-center justify-between rounded-xl bg-[#eee7da] px-4 py-3 font-medium text-[#173f35]"
            >

              <span>
                🛒 {t("cart")}
              </span>

              <span>
                {cartCount}
              </span>

            </Link>

          </div>

        </div>
      )}

    </header>
  );
}


export default Header;