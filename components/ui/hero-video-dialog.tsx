"use client";

import { cn } from "@/lib/utils";
import { Play, X } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out";

type HeroVideoDialogProps = {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailSrc: string;
  thumbnailAlt?: string;
  className?: string;
};

const animationVariants: Record<AnimationStyle, Variants> = {
  "from-bottom": { hidden: { y: "100%", opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
  "from-center": { hidden: { scale: 0.7, opacity: 0 }, visible: { scale: 1, opacity: 1 }, exit: { scale: 0.7, opacity: 0 } },
  "from-top": { hidden: { y: "-100%", opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: "-100%", opacity: 0 } },
  "from-left": { hidden: { x: "-100%", opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: "-100%", opacity: 0 } },
  "from-right": { hidden: { x: "100%", opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } },
  "top-in-bottom-out": { hidden: { y: "-100%", opacity: 0 }, visible: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } },
  "left-in-right-out": { hidden: { x: "-100%", opacity: 0 }, visible: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } },
};

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Thumbnail video",
  className,
}: HeroVideoDialogProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isVideoOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsVideoOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      triggerRef.current?.focus();
    };
  }, [isVideoOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Putar video profil SMKN 1 Cibinong"
        className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-[28px] bg-slate-950 p-0 text-left shadow-2xl outline-none ring-1 ring-white/10 focus-visible:ring-4 focus-visible:ring-blue-300"
        onClick={() => setIsVideoOpen(true)}
      >
        <Image
          src={thumbnailSrc}
          alt={thumbnailAlt}
          fill
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02] group-hover:brightness-75"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-slate-950/10" />
        <span className="absolute inset-0 grid place-content-center">
          <span className="grid size-24 place-content-center rounded-full bg-white/20 backdrop-blur-md transition duration-300 group-hover:scale-110 sm:size-28">
            <span className="grid size-16 place-content-center rounded-full bg-white text-blue-700 shadow-xl sm:size-20">
              <Play className="ml-1 size-7 fill-current sm:size-8" />
            </span>
          </span>
        </span>
        <span className="absolute bottom-5 left-5 rounded-full bg-black/55 px-4 py-2 text-xs font-medium text-white backdrop-blur-md sm:bottom-6 sm:left-6">
          Company Profile 2025
        </span>
      </button>

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Video profil SMKN 1 Cibinong"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsVideoOpen(false);
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#082e70]/95 p-4 backdrop-blur-md"
          >
            <motion.div
              variants={animationVariants[animationStyle]}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative aspect-video w-full max-w-5xl"
            >
              <button
                ref={closeRef}
                type="button"
                aria-label="Tutup video"
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-3 top-3 z-10 inline-flex h-10 items-center gap-2 rounded-full bg-blue-700 px-4 text-sm font-medium text-white shadow-xl ring-2 ring-white transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              >
                <X className="size-5" />
                <span>Tutup</span>
              </button>
              <div className="size-full overflow-hidden rounded-2xl border-4 border-blue-300 bg-black shadow-2xl shadow-blue-950/50">
                <iframe
                  src={videoSrc}
                  title="Company Profile SMKN 1 Cibinong 2025"
                  className="size-full"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
