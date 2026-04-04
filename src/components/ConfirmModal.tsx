"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
            <motion.div
              key="confirm-content"
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-crimson/20 bg-dark-light p-6 shadow-2xl shadow-black/50"
            >
              {/* Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-crimson/10">
                <svg className="h-6 w-6 text-crimson-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>

              <h3 className="mt-4 text-center font-heading text-lg font-semibold text-cream">
                {title}
              </h3>
              <p className="mt-2 text-center font-body text-sm text-cream-dark leading-relaxed">
                {message}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 rounded-lg border border-cream-dark/20 py-2.5 font-body text-sm text-cream-dark transition-colors hover:border-cream-dark/40 hover:text-cream"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-lg bg-crimson py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-crimson-light"
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
