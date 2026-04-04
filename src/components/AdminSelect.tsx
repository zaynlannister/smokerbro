"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Hidden input for form validation
  return (
    <div ref={ref} className="relative">
      {required && (
        <input
          tabIndex={-1}
          value={value}
          onChange={() => {}}
          required
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between rounded-lg border bg-dark-lighter px-3 py-2.5 font-body text-sm transition-colors ${
          open ? "border-gold/40" : "border-gold/15"
        } ${selected ? "text-cream" : "text-cream-dark/50"}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder || "Select..."}</span>
        <svg
          className={`ml-2 h-4 w-4 shrink-0 text-cream-dark transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gold/15 bg-dark-lighter py-1 shadow-xl shadow-black/40 scrollbar-none">
          {placeholder && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full px-3 py-2 text-left font-body text-sm transition-colors hover:bg-gold/10 ${
                !value ? "text-gold" : "text-cream-dark/50"
              }`}
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-3 py-2 text-left font-body text-sm transition-colors hover:bg-gold/10 ${
                opt.value === value ? "text-gold bg-gold/5" : "text-cream"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
