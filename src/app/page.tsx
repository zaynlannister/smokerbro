"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import PageTransition from "@/components/PageTransition";

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay,
    },
  }),
};

function particleRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function EmberParticle({ index }: { index: number }) {
  const r = (offset: number) => particleRandom(index + offset);
  const size = 2 + r(0) * 3;
  const left = r(1) * 100;
  const delay = r(2) * 8;
  const duration = 6 + r(3) * 8;
  const drift = -30 + r(4) * 60;
  const glow = 0.6 + r(5) * 0.4;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: "-5%",
        background: `radial-gradient(circle, rgba(201, 168, 76, ${glow}), rgba(139, 26, 26, 0.3))`,
        boxShadow: `0 0 ${size * 2}px rgba(201, 168, 76, 0.4)`,
      }}
      animate={{
        y: [0, "-120vh"],
        x: [0, drift],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.3],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
      key={index}
    />
  );
}

function SmokeLayer({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      animate={{ opacity: [0.03, 0.07, 0.03], scale: [1, 1.05, 1] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />

      {loaded && (
        <PageTransition>
          <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 26, 26, 0.15) 0%, rgba(92, 16, 16, 0.06) 40%, transparent 70%), #0a0a0a",
              }}
            />
            <SmokeLayer className="opacity-5" delay={0} />
            <SmokeLayer className="opacity-[0.03]" delay={3} />
            <div className="absolute inset-0 pointer-events-none">
              <div className="smoke-drift smoke-drift-1" />
              <div className="smoke-drift smoke-drift-2" />
              <div className="smoke-drift smoke-drift-3" />
            </div>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 18 }).map((_, i) => (
                <EmberParticle key={i} index={i} />
              ))}
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(10, 10, 10, 0.7) 100%)",
              }}
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative z-10 flex flex-col items-center px-6 text-center"
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="text-xs font-body font-medium tracking-[0.35em] text-gold uppercase"
              >
                Seit 2024
              </motion.span>

              <motion.h1
                variants={fadeUp}
                custom={0.2}
                className="mt-6 font-heading leading-none"
                style={{ fontSize: "clamp(3rem, 12vw, 5rem)" }}
              >
                <motion.span
                  className="inline-block text-gold-gradient"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  SMOKER BRO
                </motion.span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.4}
                className="mt-4 font-body text-sm tracking-[0.12em] text-cream-dim sm:text-base"
              >
                Shisha & Cocktail Lounge
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.6}
                className="mt-8 h-px w-24"
                style={{
                  background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
                }}
              />

              <motion.div variants={fadeUp} custom={0.8} className="mt-10">
                <Link
                  href="/menu"
                  className="group relative inline-flex items-center gap-2 rounded-none border border-gold/40 px-10 py-3.5 font-body text-sm font-medium uppercase tracking-[0.2em] text-gold transition-all duration-500 hover:bg-gold hover:text-dark hover:border-gold hover:shadow-glow-gold active:scale-[0.97]"
                >
                  <span className="relative z-10">Men&uuml; entdecken</span>
                  <svg
                    className="relative z-10 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </main>
        </PageTransition>
      )}
    </>
  );
}
