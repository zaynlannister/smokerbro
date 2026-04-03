"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "de" | "en";

const translations = {
  // Nav
  dashboard: { de: "Dashboard", en: "Dashboard" },
  categories: { de: "Kategorien", en: "Categories" },
  products: { de: "Produkte", en: "Products" },
  viewSite: { de: "Seite ansehen", en: "View site" },
  logOut: { de: "Abmelden", en: "Log out" },

  // Login
  adminLogin: { de: "Admin Login", en: "Admin Login" },
  management: { de: "Smoker Bro Verwaltung", en: "Smoker Bro Management" },
  username: { de: "Benutzername", en: "Username" },
  password: { de: "Passwort", en: "Password" },
  signIn: { de: "Anmelden", en: "Sign in" },
  signingIn: { de: "Anmelden...", en: "Signing in..." },
  loginFailed: { de: "Anmeldung fehlgeschlagen", en: "Login failed" },

  // Dashboard
  dashboardTitle: { de: "Dashboard", en: "Dashboard" },

  // Categories
  newCategory: { de: "Neue Kategorie", en: "New Category" },
  editCategory: { de: "Kategorie bearbeiten", en: "Edit Category" },
  name: { de: "Name", en: "Name" },
  slug: { de: "Slug", en: "Slug" },
  iconEmoji: { de: "Icon (Emoji)", en: "Icon (emoji)" },
  sortOrder: { de: "Reihenfolge", en: "Sort order" },
  save: { de: "Speichern", en: "Save" },
  add: { de: "Hinzuf\u00fcgen", en: "Add" },
  cancel: { de: "Abbrechen", en: "Cancel" },
  edit: { de: "Bearbeiten", en: "Edit" },
  delete: { de: "L\u00f6schen", en: "Delete" },
  order: { de: "Reihenfolge", en: "Order" },
  confirmDeleteCategory: {
    de: "Kategorie wirklich l\u00f6schen? Alle Produkte werden entfernt.",
    en: "Delete this category? All its products will be removed.",
  },
  noCategories: {
    de: "Noch keine Kategorien vorhanden.",
    en: "No categories yet.",
  },

  // Products
  newProduct: { de: "Neues Produkt", en: "New Product" },
  editProduct: { de: "Produkt bearbeiten", en: "Edit Product" },
  allCategories: { de: "Alle Kategorien", en: "All categories" },
  selectCategory: { de: "Kategorie w\u00e4hlen", en: "Select category" },
  description: { de: "Beschreibung", en: "Description" },
  priceEur: { de: "Preis (\u20ac)", en: "Price (\u20ac)" },
  noBadge: { de: "Kein Badge", en: "No badge" },
  uploading: { de: "Hochladen...", en: "Uploading..." },
  remove: { de: "Entfernen", en: "Remove" },
  confirmDeleteProduct: {
    de: "Produkt wirklich l\u00f6schen?",
    en: "Delete this product?",
  },
  noProducts: {
    de: "Noch keine Produkte vorhanden.",
    en: "No products yet.",
  },
  images: { de: "Bilder", en: "Images" },
  addImages: { de: "Bilder hinzuf\u00fcgen", en: "Add images" },

  // Badges
  badge_beliebt: { de: "Beliebt", en: "Popular" },
  badge_neu: { de: "Neu", en: "New" },
  badge_scharf: { de: "Scharf", en: "Spicy" },
} as const;

type Key = keyof typeof translations;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "de",
  setLang: () => {},
  t: (k) => translations[k].de,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("de");

  useEffect(() => {
    const stored = localStorage.getItem("admin_lang") as Lang | null;
    if (stored && (stored === "de" || stored === "en")) {
      setLang(stored);
    }
  }, []);

  function handleSetLang(l: Lang) {
    setLang(l);
    localStorage.setItem("admin_lang", l);
  }

  function t(key: Key): string {
    return translations[key][lang];
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}
