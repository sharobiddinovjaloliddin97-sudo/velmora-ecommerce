import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Heart,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language } = useLanguage();

  const primaryImage =
    product.images?.find((image) => image.is_primary) ??
    product.images?.[0];

  const secondaryImage =
    product.images?.find((image) => !image.is_primary) ?? null;

  const favorite = isFavorite(product.id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });
      return;
    }

    try {
      await toggleFavorite(product.id);
    } catch (error) {
      console.error("Favorite error:", error);
    }
  };

  const uniqueColors = product.variants
    ? Array.from(
        new Set(
          product.variants
            .filter((v) => v.color_code)
            .map((v) => v.color_code)
        )
      ).slice(0, 4)
    : [];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#ebdcca] dark:border-[#2d241c] bg-white dark:bg-[#1e1915] shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#8a735e]/50 dark:hover:border-[#c1a27c]/50 hover:shadow-xl">
      
      {/* BADGES & FAVORITE BUTTON */}
      <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between sm:inset-x-4 sm:top-4">
        {product.is_featured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3b2d24]/90 dark:bg-[#c1a27c]/90 px-3 py-1 text-xs font-semibold tracking-wider text-white dark:text-[#1e1915] backdrop-blur-xs shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#c1a27c] dark:text-[#1e1915]" />
            <span>{language === "ru" ? "Хит продаж" : "Tanlangan"}</span>
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            favorite
              ? language === "ru"
                ? "Удалить из избранного"
                : "Sevimlidan o‘chirish"
              : language === "ru"
                ? "Добавить в избранное"
                : "Sevimliga qo‘shish"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c8b4] dark:border-[#383028] bg-white/95 dark:bg-[#1e1915]/95 shadow-xs backdrop-blur-xs transition duration-200 hover:scale-110 active:scale-95 ${
            favorite
              ? "text-rose-500 shadow-rose-100 dark:shadow-rose-950/50"
              : "text-[#7a6758] dark:text-[#c4a98e] hover:text-rose-500"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${
              favorite ? "fill-rose-500 text-rose-500" : ""
            }`}
          />
        </button>
      </div>

      {/* PRODUCT LINK & IMAGE */}
      <Link
        to={`/products/${product.slug}`}
        className="flex flex-1 flex-col"
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-[#f4efe6] dark:bg-[#261f1a]">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.image}
                alt={product.name}
                className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                  secondaryImage ? "group-hover:opacity-0" : ""
                }`}
              />
              {secondaryImage && (
                <img
                  src={secondaryImage.image}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#8a735e] dark:text-[#c4a98e]">
              {language === "ru" ? "Нет изображения" : "Rasm mavjud emas"}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* CATEGORY & VARIANTS */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-wider text-[#8a735e] dark:text-[#c4a98e] uppercase">
                {product.category?.name || "Velmora"}
              </span>

              {/* COLOR SWATCH PREVIEWS */}
              {uniqueColors.length > 1 && (
                <div className="flex items-center -space-x-1">
                  {uniqueColors.map((color, index) => (
                    <span
                      key={index}
                      className="h-3 w-3 rounded-full border border-white dark:border-[#1e1915] shadow-xs"
                      style={{
                        backgroundColor:
                          color.toLowerCase().includes("beige") ||
                          color.toLowerCase().includes("krem")
                            ? "#e8dfce"
                            : color.toLowerCase().includes("green") ||
                              color.toLowerCase().includes("yashil")
                              ? "#3b2d24"
                              : color.toLowerCase().includes("white") ||
                                color.toLowerCase().includes("oq")
                                ? "#ffffff"
                                : color.toLowerCase().includes("grey") ||
                                  color.toLowerCase().includes("kulrang")
                                  ? "#9ca3af"
                                  : "#c1a27c",
                      }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* TITLE */}
            <h3 className="mt-1.5 line-clamp-2 text-base sm:text-lg font-bold tracking-tight text-[#3b2d24] dark:text-[#f3ede4] transition-colors group-hover:text-[#8a735e] dark:group-hover:text-[#c1a27c]">
              {product.name}
            </h3>
          </div>

          {/* PRICE & ACTION */}
          <div className="mt-4 flex items-baseline justify-between border-t border-[#f4efe6] dark:border-[#2d241c] pt-3">
            <div>
              <p className="text-xs font-medium text-[#8a735e] dark:text-[#c4a98e]">
                {language === "ru" ? "от" : "dan"}
              </p>
              <p className="text-base sm:text-xl font-bold text-[#3b2d24] dark:text-[#c1a27c]">
                {product.min_price
                  ? `${Number(product.min_price).toLocaleString("uz-UZ")} so‘m`
                  : language === "ru"
                    ? "Цена недоступна"
                    : "Narx mavjud emas"}
              </p>
            </div>

            <span className="text-xs sm:text-sm font-bold text-[#8a735e] dark:text-[#c4a98e] transition group-hover:translate-x-0.5 group-hover:text-[#3b2d24] dark:group-hover:text-[#f3ede4]">
              {language === "ru" ? "Подробнее →" : "Batafsil →"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;