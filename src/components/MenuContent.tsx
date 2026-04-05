"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type PanInfo,
} from "framer-motion";
import ProductModal from "./ProductModal";
import GoldDust from "./GoldDust";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  badge: string | null;

  tags?: unknown;
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

/* ── Parallax Background ─────────────────────────────────────── */

function ParallaxBackground() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, -150]);
  const y2 = useTransform(scrollY, [0, 800], [0, -70]);
  const y3 = useTransform(scrollY, [0, 800], [0, -200]);
  const opacity1 = useTransform(scrollY, [0, 400], [1, 0.5]);
  const opacity2 = useTransform(scrollY, [0, 600], [1, 0.7]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute rounded-full"
        style={{
          y: y1, opacity: opacity1,
          width: "60vw", height: "60vw", top: "0%", left: "-15%",
          background: "radial-gradient(circle, rgba(139,26,26,0.18) 0%, rgba(139,26,26,0.06) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          y: y2, opacity: opacity2,
          width: "50vw", height: "50vw", top: "25%", right: "-10%",
          background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)",
          filter: "blur(35px)",
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          y: y3,
          width: "70vw", height: "70vw", top: "50%", left: "10%",
          background: "radial-gradient(circle, rgba(139,26,26,0.14) 0%, rgba(92,16,16,0.05) 40%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export default function MenuContent({
  categories,
}: {
  categories: Category[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isFirstRender = useRef(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const scrollActiveTabIntoView = useCallback((index: number) => {
    const container = tabsRef.current;
    if (!container) return;
    // Scroll so that the next tab after active is also visible (if exists)
    const targetIndex = Math.min(index + 1, categories.length - 1);
    const targetTab = tabRefs.current[targetIndex];
    if (!targetTab) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    // If the target tab is out of view to the right, scroll right
    if (tabRect.right > containerRect.right) {
      container.scrollTo({
        left: container.scrollLeft + (tabRect.right - containerRect.right) + 8,
        behavior: "smooth",
      });
    }
    // If the active tab is out of view to the left, scroll left
    const activeTab = tabRefs.current[index];
    if (activeTab) {
      const activeRect = activeTab.getBoundingClientRect();
      if (activeRect.left < containerRect.left) {
        container.scrollTo({
          left: container.scrollLeft - (containerRect.left - activeRect.left) - 8,
          behavior: "smooth",
        });
      }
    }
  }, [categories.length]);

  useEffect(() => {
    scrollActiveTabIntoView(activeIndex);
  }, [activeIndex, scrollActiveTabIntoView]);

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
    if (newIndex < 0 || newIndex >= categories.length) return;
    isFirstRender.current = false;
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  }

  /* Swipe between categories */
  function handleCategorySwipe(_: unknown, info: PanInfo) {
    const threshold = 50;
    if (info.offset.x < -threshold && activeIndex < categories.length - 1) {
      switchTab(activeIndex + 1);
    } else if (info.offset.x > threshold && activeIndex > 0) {
      switchTab(activeIndex - 1);
    }
  }

  const label =
    activeCategory.products.length === 1
      ? "1 Artikel"
      : `${activeCategory.products.length} Artikel`;

  return (
    <>
      {/* Parallax background */}
      <ParallaxBackground />

      {/* Gold dust particles */}
      <GoldDust />

      {/* Sticky category tabs */}
      <nav
        className="sticky top-[52px] z-20 border-b border-gold/10 bg-dark/80 backdrop-blur-xl"
        style={{ overscrollBehavior: "contain" }}
      >
        <div
          ref={tabsRef}
          className="flex gap-0.5 overflow-x-auto px-3 scrollbar-none"
          style={{ touchAction: "pan-x", overscrollBehavior: "contain" }}
        >
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              ref={(el) => { tabRefs.current[i] = el; }}
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

      {/* Menu items — swipeable */}
      <motion.div
        className="relative z-10 px-4 pt-5 sm:px-5"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleCategorySwipe}
        style={{ touchAction: "pan-y" }}
      >
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
                  initial={isFirstRender.current ? { opacity: 0, y: 14 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={isFirstRender.current ? {
                    delay: i * 0.04,
                    duration: 0.35,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  } : { duration: 0 }}
                  onClick={() => setSelectedProduct(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-transparent bg-[#111] p-3.5 transition-all duration-300 active:border-gold/20 active:shadow-glow-gold-sm active:scale-[0.98]"
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
                            className={`shrink-0 rounded-full border px-2 py-px font-body text-[9px] font-semibold uppercase tracking-wider ${badgeStyles[item.badge]} ${item.badge === "neu" ? "badge-pulse" : ""}`}
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
                  <div className="mt-2.5 h-px w-0 bg-gold-gradient-h transition-all duration-500 group-active:w-full" />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
