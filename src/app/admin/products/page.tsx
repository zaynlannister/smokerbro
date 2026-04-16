"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useI18n } from "@/lib/admin-i18n";
import AdminModal from "@/components/AdminModal";
import AdminSelect from "@/components/AdminSelect";
import ConfirmModal from "@/components/ConfirmModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Category { id: number; name: string; slug: string; icon: string }
interface ProductTag { icon: string; label: string }
interface Product {
  id: number; name: string; description: string; price: number;
  images: string[]; badge: string | null; tags: ProductTag[] | null;
  categoryId: number; sortOrder: number; category: Category;
}

const emptyForm = {
  name: "", description: "", price: "", badge: "",
  categoryId: "", images: [] as string[],
  tags: [] as ProductTag[],
};

const MAX_TAGS = 5;
const MAX_IMAGES = 5;

const BADGE_KEYS = ["beliebt", "neu", "scharf"] as const;
const BADGE_LABEL_MAP: Record<string, "badge_beliebt" | "badge_neu" | "badge_scharf"> = {
  beliebt: "badge_beliebt", neu: "badge_neu", scharf: "badge_scharf",
};

const PRESET_TAGS: { groupKey: "tagStrength" | "tagAlcohol" | "tagFlavor"; options: ProductTag[] }[] = [
  {
    groupKey: "tagStrength",
    options: [
      { icon: "💨", label: "Leicht" },
      { icon: "💨", label: "Mittel" },
      { icon: "🔥", label: "Stark" },
    ],
  },
  {
    groupKey: "tagAlcohol",
    options: [
      { icon: "🍸", label: "Mit Alkohol" },
      { icon: "🚫", label: "Alkoholfrei" },
    ],
  },
  {
    groupKey: "tagFlavor",
    options: [
      { icon: "🍋", label: "Zitrus" },
      { icon: "🍓", label: "Fruchtig" },
      { icon: "🌿", label: "Minze" },
      { icon: "🍫", label: "Schokolade" },
      { icon: "🫐", label: "Beeren" },
      { icon: "🥥", label: "Kokos" },
      { icon: "🍑", label: "Pfirsich" },
      { icon: "🍉", label: "Wassermelone" },
      { icon: "🍇", label: "Traube" },
      { icon: "🍏", label: "Apfel" },
      { icon: "🌶️", label: "Würzig" },
      { icon: "☕", label: "Kaffee" },
      { icon: "🍵", label: "Tee" },
      { icon: "🧊", label: "Eiskalt" },
    ],
  },
];

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 font-body text-[11px] text-crimson-light">{msg}</p>;
}

