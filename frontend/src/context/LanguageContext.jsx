import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";


const LanguageContext = createContext(null);


const translations = {
  uz: {
    home: "Bosh sahifa",
    catalog: "Katalog",
    about: "Biz haqimizda",
    contact: "Aloqa",

    login: "Kirish",
    register: "Ro‘yxatdan o‘tish",
    account: "Kabinet",
    logout: "Chiqish",
    cart: "Savatcha",

    hello: "Salom",
  },

  ru: {
    home: "Главная",
    catalog: "Каталог",
    about: "О нас",
    contact: "Контакты",

    login: "Войти",
    register: "Регистрация",
    account: "Кабинет",
    logout: "Выйти",
    cart: "Корзина",

    hello: "Здравствуйте",
  },
};


export function LanguageProvider({
  children,
}) {
  const [language, setLanguage] =
    useState(() => {
      return (
        localStorage.getItem(
          "velmora_language"
        ) || "uz"
      );
    });


  useEffect(() => {
    localStorage.setItem(
      "velmora_language",
      language
    );
  }, [language]);


  const changeLanguage = (
    newLanguage
  ) => {
    if (
      newLanguage !== "uz" &&
      newLanguage !== "ru"
    ) {
      return;
    }

    setLanguage(newLanguage);
  };


  const t = (key) => {
    return (
      translations[language]?.[key] ??
      translations.uz[key] ??
      key
    );
  };


  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(
    LanguageContext
  );
}