import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";


function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const { language } = useLanguage();


  const primaryImage =
    product.images?.find(
      (image) => image.is_primary
    ) ??
    product.images?.[0];


  const favorite =
    isFavorite(product.id);


  const handleFavorite = async () => {
    if (!user) {
      navigate(
        "/login",
        {
          state: {
            from: location.pathname,
          },
        }
      );

      return;
    }

    try {
      await toggleFavorite(
        product.id
      );
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );
    }
  };


  return (
    <article className="relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-[28px]">

      {/* FAVORITE */}
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
        title={
          favorite
            ? language === "ru"
              ? "Удалить из избранного"
              : "Sevimlidan o‘chirish"
            : language === "ru"
              ? "Добавить в избранное"
              : "Sevimliga qo‘shish"
        }
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-base text-[#173f35] shadow sm:right-4 sm:top-4 sm:h-11 sm:w-11 sm:text-xl"
      >
        {favorite ? "♥" : "♡"}
      </button>


      <Link
        to={`/products/${product.slug}`}
        className="block"
      >

        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-[#eee9df] md:aspect-[4/5] sm:rounded-t-[28px]">

          {primaryImage ? (
            <img
              src={primaryImage.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              {language === "ru"
                ? "Нет изображения"
                : "Rasm mavjud emas"}
            </div>
          )}

        </div>


        {/* INFO */}
        <div className="p-4 sm:p-5">

          <p className="truncate text-xs text-stone-500 sm:text-sm">
            {product.category?.name}
          </p>

          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-[#173f35] break-words sm:text-lg">
            {product.name}
          </h3>

          <p className="mt-3 truncate text-base font-semibold text-[#173f35] sm:mt-4 sm:text-lg">

            {product.min_price
              ? `${Number(
                  product.min_price
                ).toLocaleString(
                  "uz-UZ"
                )} so‘m`
              : language === "ru"
                ? "Цена недоступна"
                : "Narx mavjud emas"}

          </p>

        </div>

      </Link>

    </article>
  );
}


export default ProductCard;