"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Smoke-particle letter assembler ─────────────────────────── */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface Particle {
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  size: number;
  delay: number;
  blur: number;
}

function SmokeParticle({ p, index }: { p: Particle; index: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: p.size,
        height: p.size,
        background: `radial-gradient(circle, rgba(201,168,76,${0.6 + seededRandom(index + 99) * 0.4}), rgba(201,168,76,0.1))`,
        boxShadow: `0 0 ${p.size * 3}px rgba(201,168,76,0.3)`,
        filter: `blur(${p.blur}px)`,
      }}
      initial={{
        x: p.startX,
        y: p.startY,
        opacity: 0,
        scale: 0.2,
        filter: `blur(${p.blur + 8}px)`,
      }}
      animate={{
        x: p.targetX,
        y: p.targetY,
        opacity: [0, 0.8, 1],
        scale: [0.2, 1.3, 1],
        filter: `blur(${p.blur}px)`,
      }}
      transition={{
        duration: 1.2,
        delay: p.delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}

function SmokeLetter({
  char,
  letterIndex,
}: {
  char: string;
  letterIndex: number;
}) {
  const particles = useMemo(() => {
    if (char === " ") return [];
    const count = 12 + Math.floor(seededRandom(letterIndex * 7) * 8);
    const result: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const seed = letterIndex * 100 + i;
      const angle = seededRandom(seed) * Math.PI * 2;
      const dist = 60 + seededRandom(seed + 1) * 120;
      result.push({
        targetX: -8 + seededRandom(seed + 2) * 16,
        targetY: -8 + seededRandom(seed + 3) * 16,
        startX: Math.cos(angle) * dist,
        startY: Math.sin(angle) * dist,
        size: 2 + seededRandom(seed + 4) * 4,
        delay: 0.15 + letterIndex * 0.06 + seededRandom(seed + 5) * 0.3,
        blur: seededRandom(seed + 6) * 2,
      });
    }
    return result;
  }, [char, letterIndex]);

  if (char === " ") {
    return <span className="inline-block w-4" />;
  }

  const letterDelay = 0.2 + letterIndex * 0.07;

  return (
    <span className="relative inline-block">
      {/* Particles swirl in */}
      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {particles.map((p, i) => (
          <SmokeParticle key={i} p={p} index={letterIndex * 100 + i} />
        ))}
      </span>

      {/* The actual letter materializes from smoke */}
      <motion.span
        className="relative inline-block text-gold-gradient"
        initial={{ opacity: 0, filter: "blur(20px)", scale: 1.2 }}
        animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        transition={{
          duration: 0.8,
          delay: letterDelay + 0.3,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {char}
      </motion.span>
    </span>
  );
}

/* ── Main loading screen ─────────────────────────────────────── */

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const text = "SMOKER BRO";

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-dark overflow-hidden"
        >
          {/* Background glow pulse */}
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(139,26,26,0.05) 50%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Smoke letters */}
          <h1
            className="relative font-heading text-4xl font-bold tracking-widest sm:text-5xl"
            style={{ fontSize: "clamp(2rem, 10vw, 3.5rem)" }}
          >
            {text.split("").map((char, i) => (
              <SmokeLetter key={i} char={char} letterIndex={i} />
            ))}
          </h1>

          {/* Tagline fades in after letters */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-5 font-body text-[11px] uppercase tracking-[0.4em] text-gold/50"
          >
            Shisha Lounge
          </motion.span>

          {/* Ember line */}
          <div className="mt-8 h-px w-20 overflow-hidden rounded-full bg-gold/10">
            <motion.div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #c9a84c, transparent)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.2,
                repeat: 2,
                ease: "easeInOut",
                delay: 1.2,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
