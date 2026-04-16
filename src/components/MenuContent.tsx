"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Refs for tabs
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Refs for category sections
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isScrollingToSection = useRef(false);

  /* ── Auto-scroll tabs to keep active visible with +1 lookahead ── */

  const scrollTabIntoView = useCallback((index: number) => {
    const container = tabsRef.current;
    if (!container) return;
    const targetIndex = Math.min(index + 1, categories.length - 1);
    const targetTab = tabRefs.current[targetIndex];
    if (!targetTab) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = targetTab.getBoundingClientRect();
    if (tabRect.right > containerRect.right) {
      container.scrollTo({
        left: container.scrollLeft + (tabRect.right - containerRect.right) + 8,
        behavior: "smooth",
      });
    }
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
    scrollTabIntoView(activeIndex);
  }, [activeIndex, scrollTabIntoView]);

  /* ── IntersectionObserver to track which section is active ── */

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // We track which sections are visible and pick the topmost one
    const visibleSections = new Map<number, IntersectionObserverEntry>();

    function updateActive() {
      if (isScrollingToSection.current) return;
      let topIndex = -1;
      let topY = Infinity;
      visibleSections.forEach((entry, index) => {
        if (entry.isIntersecting && entry.boundingClientRect.top < topY) {
          topY = entry.boundingClientRect.top;
          topIndex = index;
        }
      });
      if (topIndex >= 0) {
        setActiveIndex(topIndex);
      }
    }

    sectionRefs.current.forEach((section, index) => {
      if (!section) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.set(index, entry);
            } else {
              visibleSections.delete(index);
            }
          });
          updateActive();
        },
        {
          // Top of viewport (below sticky header+tabs ~105px)
          rootMargin: "-105px 0px -60% 0px",
          threshold: 0,
        }
      );
      observer.observe(section);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categories]);

  /* ── Click tab → scroll to section ── */

  function handleTabClick(index: number) {
    const section = sectionRefs.current[index];
    if (!section) return;
    isScrollingToSection.current = true;
    setActiveIndex(index);

    const offset = 110; // header + tabs height
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });

    // Re-enable observer after scroll finishes
    setTimeout(() => {
      isScrollingToSection.current = false;
    }, 600);
  }

  if (categories.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="font-body text-sm text-cream-dark">
          Das Men&uuml; wird gerade aktualisiert.
        </p>
      </div>
    );
  }

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
              onClick={() => handleTabClick(i)}
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

      {/* All categories — continuous scroll */}
      <div className="relative z-10 px-4 pt-2 sm:px-5">
        {categories.map((cat, catIndex) => {
          const count = cat.products.length;
          const label = count === 1 ? "1 Artikel" : `${count} Artikel`;

          return (
            <div
              key={cat.id}
              ref={(el) => { sectionRefs.current[catIndex] = el; }}
              className="pt-5"
            >
              {/* Category divider (not on first) */}
              {catIndex > 0 && (
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                </div>
              )}

              <h2 className="font-heading text-[22px] font-semibold tracking-wide text-cream">
                {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                {cat.name}
              </h2>
              <p className="mt-0.5 font-body text-[11px] tracking-wider text-cream-dark">
                {label}
              </p>

              <ul className="mt-4 flex flex-col gap-2.5">
                {cat.products.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setSelectedProduct(item)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-transparent bg-[#111] p-3.5 transition-all duration-300 active:border-gold/20 active:shadow-glow-gold-sm active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      {item.images.length > 0 && (
                        <img
                          src={`/api/uploads/${item.images[0]}`}
                          alt=""
                          className="h-20 w-20 shrink-0 rounded-lg object-cover"
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
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Bottom padding */}
        <div className="h-20" />
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
