import axios from "axios";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api/v1";


let accessToken = null;
let refreshPromise = null;


export function setApiAccessToken(token) {
  accessToken = token || null;
}


export function getApiAccessToken() {
  return accessToken;
}


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});


const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});


// =========================
// REQUEST INTERCEPTOR
// =========================

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


// =========================
// REFRESH TOKEN
// =========================

async function getNewAccessToken() {
  if (!refreshPromise) {
    refreshPromise =
      refreshClient
        .post("/auth/refresh/")
        .then((response) => {
          const newToken =
            response.data.access;

          setApiAccessToken(
            newToken
          );

          return newToken;
        })
        .catch((error) => {
          setApiAccessToken(null);

          window.dispatchEvent(
            new Event("auth-expired")
          );

          throw error;
        })
        .finally(() => {
          refreshPromise = null;
        });
  }

  return refreshPromise;
}


// =========================
// RESPONSE INTERCEPTOR
// =========================

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;


    if (!originalRequest) {
      return Promise.reject(
        error
      );
    }


    const status =
      error.response?.status;


    const isRefreshRequest =
      originalRequest.url?.includes(
        "/auth/refresh/"
      );


    const isLoginRequest =
      originalRequest.url?.includes(
        "/auth/login/"
      );


    const isRegisterRequest =
      originalRequest.url?.includes(
        "/auth/register/"
      );


    const isPasswordReset =
      originalRequest.url?.includes(
        "/auth/password-reset/"
      );


    if (
      status !== 401 ||
      originalRequest._retry ||
      isRefreshRequest ||
      isLoginRequest ||
      isRegisterRequest ||
      isPasswordReset
    ) {
      return Promise.reject(
        error
      );
    }


    originalRequest._retry = true;


    try {
      const newToken =
        await getNewAccessToken();


      originalRequest.headers =
        originalRequest.headers || {};


      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;


      return api(
        originalRequest
      );

    } catch (refreshError) {
      return Promise.reject(
        refreshError
      );
    }
  }
);


export default api;