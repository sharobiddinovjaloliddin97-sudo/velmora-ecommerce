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
    <article className="relative overflow-hidden rounded-[28px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

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
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-xl text-[#173f35] shadow"
      >
        {favorite ? "♥" : "♡"}
      </button>


      <Link
        to={`/products/${product.slug}`}
        className="block"
      >

        {/* IMAGE */}
        <div className="aspect-[4/5] overflow-hidden bg-[#eee9df]">

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
        <div className="p-5">

          <p className="text-sm text-stone-500">
            {product.category?.name}
          </p>

          <h3 className="mt-1 text-xl font-semibold text-[#173f35]">
            {product.name}
          </h3>

          <p className="mt-4 font-semibold text-[#173f35]">

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