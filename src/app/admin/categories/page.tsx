"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/admin-i18n";
import AdminModal from "@/components/AdminModal";
import ConfirmModal from "@/components/ConfirmModal";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

const empty = { name: "", slug: "", icon: "", sortOrder: 0 };

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 font-body text-[11px] text-crimson-light">{msg}</p>;
}

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

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

  function openNew() { setEditId(null); setForm(empty); setErrors({}); setModalOpen(true); }
  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder });
    setErrors({});
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditId(null); setForm(empty); setErrors({}); }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t("valCatNameMin");
    else if (form.name.trim().length > 40) e.name = t("valCatNameMax");
    const slug = form.slug || autoSlug(form.name);
    if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) e.slug = t("valSlugInvalid");
    const sort = Number(form.sortOrder);
    if (sort < 0 || sort > 999) e.sortOrder = t("valSortOrder");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const slug = form.slug || autoSlug(form.name);
    const body = { name: form.name.trim(), slug, icon: form.icon, sortOrder: Number(form.sortOrder) };
    if (editId) {
      await fetch(`/api/categories/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setLoading(false); closeModal(); load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    load();
  }

  const inputClass = "w-full rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none";
  const inputErrorClass = "w-full rounded-lg border border-crimson/30 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-crimson/50 focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-cream sm:text-3xl">
          {t("categories")}
        </h1>
        <button
          onClick={openNew}
          className="shrink-0 rounded-lg bg-gold px-3 py-2 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
        >
          + {t("add")}
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-xl border border-gold/10 bg-dark-light p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-base font-semibold text-cream truncate">{cat.name}</p>
                <p className="font-body text-xs text-cream-dark">
                  /{cat.slug} &middot; {t("order")}: {cat.sortOrder}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 sm:justify-end">
              <button
                onClick={() => openEdit(cat)}
                className="flex-1 rounded-lg border border-gold/20 py-1.5 px-4 font-body text-xs text-gold transition-colors hover:bg-gold/10 sm:flex-none"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => setDeleteTarget(cat)}
                className="flex-1 rounded-lg border border-crimson/20 py-1.5 px-4 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10 sm:flex-none"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-cream-dark">{t("noCategories")}</p>
        )}
      </div>

      <AdminModal open={modalOpen} onClose={closeModal} title={editId ? t("editCategory") : t("newCategory")}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-cream-dark">{t("name")}</label>
            <input
              placeholder={t("name")} value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) }); setErrors((er) => { const r = { ...er }; delete r.name; return r; }); }}
              className={errors.name ? inputErrorClass : inputClass}
            />
            <FieldError msg={errors.name} />
          </div>
          <div>
            <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-cream-dark">{t("slug")}</label>
            <input
              placeholder={t("slug")} value={form.slug}
              onChange={(e) => { setForm({ ...form, slug: e.target.value }); setErrors((er) => { const r = { ...er }; delete r.slug; return r; }); }}
              className={errors.slug ? inputErrorClass : inputClass}
            />
            <FieldError msg={errors.slug} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-cream-dark">{t("iconEmoji")}</label>
              <input
                placeholder="🍸"  value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-cream-dark">{t("sortOrder")}</label>
              <input
                type="number" placeholder="0" value={form.sortOrder}
                onChange={(e) => { setForm({ ...form, sortOrder: Number(e.target.value) }); setErrors((er) => { const r = { ...er }; delete r.sortOrder; return r; }); }}
                className={errors.sortOrder ? inputErrorClass : inputClass}
              />
              <FieldError msg={errors.sortOrder} />
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-gold py-2.5 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light disabled:opacity-50">
              {editId ? t("save") : t("add")}
            </button>
            <button type="button" onClick={closeModal}
              className="flex-1 rounded-lg border border-cream-dark/20 py-2.5 font-body text-sm text-cream-dark">
              {t("cancel")}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmDeleteTitle")}
        message={deleteTarget ? `"${deleteTarget.name}" — ${t("confirmDeleteCategoryMsg")}` : ""}
        confirmLabel={t("confirmYes")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
