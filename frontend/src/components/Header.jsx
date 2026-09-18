import {
  useEffect,
  useState,
} from "react";

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

      setMobileMenuOpen(false);

      navigate("/");
    };


  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffdf8]/95 backdrop-blur">

      {/* ========================= */}
      {/* DESKTOP / MAIN BAR */}
      {/* ========================= */}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

        {/* LOGO */}
        <Link
          to="/"
          className="shrink-0 text-2xl font-bold text-[#173f35]"
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
        <div className="flex items-center gap-2 sm:gap-3">

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


          {/* CART */}
          <Link
            to="/cart"
            aria-label={t("cart")}
            className="relative flex h-11 items-center justify-center rounded-full bg-[#173f35] px-4 text-sm font-medium text-white transition hover:bg-[#245448]"
          >

            <span className="hidden sm:inline">
              {t("cart")}
            </span>

            <span className="sm:hidden">
              🛒
            </span>


            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-[#173f35] shadow">

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
            className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-2xl text-[#173f35] lg:hidden"
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

        <div className="border-t border-stone-200 bg-[#fffdf8] lg:hidden">

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

                    <p className="mt-1 font-semibold text-[#173f35]">

                      {user.first_name ||
                        user.email}

                    </p>

                    <p className="mt-1 text-sm text-stone-500">
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