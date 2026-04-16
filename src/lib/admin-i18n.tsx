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
  view: { de: "Ansehen", en: "View" },

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

  // Tags
  tags: { de: "Tags", en: "Tags" },
  addTag: { de: "Tag hinzuf\u00fcgen", en: "Add tag" },
  tagStrength: { de: "St\u00e4rke", en: "Strength" },
  tagVolume: { de: "Volumen", en: "Volume" },
  tagAlcohol: { de: "Alkohol", en: "Alcohol" },
  tagFlavor: { de: "Geschmack", en: "Flavor" },
  tagCustom: { de: "Eigener Tag", en: "Custom tag" },
  tagIcon: { de: "Icon", en: "Icon" },
  tagLabel: { de: "Label", en: "Label" },
  maxTags: { de: "Maximal 5 Tags erlaubt", en: "Maximum 5 tags allowed" },
  maxImages: { de: "Maximal 5 Bilder erlaubt", en: "Maximum 5 images allowed" },

  // Validation
  valNameMin: { de: "Name muss mindestens 2 Zeichen haben", en: "Name must be at least 2 characters" },
  valNameMax: { de: "Name darf maximal 60 Zeichen haben", en: "Name must be at most 60 characters" },
  valDescMin: { de: "Beschreibung muss mindestens 10 Zeichen haben", en: "Description must be at least 10 characters" },
  valDescMax: { de: "Beschreibung darf maximal 300 Zeichen haben", en: "Description must be at most 300 characters" },
  valPriceMin: { de: "Preis muss gr\u00f6\u00dfer als 0 sein", en: "Price must be greater than 0" },
  valPriceMax: { de: "Preis darf maximal 999\u20ac sein", en: "Price must be at most \u20ac999" },
  valSortOrder: { de: "Reihenfolge muss zwischen 0 und 999 liegen", en: "Sort order must be between 0 and 999" },
  valCatNameMin: { de: "Name muss mindestens 2 Zeichen haben", en: "Name must be at least 2 characters" },
  valCatNameMax: { de: "Name darf maximal 40 Zeichen haben", en: "Name must be at most 40 characters" },
  valSlugInvalid: { de: "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten", en: "Slug can only contain lowercase letters, numbers and hyphens" },

  // Confirm delete
  confirmDeleteTitle: { de: "L\u00f6schen best\u00e4tigen", en: "Confirm deletion" },
  confirmDeleteProductMsg: { de: "M\u00f6chtest du dieses Produkt wirklich l\u00f6schen? Diese Aktion kann nicht r\u00fcckg\u00e4ngig gemacht werden.", en: "Are you sure you want to delete this product? This action cannot be undone." },
  confirmDeleteCategoryMsg: { de: "M\u00f6chtest du diese Kategorie wirklich l\u00f6schen? Alle zugeh\u00f6rigen Produkte werden ebenfalls entfernt.", en: "Are you sure you want to delete this category? All associated products will also be removed." },
  confirmYes: { de: "Ja, l\u00f6schen", en: "Yes, delete" },

  // Search
  searchProducts: { de: "Produkte suchen...", en: "Search products..." },

  // Settings
  settings: { de: "Einstellungen", en: "Settings" },
  instagramLink: { de: "Instagram Link", en: "Instagram Link" },
  instagramPlaceholder: { de: "https://instagram.com/...", en: "https://instagram.com/..." },
  saved: { de: "Gespeichert", en: "Saved" },
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
