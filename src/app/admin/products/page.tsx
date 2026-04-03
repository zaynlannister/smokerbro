"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useI18n } from "@/lib/admin-i18n";
import AdminModal from "@/components/AdminModal";

interface Category { id: number; name: string; slug: string; icon: string }
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  badge: string | null;
  categoryId: number;
  sortOrder: number;
  category: Category;
}

const emptyForm = {
  name: "", description: "", price: "", badge: "",
  categoryId: "", sortOrder: "0", images: [] as string[],
};

const BADGE_KEYS = ["beliebt", "neu", "scharf"] as const;
const BADGE_LABEL_MAP: Record<string, "badge_beliebt" | "badge_neu" | "badge_scharf"> = {
  beliebt: "badge_beliebt",
  neu: "badge_neu",
  scharf: "badge_scharf",
};

export default function ProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const url = filterCat ? `/api/products?categoryId=${filterCat}` : "/api/products";
    const [prods, cats] = await Promise.all([
      fetch(url).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setProducts(prods);
    setCategories(cats);
  }

  useEffect(() => { load(); }, [filterCat]);

  function openNew() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name, description: p.description,
      price: String(p.price), badge: p.badge || "",
      categoryId: String(p.categoryId), sortOrder: String(p.sortOrder),
      images: p.images || [],
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUpload() {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.filename) uploaded.push(data.filename);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), badge: form.badge || null,
      categoryId: Number(form.categoryId), sortOrder: Number(form.sortOrder),
      images: form.images,
    };

    if (editId) {
      await fetch(`/api/products/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/products", {
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
    if (!confirm(t("confirmDeleteProduct"))) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  function formatPrice(n: number) {
    return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-cream">
          {t("products")}
        </h1>
        <button
          onClick={openNew}
          className="rounded-lg bg-gold px-4 py-2 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light"
        >
          + {t("add")}
        </button>
      </div>

      {/* Filter */}
      <div className="mt-4">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-gold/10 bg-dark px-3 py-2 font-body text-sm text-cream focus:border-gold/30 focus:outline-none"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      <div className="mt-6 space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-gold/10 bg-dark-light px-5 py-3">
            <div className="flex items-center gap-3">
              {p.images.length > 0 ? (
                <img src={`/api/uploads/${p.images[0]}`} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-dark text-cream-dark/30">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                  </svg>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-heading text-base font-semibold text-cream">{p.name}</p>
                  {p.badge && BADGE_LABEL_MAP[p.badge] && (
                    <span className="rounded-full bg-gold/10 px-2 py-px font-body text-[9px] font-semibold uppercase tracking-wider text-gold">{t(BADGE_LABEL_MAP[p.badge])}</span>
                  )}
                  {p.images.length > 1 && (
                    <span className="font-body text-[10px] text-cream-dark">{p.images.length} img</span>
                  )}
                </div>
                <p className="font-body text-xs text-cream-dark">
                  {p.category.icon} {p.category.name} &middot; {formatPrice(p.price)} &middot; #{p.sortOrder}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(p)}
                className="rounded-lg border border-gold/20 px-3 py-1 font-body text-xs text-gold transition-colors hover:bg-gold/10"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="rounded-lg border border-crimson/20 px-3 py-1 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-cream-dark">{t("noProducts")}</p>
        )}
      </div>

      {/* Create / Edit modal */}
      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editId ? t("editProduct") : t("newProduct")}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder={t("name")}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream focus:border-gold/30 focus:outline-none"
          >
            <option value="">{t("selectCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <textarea
            placeholder={t("description")}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
          <div className="grid gap-3 grid-cols-3">
            <input
              type="number"
              step="0.01"
              placeholder={t("priceEur")}
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
            />
            <select
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream focus:border-gold/30 focus:outline-none"
            >
              <option value="">{t("noBadge")}</option>
              {BADGE_KEYS.map((b) => (
                <option key={b} value={b}>{t(BADGE_LABEL_MAP[b])}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder={t("sortOrder")}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              className="rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
            />
          </div>

          {/* Images */}
          <div>
            <p className="mb-2 font-body text-xs uppercase tracking-wider text-cream-dark">
              {t("images")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {form.images.map((img, idx) => (
                <div key={img} className="group relative">
                  <img src={`/api/uploads/${img}`} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    &times;
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gold/20 text-cream-dark transition-colors hover:border-gold/40 hover:text-gold">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
                {uploading ? (
                  <span className="font-body text-[9px]">{t("uploading")}</span>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                )}
              </label>
            </div>
          </div>

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
