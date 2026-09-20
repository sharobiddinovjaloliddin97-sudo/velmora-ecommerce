import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import "./index.css";

import App from "./App.jsx";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  FavoritesProvider,
} from "./context/FavoritesContext";

import {
  LanguageProvider,
} from "./context/LanguageContext";


createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <BrowserRouter>

      <LanguageProvider>

        <AuthProvider>

          <FavoritesProvider>

            <App />

            <Analytics />

          </FavoritesProvider>

        </AuthProvider>

      </LanguageProvider>

    </BrowserRouter>
  </StrictMode>
);