/* ---------- Sortable product card ---------- */
function SortableProductCard({
  product,
  onEdit,
  onDelete,
  badgeLabelMap,
  formatPrice,
  t,
  draggable = true,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  badgeLabelMap: typeof BADGE_LABEL_MAP;
  formatPrice: (n: number) => string;
  t: (key: string) => string;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.id, disabled: !draggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gold/10 bg-dark-light p-4">
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            className="mt-1 flex shrink-0 cursor-grab touch-none items-center text-cream-dark/40 hover:text-gold active:cursor-grabbing"
            tabIndex={-1}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </button>
        )}

        {product.images.length > 0 ? (
          <img src={`/api/uploads/${product.images[0]}`} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-dark text-cream-dark/30">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-heading text-[15px] font-semibold text-cream">{product.name}</p>
            {product.badge && badgeLabelMap[product.badge] && (
              <span className="rounded-full bg-gold/10 px-2 py-px font-body text-[9px] font-semibold uppercase tracking-wider text-gold">{t(badgeLabelMap[product.badge])}</span>
            )}
          </div>
          <p className="mt-0.5 font-body text-xs text-cream-dark">
            {product.category.icon} {product.category.name} &middot; {formatPrice(product.price)}
          </p>
          {product.tags && (product.tags as ProductTag[]).length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {(product.tags as ProductTag[]).map((tag, i) => (
                <span key={i} className="rounded-full bg-dark px-2 py-0.5 font-body text-[10px] text-cream-dim">
                  {tag.icon} {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2 sm:justify-end">
        <button onClick={() => onEdit(product)}
          className="flex-1 rounded-lg border border-gold/20 py-1.5 px-4 font-body text-xs text-gold transition-colors hover:bg-gold/10 sm:flex-none">
          {t("edit")}
        </button>
        <button onClick={() => onDelete(product)}
          className="flex-1 rounded-lg border border-crimson/20 py-1.5 px-4 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10 sm:flex-none">
          {t("delete")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function ProductsPage() {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCat, setFilterCat] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [customTagIcon, setCustomTagIcon] = useState("");
  const [customTagLabel, setCustomTagLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  async function load() {
    const url = filterCat ? `/api/products?categoryId=${filterCat}` : "/api/products";
    const [prods, cats] = await Promise.all([
      fetch(url).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setProducts(prods); setCategories(cats);
  }

  useEffect(() => { load(); }, [filterCat]);

  /* ---- Filtered list (search within current scope) ---- */
  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q)
    );
  });

  /* ---- Drag & drop ---- */
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);

    await fetch("/api/products/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
  }

  function openNew() { setEditId(null); setForm(emptyForm); setErrors({}); setShowTagPicker(false); setModalOpen(true); }
  function openEdit(p: Product) {
    setEditId(p.id);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      badge: p.badge || "", categoryId: String(p.categoryId),
      images: p.images || [],
      tags: (p.tags as ProductTag[]) || [],
    });
    setErrors({});
    setShowTagPicker(false);
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditId(null); setForm(emptyForm); setErrors({}); setShowTagPicker(false); if (fileRef.current) fileRef.current.value = ""; }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = t("valNameMin");
    else if (form.name.trim().length > 60) e.name = t("valNameMax");
    if (form.description.trim().length > 300) e.description = t("valDescMax");
    const price = parseFloat(form.price);
    if (!form.price || price <= 0) e.price = t("valPriceMin");
    else if (price > 999) e.price = t("valPriceMax");
    if (!form.categoryId) e.categoryId = t("selectCategory");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUpload() {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > MAX_IMAGES) {
      setErrors((e) => ({ ...e, images: t("maxImages") }));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setErrors((e) => { const r = { ...e }; delete r.images; return r; });
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.filename) uploaded.push(data.filename);
    }
    setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    setUploading(false); if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    setErrors((e) => { const r = { ...e }; delete r.images; return r; });
  }

  function addTag(tag: ProductTag) {
    setForm((f) => {
      const exists = f.tags.some((t) => t.icon === tag.icon && t.label === tag.label);
      if (exists) return f;
      if (f.tags.length >= MAX_TAGS) return f;
      return { ...f, tags: [...f.tags, tag] };
    });
  }

  function removeTag(idx: number) {
    setForm((f) => ({ ...f, tags: f.tags.filter((_, i) => i !== idx) }));
  }

  function addCustomTag() {
    if (!customTagLabel.trim()) return;
    if (form.tags.length >= MAX_TAGS) return;
    addTag({ icon: customTagIcon || "🏷️", label: customTagLabel.trim() });
    setCustomTagIcon("");
    setCustomTagLabel("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const body: Record<string, unknown> = {
      name: form.name.trim(), description: form.description.trim(),
      price: parseFloat(form.price), badge: form.badge || null,
      categoryId: Number(form.categoryId),
      images: form.images,
      tags: form.tags.length > 0 ? form.tags : null,
    };
    if (editId) {
      await fetch(`/api/products/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      // Auto-assign sortOrder for new products: append to end
      const maxSort = products.length > 0 ? Math.max(...products.map((p) => p.sortOrder)) : -1;
      body.sortOrder = maxSort + 1;
      await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setLoading(false); closeModal(); load();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    load();
  }

  function formatPrice(n: number) {
    return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
  }

  const inputClass = "w-full rounded-lg border border-gold/10 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none";
  const inputErrorClass = "w-full rounded-lg border border-crimson/30 bg-dark px-3 py-2.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-crimson/50 focus:outline-none";

  const canDrag = !!filterCat && search.trim().length === 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold text-cream sm:text-3xl">
          {t("products")}
        </h1>
        <button onClick={openNew}
          className="shrink-0 rounded-lg bg-gold px-3 py-2 font-body text-sm font-semibold text-dark transition-colors hover:bg-gold-light">
          + {t("add")}
        </button>
      </div>

      {/* Filter + Search */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="sm:w-56">
          <AdminSelect
            value={filterCat}
            onChange={(v) => { setFilterCat(v); setSearch(""); }}
            placeholder={t("allCategories")}
            options={categories.map((c) => ({ value: String(c.id), label: `${c.icon} ${c.name}` }))}
          />
        </div>
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cream-dark/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchProducts")}
            className="w-full rounded-lg border border-gold/10 bg-dark py-2.5 pl-9 pr-3 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Product list with drag & drop */}
      <div className="mt-5 space-y-2">
        {canDrag ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {products.map((p) => (
                <SortableProductCard
                  key={p.id}
                  product={p}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  badgeLabelMap={BADGE_LABEL_MAP}
                  formatPrice={formatPrice}
                  t={t as (key: string) => string}
                  draggable
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          filtered.map((p) => (
            <SortableProductCard
              key={p.id}
              product={p}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              badgeLabelMap={BADGE_LABEL_MAP}
              formatPrice={formatPrice}
              t={t as (key: string) => string}
              draggable={false}
            />
          ))
        )}
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-cream-dark">{t("noProducts")}</p>
        )}
      </div>

      {/* Create / Edit modal */}
      <AdminModal open={modalOpen} onClose={closeModal} title={editId ? t("editProduct") : t("newProduct")}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          {/* Name */}
          <div>
            <input placeholder={t("name")} value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((er) => { const r = { ...er }; delete r.name; return r; }); }}
              className={errors.name ? inputErrorClass : inputClass} />
            <FieldError msg={errors.name} />
          </div>

          {/* Category */}
          <div>
            <AdminSelect
              value={form.categoryId}
              onChange={(v) => { setForm({ ...form, categoryId: v }); setErrors((er) => { const r = { ...er }; delete r.categoryId; return r; }); }}
              placeholder={t("selectCategory")}
              options={categories.map((c) => ({ value: String(c.id), label: `${c.icon} ${c.name}` }))}
            />
            <FieldError msg={errors.categoryId} />
          </div>

          {/* Description + counter */}
          <div>
            <textarea placeholder={t("description")} value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors((er) => { const r = { ...er }; delete r.description; return r; }); }}
              rows={3}
              className={errors.description ? inputErrorClass : inputClass} />
            <div className="mt-1 flex items-center justify-between">
              <FieldError msg={errors.description} />
              <span className={`font-body text-[10px] ${form.description.length > 300 ? "text-crimson-light" : "text-cream-dark/50"}`}>
                {form.description.length}/300
              </span>
            </div>
          </div>

          {/* Price + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input type="number" step="0.01" placeholder={t("priceEur")} value={form.price}
                onChange={(e) => { setForm({ ...form, price: e.target.value }); setErrors((er) => { const r = { ...er }; delete r.price; return r; }); }}
                className={errors.price ? inputErrorClass : inputClass} />
              <FieldError msg={errors.price} />
            </div>
            <AdminSelect
              value={form.badge}
              onChange={(v) => setForm({ ...form, badge: v })}
              placeholder={t("noBadge")}
              options={BADGE_KEYS.map((b) => ({ value: b, label: t(BADGE_LABEL_MAP[b]) }))}
            />
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-body text-xs uppercase tracking-wider text-cream-dark">
                {t("tags")} <span className="normal-case text-cream-dark/50">({form.tags.length}/{MAX_TAGS})</span>
              </p>
              {form.tags.length < MAX_TAGS && (
                <button type="button" onClick={() => setShowTagPicker(!showTagPicker)}
                  className="font-body text-xs text-gold hover:text-gold-light transition-colors">
                  {showTagPicker ? t("cancel") : `+ ${t("addTag")}`}
                </button>
              )}
              {form.tags.length >= MAX_TAGS && (
                <span className="font-body text-[10px] text-crimson-light">{t("maxTags")}</span>
              )}
            </div>

            {form.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/5 px-2.5 py-1 font-body text-xs text-cream">
                    <span>{tag.icon}</span>
                    <span>{tag.label}</span>
                    <button type="button" onClick={() => removeTag(idx)}
                      className="ml-0.5 text-cream-dark hover:text-crimson-light">&times;</button>
                  </span>
                ))}
              </div>
            )}

            {showTagPicker && form.tags.length < MAX_TAGS && (
              <div className="rounded-lg border border-gold/10 bg-dark p-3 space-y-3">
                {PRESET_TAGS.map((group) => (
                  <div key={group.groupKey}>
                    <p className="mb-1.5 font-body text-[10px] uppercase tracking-wider text-cream-dark">{t(group.groupKey)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((tag) => {
                        const active = form.tags.some((t) => t.icon === tag.icon && t.label === tag.label);
                        const disabled = !active && form.tags.length >= MAX_TAGS;
                        return (
                          <button key={tag.label} type="button" disabled={disabled}
                            onClick={() => active ? removeTag(form.tags.findIndex((t) => t.icon === tag.icon && t.label === tag.label)) : addTag(tag)}
                            className={`rounded-full border px-2.5 py-1 font-body text-[11px] transition-all ${
                              active
                                ? "border-gold/40 bg-gold/15 text-gold"
                                : disabled
                                ? "border-gold/5 text-cream-dark/30 cursor-not-allowed"
                                : "border-gold/10 text-cream-dim hover:border-gold/25 hover:text-cream"
                            }`}>
                            {tag.icon} {tag.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div>
                  <p className="mb-1.5 font-body text-[10px] uppercase tracking-wider text-cream-dark">{t("tagCustom")}</p>
                  <div className="flex gap-2">
                    <input placeholder={t("tagIcon")} value={customTagIcon}
                      onChange={(e) => setCustomTagIcon(e.target.value)}
                      className="w-14 rounded-lg border border-gold/10 bg-dark-light px-2 py-1.5 text-center font-body text-sm text-cream focus:border-gold/30 focus:outline-none" />
                    <input placeholder={t("tagLabel")} value={customTagLabel}
                      onChange={(e) => setCustomTagLabel(e.target.value)}
                      className="flex-1 rounded-lg border border-gold/10 bg-dark-light px-2.5 py-1.5 font-body text-sm text-cream placeholder:text-cream-dark/50 focus:border-gold/30 focus:outline-none" />
                    <button type="button" onClick={addCustomTag} disabled={form.tags.length >= MAX_TAGS}
                      className="rounded-lg bg-gold/10 px-3 py-1.5 font-body text-xs text-gold hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div>
            <p className="mb-2 font-body text-xs uppercase tracking-wider text-cream-dark">
              {t("images")} <span className="normal-case text-cream-dark/50">({form.images.length}/{MAX_IMAGES})</span>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {form.images.map((img, idx) => (
                <div key={img} className="group relative">
                  <img src={`/api/uploads/${img}`} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                    &times;
                  </button>
                </div>
              ))}
              {form.images.length < MAX_IMAGES && (
                <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gold/20 text-cream-dark transition-colors hover:border-gold/40 hover:text-gold">
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
                  {uploading ? (
                    <span className="font-body text-[9px]">{t("uploading")}</span>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                </label>
              )}
            </div>
            <FieldError msg={errors.images} />
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
        message={deleteTarget ? `"${deleteTarget.name}" — ${t("confirmDeleteProductMsg")}` : ""}
        confirmLabel={t("confirmYes")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
