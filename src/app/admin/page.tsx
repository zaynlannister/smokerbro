"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/admin-i18n";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ categories: 0, products: 0 });
  const [instagram, setInstagram] = useState("");
  const [igSaved, setIgSaved] = useState(false);
  const [igSaving, setIgSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([cats, prods, settings]) => {
      setStats({ categories: cats.length, products: prods.length });
      if (settings.instagram_url) setInstagram(settings.instagram_url);
    });
  }, []);

  async function saveInstagram() {
    setIgSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "instagram_url", value: instagram.trim() }),
    });
    setIgSaving(false);
    setIgSaved(true);
    setTimeout(() => setIgSaved(false), 2000);
  }

  const cards = [
    {
      href: "/admin/categories",
      label: t("categories"),
      count: stats.categories,
      icon: "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z",
      color: "gold",
    },
    {
      href: "/admin/products",
      label: t("products"),
      count: stats.products,
      icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
      color: "crimson",
    },
  ];

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-cream sm:text-3xl">
          {t("dashboardTitle")}
        </h1>
        <p className="mt-1 font-body text-sm text-cream-dark">
          {t("management")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl border border-gold/10 bg-dark-light p-6 transition-all hover:border-gold/25 hover:shadow-glow-gold-sm"
          >
            {/* Background accent */}
            <div
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07]"
              style={{
                background: card.color === "gold"
                  ? "radial-gradient(circle, #c9a84c, transparent 70%)"
                  : "radial-gradient(circle, #b22222, transparent 70%)",
              }}
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-cream-dark">
                  {card.label}
                </p>
                <p className="mt-2 font-heading text-4xl font-bold text-cream">
                  {card.count}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color === "gold" ? "bg-gold/10" : "bg-crimson/10"}`}>
                <svg
                  className={`h-5 w-5 ${card.color === "gold" ? "text-gold" : "text-crimson-light"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 font-body text-xs text-cream-dark transition-colors group-hover:text-gold">
              <span>{t("view")}</span>
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Settings */}
      <div className="mt-8 rounded-2xl border border-gold/10 bg-dark-light p-6">
        <h2 className="font-heading text-lg font-semibold text-cream">{t("settings")}</h2>
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block font-body text-xs text-cream-dark">{t("instagramLink")}</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => { setInstagram(e.target.value); setIgSaved(false); }}
              placeholder={t("instagramPlaceholder")}
              className="w-full rounded-lg border border-gold/15 bg-dark-lighter px-3 py-2 font-body text-sm text-cream placeholder:text-cream-dark/40 outline-none transition-colors focus:border-gold/40"
            />
          </div>
          <button
            onClick={saveInstagram}
            disabled={igSaving}
            className="rounded-lg bg-gold/15 px-4 py-2 font-body text-sm font-medium text-gold transition-colors hover:bg-gold/25 disabled:opacity-50"
          >
            {igSaved ? t("saved") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
