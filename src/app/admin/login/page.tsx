"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/admin-i18n";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      const data = await res.json();
      setError(data.error || t("loginFailed"));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-gold/10 bg-dark-light p-8"
      >
        <h1 className="font-heading text-2xl font-semibold text-cream">
          {t("adminLogin")}
        </h1>
        <p className="mt-1 font-body text-sm text-cream-dark">
          {t("management")}
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-crimson/10 border border-crimson/20 px-4 py-2 text-sm text-crimson-light">
            {error}
          </div>
        )}

        <label className="mt-6 block">
          <span className="font-body text-xs uppercase tracking-wider text-cream-dark">
            {t("username")}
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gold/10 bg-dark px-4 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
            placeholder="admin"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-body text-xs uppercase tracking-wider text-cream-dark">
            {t("password")}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gold/10 bg-dark px-4 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
            placeholder="••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-gold py-2.5 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {loading ? t("signingIn") : t("signIn")}
        </button>
      </form>
    </div>
  );
}
