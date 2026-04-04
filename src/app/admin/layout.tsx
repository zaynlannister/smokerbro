"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { AdminI18nProvider, useI18n, type Lang } from "@/lib/admin-i18n";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const options: { value: Lang; label: string }[] = [
    { value: "de", label: "Deutsch" },
    { value: "en", label: "English" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-gold/15 bg-dark-lighter px-2.5 py-1.5 font-body text-xs font-medium text-cream transition-colors hover:border-gold/30"
      >
        {lang.toUpperCase()}
        <svg className={`h-3 w-3 text-cream-dark transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-28 rounded-lg border border-gold/15 bg-dark-lighter py-1 shadow-xl shadow-black/40">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setLang(opt.value); setOpen(false); }}
              className={`w-full px-3 py-1.5 text-left font-body text-xs transition-colors hover:bg-gold/10 ${
                opt.value === lang ? "text-gold" : "text-cream"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
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
    { href: "/admin", label: t("dashboard"), icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" },
    { href: "/admin/categories", label: t("categories"), icon: "M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" },
    { href: "/admin/products", label: t("products"), icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-dark">
      <nav className="sticky top-0 z-30 border-b border-gold/10 bg-dark-light">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
                <span className="font-heading text-sm font-bold text-gold">SB</span>
              </div>
              <span className="hidden font-heading text-base font-semibold text-cream sm:block">
                Smoker Bro
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <LangSwitch />
              <Link
                href="/"
                className="hidden items-center gap-1 rounded-lg border border-gold/15 px-3 py-1.5 font-body text-xs text-cream-dim transition-colors hover:border-gold/30 hover:text-cream sm:inline-flex"
              >
                {t("viewSite")}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-crimson/20 px-3 py-1.5 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10 hover:border-crimson/30"
              >
                {t("logOut")}
              </button>
            </div>
          </div>

          <div className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 font-body text-sm transition-colors ${
                    active
                      ? "border-gold text-gold"
                      : "border-transparent text-cream-dark hover:text-cream hover:border-cream-dark/30"
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
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
