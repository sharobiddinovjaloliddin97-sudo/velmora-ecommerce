import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/client";
import { useAuth } from "./AuthContext";


const FavoritesContext =
  createContext(null);


export function FavoritesProvider({
  children,
}) {
  const { user } = useAuth();

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);


  // =========================
  // LOAD FAVORITES
  // =========================

  const loadFavorites =
    async () => {

      if (!user) {
        setFavoriteIds([]);
        return;
      }

      try {
        setLoading(true);

        const response =
          await api.get(
            "/favorites/"
          );


        const favorites =
          response.data.results ??
          response.data;


        setFavoriteIds(
          favorites.map(
            (favorite) =>
              favorite.product.id
          )
        );

      } catch (error) {
        console.error(
          "Favorites load error:",
          error.response?.data ||
            error
        );

      } finally {
        setLoading(false);
      }
    };


  // Login/logout o‘zgarsa
  // favorites qayta yuklanadi
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let cancelled = false;

    api.get(
      "/favorites/"
    )
      .then((response) => {
        if (cancelled) {
          return;
        }

        const favorites =
          response.data.results ??
          response.data;

        setFavoriteIds(
          favorites.map(
            (favorite) =>
              favorite.product.id
          )
        );
      })
      .catch((error) => {
        if (!cancelled) {
          console.error(
            "Favorites load error:",
            error.response?.data ||
              error
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);


  // =========================
  // ADD FAVORITE
  // =========================

  const addFavorite =
    async (productId) => {

      if (!user) {
        throw new Error(
          "AUTH_REQUIRED"
        );
      }


      await api.post(
        "/favorites/",
        {
          product_id:
            productId,
        }
      );


      setFavoriteIds(
        (current) => {

          if (
            current.includes(
              productId
            )
          ) {
            return current;
          }

          return [
            ...current,
            productId,
          ];
        }
      );
    };


  // =========================
  // REMOVE FAVORITE
  // =========================

  const removeFavorite =
    async (productId) => {

      if (!user) {
        throw new Error(
          "AUTH_REQUIRED"
        );
      }


      await api.delete(
        `/favorites/${productId}/`
      );


      setFavoriteIds(
        (current) =>
          current.filter(
            (id) =>
              id !== productId
          )
      );
    };


  // =========================
  // TOGGLE
  // =========================

  const toggleFavorite =
    async (productId) => {

      if (
        favoriteIds.includes(
          productId
        )
      ) {

        await removeFavorite(
          productId
        );

        return false;
      }


      await addFavorite(
        productId
      );

      return true;
    };


  // =========================
  // CHECK
  // =========================

  const isFavorite = (
    productId
  ) => {

    return (
      Boolean(user) &&
      favoriteIds.includes(
        productId
      )
    );
  };


  const value = {
    favoriteIds,

    loading,

    isFavorite,

    addFavorite,

    removeFavorite,

    toggleFavorite,

    loadFavorites,
  };


  return (
    <FavoritesContext.Provider
      value={value}
    >
      {children}
    </FavoritesContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites() {
  return useContext(
    FavoritesContext
  );
}