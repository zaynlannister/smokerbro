"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/admin-i18n";
import AdminModal from "@/components/AdminModal";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

const empty = { name: "", slug: "", icon: "", sortOrder: 0 };

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }

  useEffect(() => { load(); }, []);

  function autoSlug(name: string) {
    return name.toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe")
      .replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function openNew() {
    setEditId(null);
    setForm(empty);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(empty);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const slug = form.slug || autoSlug(form.name);
    const body = { ...form, slug, sortOrder: Number(form.sortOrder) };

    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setLoading(false);
    closeModal();
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm(t("confirmDeleteCategory"))) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-cream">
          {t("categories")}
        </h1>
        <button
          onClick={openNew}
          className="rounded-lg bg-gold px-4 py-2 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
        >
          + {t("add")}
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-xl border border-gold/10 bg-dark-light px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat.icon}</span>
              <div>
                <p className="font-heading text-base font-semibold text-cream">{cat.name}</p>
                <p className="font-body text-xs text-cream-dark">
                  /{cat.slug} &middot; {t("order")}: {cat.sortOrder}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(cat)}
                className="rounded-lg border border-gold/20 px-3 py-1 font-body text-xs text-gold transition-colors hover:bg-gold/10"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="rounded-lg border border-crimson/20 px-3 py-1 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-cream-dark">
            {t("noCategories")}
          </p>
        )}
      </div>

      {/* Create / Edit modal */}
      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editId ? t("editCategory") : t("newCategory")}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder={t("name")}
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })
            }
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <input
            placeholder={t("slug")}
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <input
            placeholder={t("iconEmoji")}
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <input
            type="number"
            placeholder={t("sortOrder")}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gold px-5 py-2.5 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light disabled:opacity-50"
            >
              {editId ? t("save") : t("add")}
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-cream-dark/20 px-5 py-2.5 font-body text-sm text-cream-dark"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
