"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/admin-i18n";
import AdminModal from "@/components/AdminModal";
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

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

const empty = { name: "", slug: "", icon: "" };

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 font-body text-[11px] text-crimson-light">{msg}</p>;
}

/* ---------- Sortable category card ---------- */
function SortableCategoryCard({
  cat,
  onEdit,
  onDelete,
  t,
}: {
  cat: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-gold/10 bg-dark-light p-4">
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex shrink-0 cursor-grab touch-none items-center text-cream-dark/40 hover:text-gold active:cursor-grabbing"
          tabIndex={-1}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>
        <span className="text-xl">{cat.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-base font-semibold text-cream truncate">{cat.name}</p>
          <p className="font-body text-xs text-cream-dark">/{cat.slug}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 sm:justify-end">
        <button
          onClick={() => onEdit(cat)}
          className="flex-1 rounded-lg border border-gold/20 py-1.5 px-4 font-body text-xs text-gold transition-colors hover:bg-gold/10 sm:flex-none"
        >
          {t("edit")}
        </button>
        <button
          onClick={() => onDelete(cat)}
          className="flex-1 rounded-lg border border-crimson/20 py-1.5 px-4 font-body text-xs text-crimson-light transition-colors hover:bg-crimson/10 sm:flex-none"
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Main page ---------- */
export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

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

  /* ---- Drag & drop ---- */
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    await fetch("/api/categories/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
    });
  }

  function openNew() { setEditId(null); setForm(empty); setErrors({}); setModalOpen(true); }
  function openEdit(cat: Category) {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon });
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
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const slug = form.slug || autoSlug(form.name);
    const body: Record<string, unknown> = { name: form.name.trim(), slug, icon: form.icon };
    if (editId) {
      await fetch(`/api/categories/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else {
      const maxSort = categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder)) : -1;
      body.sortOrder = maxSort + 1;
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {categories.map((cat) => (
              <SortableCategoryCard
                key={cat.id}
                cat={cat}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                t={t as (key: string) => string}
              />
            ))}
          </SortableContext>
        </DndContext>
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
          <div>
            <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-cream-dark">{t("iconEmoji")}</label>
            <input
              placeholder="🍸" value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className={inputClass}
            />
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
