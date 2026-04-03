"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AdminI18nProvider, useI18n, type Lang } from "@/lib/admin-i18n";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      className="rounded-lg border border-gold/10 bg-dark px-2 py-1 font-body text-xs text-cream-dark focus:border-gold/30 focus:outline-none"
    >
      <option value="de">DE</option>
      <option value="en">EN</option>
    </select>
  );
}

function AdminNav({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/categories", label: t("categories") },
    { href: "/admin/products", label: t("products") },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-dvh">
      <nav className="sticky top-0 z-30 border-b border-gold/10 bg-dark-light/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-heading text-lg font-semibold text-gold"
            >
              SB Admin
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 font-body text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-gold/10 text-gold"
                      : "text-cream-dark hover:text-cream"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <Link
              href="/"
              className="font-body text-xs text-cream-dark hover:text-gold transition-colors"
            >
              {t("viewSite")} &rarr;
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-crimson/20 px-3 py-1.5 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10"
            >
              {t("logOut")}
            </button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminI18nProvider>
      <AdminNav>{children}</AdminNav>
    </AdminI18nProvider>
  );
}
