import type { ReactNode } from "react";
import Link from "next/link";

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      <header className="sticky top-0 z-30 border-b border-gold/10 bg-dark/80 px-5 py-3.5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <svg
              className="h-4 w-4 text-cream-dark transition-colors group-hover:text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <h1 className="font-heading text-lg font-semibold tracking-wide text-cream">
              SMOKER BRO
            </h1>
          </Link>
        </div>
      </header>
      {children}
      <div className="h-8" />
    </div>
  );
}
