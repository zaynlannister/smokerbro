"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/admin-i18n";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ categories: 0, products: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ]).then(([cats, prods]) => {
      setStats({ categories: cats.length, products: prods.length });
    });
  }, []);

  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold text-cream">
        {t("dashboardTitle")}
      </h1>
      <p className="mt-1 font-body text-sm text-cream-dark">
        {t("management")}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/categories"
          className="rounded-xl border border-gold/10 bg-dark-light p-6 transition-colors hover:border-gold/20"
        >
          <p className="font-heading text-3xl font-bold text-gold">
            {stats.categories}
          </p>
          <p className="mt-1 font-body text-sm text-cream-dark">
            {t("categories")}
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="rounded-xl border border-gold/10 bg-dark-light p-6 transition-colors hover:border-gold/20"
        >
          <p className="font-heading text-3xl font-bold text-gold">
            {stats.products}
          </p>
          <p className="mt-1 font-body text-sm text-cream-dark">
            {t("products")}
          </p>
        </Link>
      </div>
    </div>
  );
}
