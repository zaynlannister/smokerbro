"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ProductTag {
  icon: string;
  label: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  badge: string | null;
  tags?: unknown;
}

const badgeStyles: Record<string, string> = {
  beliebt: "bg-crimson/20 text-crimson-light border-crimson/30",
  neu: "bg-gold/10 text-gold border-gold/30",
  scharf: "bg-orange-900/20 text-orange-400 border-orange-500/30",
};

function formatPrice(price: number) {
  return price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const hasImages = product.images.length > 0;
  const hasMultiple = product.images.length > 1;
  const tags = Array.isArray(product.tags) ? (product.tags as ProductTag[]) : [];

  useEffect(() => {
    setImgIndex(0);
  }, [product.id]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* Touch swipe between images */
  const touchStart = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null || !hasMultiple) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) {
      setImgIndex((i) => (i + 1) % product.images.length);
    } else {
      setImgIndex((i) => (i - 1 + product.images.length) % product.images.length);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gold/15 bg-dark-light shadow-2xl shadow-black/50"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute z-20 flex h-7 w-7 items-center justify-center rounded-full bg-dark/70 text-cream-dark backdrop-blur-md transition-all hover:bg-dark/90 hover:text-cream active:scale-90 ${hasImages ? "right-2.5 top-2.5" : "right-3 top-3"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image carousel with swipe + ambient glow */}
          {hasImages && (
            <div
              className="relative aspect-square w-full overflow-hidden bg-dark"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {/* Ambient glow behind image */}
              <div
                className="absolute inset-0 z-0 scale-110 blur-[40px] opacity-40"
                style={{
                  backgroundImage: `url(/api/uploads/${product.images[imgIndex]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <motion.img
                key={`${product.id}-${imgIndex}`}
                src={`/api/uploads/${product.images[imgIndex]}`}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 h-full w-full object-cover pointer-events-none"
              />

              {/* Navigation arrows */}
              {hasMultiple && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-dark/60 text-cream backdrop-blur-md transition-all hover:bg-dark/90 active:scale-90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i + 1) % product.images.length)}
                    className="absolute right-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-dark/60 text-cream backdrop-blur-md transition-all hover:bg-dark/90 active:scale-90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultiple && (
                <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === imgIndex ? "w-5 bg-gold" : "w-1.5 bg-cream/40 hover:bg-cream/60"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-dark-light to-transparent pointer-events-none" />
            </div>
          )}

          {/* Content */}
          <div className={hasImages ? "px-5 pb-5 pt-4" : "p-5 pt-12"}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-[22px] font-semibold leading-tight text-cream">
                    {product.name}
                  </h2>
                  {product.badge && badgeStyles[product.badge] && (
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider ${badgeStyles[product.badge]}`}>
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>
              <span className="shrink-0 pt-0.5 font-heading text-xl font-bold text-gold">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/15 bg-gold/5 px-3 py-1 font-body text-[11px] text-cream-dim"
                  >
                    <span className="text-sm">{tag.icon}</span>
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Gold divider */}
            <div
              className="mt-3.5 h-px w-full"
              style={{
                background: "linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.05))",
              }}
            />

            <p className="mt-3.5 font-body text-[13px] leading-relaxed text-cream-dim">
              {product.description}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
