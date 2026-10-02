"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type SharedLayoutDialogProps = {
  children: (props: { layoutId: string; open: () => void }) => ReactNode;
  content: (props: { layoutId: string; close: () => void }) => ReactNode;
};

export function SharedLayoutDialog({ children, content }: SharedLayoutDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const layoutId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "Tab") {
        const focusable = document.querySelectorAll<HTMLElement>(`[data-dialog="${layoutId}"] button, [data-dialog="${layoutId}"] a[href]`);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, layoutId]);

  const close = () => setIsOpen(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="block w-full appearance-none border-0 bg-transparent p-0 text-left"
      >
        {children({ layoutId, open: () => setIsOpen(true) })}
      </button>

      {mounted && createPortal(
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key={layoutId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#082e70]/95 p-4 md:p-8"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) close();
              }}
            >
              <motion.div
                layoutId={`dialog-${layoutId}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`dialog-title-${layoutId}`}
                data-dialog={layoutId}
                className="relative my-auto w-full max-w-3xl transform-gpu overflow-hidden rounded-[28px] bg-white text-slate-950 shadow-2xl shadow-blue-950/25 ring-1 ring-slate-950/10 will-change-transform"
                transition={{ type: "spring", damping: 32, stiffness: 340, mass: 0.7 }}
              >
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Tutup detail berita"
                  onClick={close}
                  className="absolute right-4 top-4 z-20 grid size-11 place-content-center rounded-full bg-slate-950/75 text-white backdrop-blur-md transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                >
                  <X className="size-5" />
                </button>
                {content({ layoutId, close })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

export function SharedLayout({ layoutId, className, children }: { layoutId: string; className?: string; children: ReactNode }) {
  return <motion.div layoutId={layoutId} className={cn(className)}>{children}</motion.div>;
}
