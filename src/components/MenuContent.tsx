"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductModal from "./ProductModal";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  badge: string | null;
  sortOrder: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  products: Product[];
}

const badgeStyles: Record<string, string> = {
  beliebt: "bg-crimson/20 text-crimson-light border-crimson/30",
  neu: "bg-gold/10 text-gold border-gold/30",
  scharf: "bg-orange-900/20 text-orange-400 border-orange-500/30",
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

function formatPrice(price: number) {
  return price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

export default function MenuContent({
  categories,
}: {
  categories: Category[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (categories.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-body text-sm text-cream-dark">
          Das Men&uuml; wird gerade aktualisiert.
        </p>
      </div>
    );
  }

  const activeCategory = categories[activeIndex];

  function switchTab(newIndex: number) {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  }

  const label =
    activeCategory.products.length === 1
      ? "1 Artikel"
      : `${activeCategory.products.length} Artikel`;

  return (
    <>
      {/* Sticky category tabs */}
      <nav className="sticky top-[52px] z-20 border-b border-gold/10 bg-dark/80 backdrop-blur-xl">
        <div className="flex gap-0.5 overflow-x-auto px-3 scrollbar-none">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => switchTab(i)}
              className="relative shrink-0 px-3.5 py-3 font-body text-[13px] font-medium transition-colors"
            >
              <span
                className={
                  i === activeIndex
                    ? "text-gold"
                    : "text-cream-dark hover:text-cream-dim"
                }
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </span>
              {i === activeIndex && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute inset-x-1.5 -bottom-px h-[2px] bg-gold-gradient-h"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Menu items */}
      <div className="px-4 pt-5 sm:px-5">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeCategory.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="font-heading text-[22px] font-semibold tracking-wide text-cream">
              {activeCategory.name}
            </h2>
            <p className="mt-0.5 font-body text-[11px] tracking-wider text-cream-dark">
              {label}
            </p>

            <ul className="mt-4 flex flex-col gap-2.5">
              {activeCategory.products.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  onClick={() => setSelectedProduct(item)}
                  className="group cursor-pointer rounded-xl border border-transparent bg-[#111] p-3.5 transition-all duration-300 hover:border-gold/20 hover:shadow-glow-gold-sm active:scale-[0.98]"
                >
                  <div className="flex items-start gap-3">
                    {item.images.length > 0 && (
                      <img
                        src={`/api/uploads/${item.images[0]}`}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-[17px] font-semibold leading-tight text-cream">
                          {item.name}
                        </h3>
                        {item.badge && badgeStyles[item.badge] && (
                          <span
                            className={`shrink-0 rounded-full border px-2 py-px font-body text-[9px] font-semibold uppercase tracking-wider ${badgeStyles[item.badge]}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 font-body text-[12px] leading-relaxed text-cream-dark">
                        {item.description}
                      </p>
                    </div>
                    <span className="shrink-0 pt-0.5 font-heading text-[15px] font-semibold text-gold">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div className="mt-2.5 h-px w-0 bg-gold-gradient-h transition-all duration-500 group-hover:w-full" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
