import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api, {
  setApiAccessToken,
} from "../api/client";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [
    accessToken,
    setAccessTokenState,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);


  // =========================
  // SET TOKEN
  // =========================

  const updateAccessToken = (
    token
  ) => {
    setAccessTokenState(
      token
    );

    setApiAccessToken(
      token
    );
  };


  // =========================
  // LOAD PROFILE
  // =========================

  const loadProfile =
    async () => {

      const response =
        await api.get(
          "/auth/profile/"
        );

      setUser(
        response.data
      );

      return response.data;
    };


  // =========================
  // REFRESH
  // =========================

  const refreshAccessToken =
    async () => {

      try {
        const response =
          await api.post(
            "/auth/refresh/"
          );

        const token =
          response.data.access;

        updateAccessToken(
          token
        );

        return token;

      } catch {
        updateAccessToken(null);
        setUser(null);

        return null;
      }
    };


  // =========================
  // INITIAL AUTH
  // =========================

  useEffect(() => {
    const initializeAuth =
      async () => {

        try {
          const response =
            await api.post(
              "/auth/refresh/"
            );

          const token =
            response.data.access;

          updateAccessToken(
            token
          );


          const profileResponse =
            await api.get(
              "/auth/profile/"
            );

          setUser(
            profileResponse.data
          );

        } catch {
          updateAccessToken(null);
          setUser(null);

        } finally {
          setLoading(false);
        }
      };


    initializeAuth();
  }, []);


  // =========================
  // AUTH EXPIRED EVENT
  // =========================

  useEffect(() => {
    const handleAuthExpired =
      () => {

        updateAccessToken(
          null
        );

        setUser(null);
      };


    window.addEventListener(
      "auth-expired",
      handleAuthExpired
    );


    return () => {
      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );
    };
  }, []);


  // =========================
  // LOGIN
  // =========================

  const login = async (
    email,
    password
  ) => {

    const response =
      await api.post(
        "/auth/login/",
        {
          email,
          password,
        }
      );


    const token =
      response.data.access;


    updateAccessToken(
      token
    );


    setUser(
      response.data.user
    );


    return response.data;
  };


  // =========================
  // LOGOUT
  // =========================

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout/"
      );

    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

    } finally {
      updateAccessToken(null);
      setUser(null);
    }
  };


  const value = {
    user,

    accessToken,

    loading,

    login,

    logout,

    refreshAccessToken,

    loadProfile,

    setUser,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(
    AuthContext
  );
}