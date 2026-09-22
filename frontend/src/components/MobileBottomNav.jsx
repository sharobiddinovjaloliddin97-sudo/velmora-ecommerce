import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home, ShoppingBag, Sparkles, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import { getCart } from "../utils/cart";

function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { favoriteIds } = useFavorites();

  const calculateCartCount = () => {
    const cart = getCart();
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  };

  const [cartCount, setCartCount] = useState(calculateCartCount);

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartCount(calculateCartCount());
    };
    window.addEventListener("cart-updated", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  const navItems = [
    {
      to: "/",
      label: language === "ru" ? "Главная" : "Asosiy",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      to: "/catalog",
      label: language === "ru" ? "Каталог" : "Katalog",
      icon: Sparkles,
      isActive: location.pathname.startsWith("/catalog") || location.pathname.startsWith("/products"),
    },
    {
      to: "/cart",
      label: language === "ru" ? "Корзина" : "Savat",
      icon: ShoppingBag,
      badge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : null,
      badgeColor: "bg-[#8a735e] dark:bg-[#c1a27c]",
      isActive: location.pathname === "/cart" || location.pathname === "/checkout",
    },
    {
      to: user ? "/account" : "/login",
      label: language === "ru" ? "Избранное" : "Sevimlilar",
      icon: Heart,
      badge: favoriteIds.length > 0 ? (favoriteIds.length > 99 ? "99+" : favoriteIds.length) : null,
      badgeColor: "bg-rose-500",
      isActive: location.pathname === "/account" && location.search.includes("tab=favorites"),
    },
    {
      to: user ? "/account" : "/login",
      label: user
        ? language === "ru"
          ? "Кабинет"
          : "Profil"
        : language === "ru"
          ? "Войти"
          : "Kirish",
      icon: User,
      hasDot: !!user,
      isActive:
        (location.pathname === "/account" && !location.search.includes("tab=favorites")) ||
        location.pathname === "/login" ||
        location.pathname === "/register",
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-[#ebdcca] bg-white/95 backdrop-blur-md transition-colors duration-200 lg:hidden dark:border-[#332b25] dark:bg-[#141210]/95 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`group relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 ${
                active
                  ? "text-[#3b2d24] dark:text-[#f2e6d6]"
                  : "text-[#7a6758] hover:text-[#3b2d24] dark:text-[#a09081] dark:hover:text-[#e8ded4]"
              }`}
            >
              <div className="relative">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 ${
                    active ? "scale-110 font-bold" : "group-hover:scale-105"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active
                        ? "stroke-[2.5px] text-[#3b2d24] dark:text-[#e5b378]"
                        : "stroke-[1.8px]"
                    }`}
                  />
                </div>

                {/* Badge for cart or favorites */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-xs ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Dot for logged-in profile */}
                {item.hasDot && !item.badge && (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#141210]" />
                )}
              </div>

              <span
                className={`mt-0.5 text-[10px] tracking-tight ${
                  active
                    ? "font-bold text-[#3b2d24] dark:text-[#e5b378]"
                    : "font-medium"
                }`}
              >
                {item.label}
              </span>

              {/* Active Indicator bar */}
              {active && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-[#3b2d24] dark:bg-[#e5b378]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
